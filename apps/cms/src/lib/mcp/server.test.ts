import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import type { AuthInfo } from "@modelcontextprotocol/server";
import {
  ContentService,
  RevisionConflictError,
  type Actor,
  type PageAuditEvent,
  type PageRecord,
  type PageRepository,
  type PageRevision,
  type PageValue,
  type PublishedPage,
} from "@snipgraph/content-domain";
import { afterEach, describe, expect, it } from "vitest";
import { createCmsMcpServer } from "./server";

const SITE_ID = "00000000-0000-4000-8000-000000000001";
const PAGE_ID = "00000000-0000-4000-8000-000000000002";
const REVISION_ID = "00000000-0000-4000-8000-000000000003";
const NOW = new Date("2026-09-01T12:00:00.000Z");

const value: PageValue = {
  title: "Home",
  slug: "/",
  description: "The home page",
  blocks: [
    {
      id: "hero-1",
      type: "marketing.hero",
      version: 1,
      data: { heading: "Welcome", body: "A structured home page." },
    },
  ],
};

class MemoryPageRepository implements PageRepository {
  page: PageRecord | null = null;
  revisions: PageRevision[] = [];
  events: PageAuditEvent[] = [];

  async list(siteId: string) {
    return this.page?.siteId === siteId ? [this.page] : [];
  }

  async findById(pageId: string) {
    return this.page?.id === pageId ? this.page : null;
  }

  async findPublishedBySlug(siteId: string, slug: string): Promise<PublishedPage | null> {
    if (
      this.page?.siteId !== siteId ||
      this.page.publishedRevision?.value.slug !== slug
    ) {
      return null;
    }
    return { id: this.page.id, siteId, revision: this.page.publishedRevision };
  }

  async listRevisions(pageId: string) {
    return this.page?.id === pageId ? [...this.revisions].reverse() : [];
  }

  async listAuditEvents(pageId: string) {
    return this.page?.id === pageId ? [...this.events].reverse() : [];
  }

  async createDraft(input: { siteId: string; value: PageValue; actor: Actor }) {
    const revision = this.revision(1, input.value, input.actor);
    this.revisions.push(revision);
    this.events.push(this.event("content.draft.created", input.actor, revision.id));
    this.page = {
      id: PAGE_ID,
      siteId: input.siteId,
      updatedAt: NOW,
      draftRevision: revision,
      publishedRevision: null,
    };
    return this.page;
  }

  async appendDraft(input: {
    pageId: string;
    expectedSequence: number;
    value: PageValue;
    actor: Actor;
  }) {
    if (!this.page || this.page.draftRevision.sequence !== input.expectedSequence) {
      throw new RevisionConflictError(this.page?.draftRevision.sequence);
    }
    const revision = this.revision(input.expectedSequence + 1, input.value, input.actor);
    this.revisions.push(revision);
    this.events.push(this.event("content.draft.updated", input.actor, revision.id));
    this.page = { ...this.page, draftRevision: revision };
    return this.page;
  }

  async publish(input: { pageId: string; expectedSequence: number; actor: Actor }) {
    if (!this.page || this.page.draftRevision.sequence !== input.expectedSequence) {
      throw new RevisionConflictError(this.page?.draftRevision.sequence);
    }
    this.events.push(
      this.event("content.published", input.actor, this.page.draftRevision.id),
    );
    this.page = { ...this.page, publishedRevision: this.page.draftRevision };
    return this.page;
  }

  private revision(sequence: number, nextValue: PageValue, actor: Actor): PageRevision {
    return {
      id: sequence === 1 ? REVISION_ID : `00000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`,
      pageId: PAGE_ID,
      sequence,
      schemaVersion: 2,
      value: nextValue,
      createdAt: NOW,
      createdBy: actor.id,
      source: actor.source,
    };
  }

  private event(action: string, actor: Actor, revisionId: string): PageAuditEvent {
    return {
      id: `event-${this.events.length + 1}`,
      action,
      actorId: actor.id,
      source: actor.source,
      revisionId,
      metadata: {},
      createdAt: NOW,
    };
  }
}

const clients: Client[] = [];

afterEach(async () => {
  await Promise.all(clients.splice(0).map((client) => client.close()));
});

async function connectedClient(scopes: string[], repository = new MemoryPageRepository()) {
  const authInfo: AuthInfo = {
    token: "test-token",
    clientId: "test-client",
    scopes,
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
    extra: { userId: "user-1" },
  };
  const server = createCmsMcpServer(authInfo, {
    repository,
    service: new ContentService(repository),
    defaultSite: async () => ({ id: SITE_ID }),
  });
  const client = new Client({ name: "cms-contract-test", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  clients.push(client);
  return { client, repository };
}

describe("CMS MCP contract", () => {
  it("advertises the catalog, history, and mutation tools", async () => {
    const { client } = await connectedClient(["cms:content:read"]);

    const tools = await client.listTools();
    expect(tools.tools.map((tool) => tool.name)).toEqual(
      expect.arrayContaining([
        "list_pages",
        "read_page",
        "read_page_history",
        "create_page_draft",
        "update_page_draft",
        "publish_page",
        "read_site_settings",
        "update_site_settings_draft",
        "publish_site_settings",
        "list_media",
        "upload_media",
        "update_media_metadata",
      ]),
    );

    const resource = await client.readResource({ uri: "cms://catalog/blocks" });
    expect(JSON.stringify(resource.contents)).toContain("marketing.feature-grid");
    const marketing = await client.readResource({ uri: "cms://catalog/marketing" });
    const marketingPayload = JSON.parse((marketing.contents[0] as { text: string }).text);
    expect(marketingPayload.summary.total).toBe(179);
    const recipes = await client.readResource({ uri: "cms://catalog/page-recipes" });
    expect((recipes.contents[0] as { text: string }).text).toContain("landing.with-screenshots-and-stats");
    const theme = await client.readResource({ uri: "cms://catalog/theme" });
    expect((theme.contents[0] as { text: string }).text).toContain("Playfair Display");

    const templates = await client.listResourceTemplates();
    expect(templates.resourceTemplates.map((template) => template.uriTemplate)).toContain(
      "cms://pages/{pageId}/history",
    );
  });

  it("enforces scopes before a write", async () => {
    const { client } = await connectedClient(["cms:content:read"]);

    const result = await client.callTool({
      name: "create_page_draft",
      arguments: { value },
    });

    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain("cms:content:write");
  });

  it("creates, updates, publishes, and attributes page history", async () => {
    const { client } = await connectedClient([
      "cms:content:read",
      "cms:content:write",
      "cms:publish",
    ]);

    const created = await client.callTool({
      name: "create_page_draft",
      arguments: { value },
    });
    expect(created.isError).not.toBe(true);

    const updated = await client.callTool({
      name: "update_page_draft",
      arguments: {
        pageId: PAGE_ID,
        expectedSequence: 1,
        value: { ...value, title: "Updated home" },
      },
    });
    expect(updated.isError).not.toBe(true);

    const published = await client.callTool({
      name: "publish_page",
      arguments: { pageId: PAGE_ID, expectedSequence: 2 },
    });
    expect(published.isError).not.toBe(true);

    const history = await client.callTool({
      name: "read_page_history",
      arguments: { pageId: PAGE_ID },
    });
    expect(history.isError).not.toBe(true);
    expect(JSON.stringify(history.structuredContent)).toContain("content.published");
    expect(JSON.stringify(history.structuredContent)).toContain("user-1");
    expect(JSON.stringify(history.structuredContent)).toContain(NOW.toISOString());

    const historyResource = await client.readResource({
      uri: `cms://pages/${PAGE_ID}/history`,
    });
    expect(JSON.stringify(historyResource.contents)).toContain("content.published");
  });
});
