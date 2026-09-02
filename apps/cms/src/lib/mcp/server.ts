import {
  McpServer,
  ResourceNotFoundError,
  ResourceTemplate,
  type AuthInfo,
  type CallToolResult,
} from "@modelcontextprotocol/server";
import {
  blockCatalog,
  defaultTheme,
  marketingCatalog,
  marketingCatalogSummary,
  mediaInputSchema,
  pageValueSchema,
  pageRecipes,
  siteSettingsValueSchema,
  type ContentService,
  type PageAuditEvent,
  type PageRecord,
  type PageRepository,
  type PageRevision,
} from "@snipgraph/content-domain";
import { z } from "zod";
import { contentService, pageRepository, siteSettingsRepository, siteSettingsService } from "../content";
import { createMedia, listMedia, updateMediaMetadata } from "../media";
import { defaultSite } from "../site";
import { fail, guard, ok } from "./result";

const referenceCatalog = {
  version: 2,
  rule:
    "Every feature packet must reference an existing catalog pattern, or introduce and document a new one before implementation.",
  screens: [
    "screen.content-list.v1",
    "screen.content-editor.v1",
    "screen.page-create.v1",
    "screen.revision-history.v1",
    "screen.site-settings.v1",
    "screen.media-library.v1",
    "screen.theme-settings.v1",
  ],
  flows: ["flow.draft-publish.v1", "flow.mcp-content-operation.v1"],
  patterns: [
    "pattern.block-composer.v1",
    "pattern.inline-editing.v1",
    "pattern.revision-conflict.v1",
    "pattern.admin-typography.v1",
    "pattern.media-picker.v1",
    "pattern.personal-site-blocks.v1",
    "pattern.exhaustive-marketing-catalog.v1",
    "pattern.page-recipes.v1",
    "pattern.site-chrome.v1",
    "pattern.governed-theme.v1",
  ],
};

export interface CmsMcpDependencies {
  repository: PageRepository;
  service: ContentService;
  defaultSite: () => Promise<{ id: string }>;
  settingsRepository?: typeof siteSettingsRepository;
  settingsService?: typeof siteSettingsService;
  listMedia?: typeof listMedia;
  createMedia?: typeof createMedia;
  updateMediaMetadata?: typeof updateMediaMetadata;
}

const productionDependencies: CmsMcpDependencies = {
  repository: pageRepository,
  service: contentService,
  defaultSite,
  settingsRepository: siteSettingsRepository,
  settingsService: siteSettingsService,
  listMedia,
  createMedia,
  updateMediaMetadata,
};

function actor(authInfo: AuthInfo) {
  return {
    id: String(authInfo.extra?.userId ?? authInfo.clientId),
    source: "mcp" as const,
  };
}

function requireScope(authInfo: AuthInfo, scope: string): CallToolResult | undefined {
  return authInfo.scopes.includes(scope)
    ? undefined
    : fail(`This operation requires the ${scope} scope.`);
}

function publicRevision(revision: PageRevision) {
  return { ...revision, createdAt: revision.createdAt.toISOString() };
}

function publicAuditEvent(event: PageAuditEvent) {
  return { ...event, createdAt: event.createdAt.toISOString() };
}

function publicPage(page: PageRecord | null) {
  if (!page) return null;
  return {
    ...page,
    updatedAt: page.updatedAt.toISOString(),
    draftRevision: publicRevision(page.draftRevision),
    publishedRevision: page.publishedRevision ? publicRevision(page.publishedRevision) : null,
  };
}

export function createCmsMcpServer(
  authInfo: AuthInfo,
  dependencies: CmsMcpDependencies = productionDependencies,
) {
  const server = new McpServer(
    {
      name: "snipgraph-cms",
      title: "Snipgraph CMS",
      version: process.env.APP_VERSION ?? "dev",
    },
    {
      instructions:
        "Manage block-based website content. Read reference://catalog before creating or changing content. All writes create drafts; publishing is a separate explicit operation.",
    },
  );

  server.registerResource(
    "reference-catalog",
    "reference://catalog",
    {
      title: "Snipgraph reference catalog",
      description: "The screen, flow, and interaction patterns governing implementation.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(referenceCatalog, null, 2),
        },
      ],
    }),
  );

  server.registerResource(
    "site-settings",
    "cms://site/settings",
    {
      title: "Site settings",
      description: "Draft and published site identity, navigation, footer, SEO, social links, and redirects.",
      mimeType: "application/json",
    },
    async (uri) => {
      if (!authInfo.scopes.includes("cms:content:read")) {
        throw new Error("This resource requires the cms:content:read scope.");
      }
      const currentSite = await dependencies.defaultSite();
      const settings = await (dependencies.settingsRepository ?? siteSettingsRepository).find(currentSite.id);
      return { contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(settings, null, 2) }] };
    },
  );

  server.registerResource(
    "block-catalog",
    "cms://catalog/blocks",
    {
      title: "CMS block catalog",
      description: "The supported page blocks, versions, labels, and intended uses.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(blockCatalog, null, 2),
        },
      ],
    }),
  );

  server.registerResource(
    "marketing-catalog",
    "cms://catalog/marketing",
    {
      title: "Exhaustive Marketing pattern catalog",
      description: "All governed section, element, system-screen, and page-recipe variants.",
      mimeType: "application/json",
    },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify({ summary: marketingCatalogSummary, entries: marketingCatalog }, null, 2) }] }),
  );

  server.registerResource(
    "page-recipes",
    "cms://catalog/page-recipes",
    {
      title: "Page recipe catalog",
      description: "Editable starting compositions built from governed block variants.",
      mimeType: "application/json",
    },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(pageRecipes, null, 2) }] }),
  );

  server.registerResource(
    "theme-catalog",
    "cms://catalog/theme",
    {
      title: "Governed theme contract",
      description: "Typography roles, semantic palette defaults, and named scheme policy.",
      mimeType: "application/json",
    },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify({ defaults: defaultTheme, schemes: ["default", "muted", "brand", "dark", "image"] }, null, 2) }] }),
  );

  server.registerResource(
    "media-catalog",
    "cms://media",
    {
      title: "CMS media catalog",
      description: "Reusable image assets with stable IDs and accessible metadata.",
      mimeType: "application/json",
    },
    async (uri) => {
      if (!authInfo.scopes.includes("cms:content:read")) {
        throw new Error("This resource requires the cms:content:read scope.");
      }
      const currentSite = await dependencies.defaultSite();
      const assets = await (dependencies.listMedia ?? listMedia)(currentSite.id);
      return { contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(assets, null, 2) }] };
    },
  );

  server.registerResource(
    "page-history",
    new ResourceTemplate("cms://pages/{pageId}/history", { list: undefined }),
    {
      title: "Page revision history",
      description: "Immutable revisions and attributed audit events for one page.",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      if (!authInfo.scopes.includes("cms:content:read")) {
        throw new Error("This resource requires the cms:content:read scope.");
      }
      const pageId = String(variables.pageId);
      const page = await dependencies.repository.findById(pageId);
      if (!page) throw new ResourceNotFoundError(uri.href);
      const [revisions, auditEvents] = await Promise.all([
        dependencies.repository.listRevisions(pageId),
        dependencies.repository.listAuditEvents(pageId),
      ]);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                pageId,
                revisions: revisions.map(publicRevision),
                auditEvents: auditEvents.map(publicAuditEvent),
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.registerTool(
    "list_pages",
    {
      title: "List pages",
      description: "List the draft and publication state of every page.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true },
    },
    async () =>
      guard(async () => {
        const denied = requireScope(authInfo, "cms:content:read");
        if (denied) return denied;
        const site = await dependencies.defaultSite();
        return ok((await dependencies.repository.list(site.id)).map(publicPage));
      }),
  );

  server.registerTool(
    "read_page",
    {
      title: "Read page",
      description: "Read a page including its current draft and published revision.",
      inputSchema: z.object({ pageId: z.string().uuid() }),
      annotations: { readOnlyHint: true },
    },
    async ({ pageId }) =>
      guard(async () => {
        const denied = requireScope(authInfo, "cms:content:read");
        if (denied) return denied;
        const page = publicPage(await dependencies.repository.findById(pageId));
        return page ? ok(page) : fail(`Page ${pageId} was not found.`);
      }),
  );

  server.registerTool(
    "read_page_history",
    {
      title: "Read page history",
      description: "Read immutable revisions and attributed audit events for a page.",
      inputSchema: z.object({ pageId: z.string().uuid() }),
      annotations: { readOnlyHint: true },
    },
    async ({ pageId }) =>
      guard(async () => {
        const denied = requireScope(authInfo, "cms:content:read");
        if (denied) return denied;
        const page = await dependencies.repository.findById(pageId);
        if (!page) return fail(`Page ${pageId} was not found.`);
        const [revisions, auditEvents] = await Promise.all([
          dependencies.repository.listRevisions(pageId),
          dependencies.repository.listAuditEvents(pageId),
        ]);
        return ok({
          pageId,
          revisions: revisions.map(publicRevision),
          auditEvents: auditEvents.map(publicAuditEvent),
        });
      }),
  );

  server.registerTool(
    "create_page_draft",
    {
      title: "Create page draft",
      description: "Create a new page as a draft. This never publishes content.",
      inputSchema: z.object({ value: pageValueSchema }),
      annotations: { destructiveHint: false },
    },
    async ({ value }) =>
      guard(async () => {
        const denied = requireScope(authInfo, "cms:content:write");
        if (denied) return denied;
        const site = await dependencies.defaultSite();
        return ok(
          publicPage(
            await dependencies.service.createPageDraft({
              siteId: site.id,
              value,
              actor: actor(authInfo),
            }),
          ),
        );
      }),
  );

  server.registerTool(
    "update_page_draft",
    {
      title: "Update page draft",
      description:
        "Append a validated draft revision. expectedSequence prevents lost updates.",
      inputSchema: z.object({
        pageId: z.string().uuid(),
        expectedSequence: z.number().int().positive(),
        value: pageValueSchema,
      }),
      annotations: { destructiveHint: false },
    },
    async ({ pageId, expectedSequence, value }) =>
      guard(async () => {
        const denied = requireScope(authInfo, "cms:content:write");
        if (denied) return denied;
        return ok(
          publicPage(
            await dependencies.service.updatePageDraft({
              pageId,
              expectedSequence,
              value,
              actor: actor(authInfo),
            }),
          ),
        );
      }),
  );

  server.registerTool(
    "publish_page",
    {
      title: "Publish page",
      description:
        "Publish the exact draft revision identified by expectedSequence.",
      inputSchema: z.object({
        pageId: z.string().uuid(),
        expectedSequence: z.number().int().positive(),
      }),
      annotations: { destructiveHint: true },
    },
    async ({ pageId, expectedSequence }) =>
      guard(async () => {
        const denied = requireScope(authInfo, "cms:publish");
        if (denied) return denied;
        return ok(
          publicPage(
            await dependencies.service.publishPage({
              pageId,
              expectedSequence,
              actor: actor(authInfo),
            }),
          ),
        );
      }),
  );

  server.registerTool(
    "read_site_settings",
    {
      title: "Read site settings",
      description: "Read draft and published site-wide presentation settings.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true },
    },
    async () => guard(async () => {
      const denied = requireScope(authInfo, "cms:content:read");
      if (denied) return denied;
      const currentSite = await dependencies.defaultSite();
      return ok(await (dependencies.settingsRepository ?? siteSettingsRepository).find(currentSite.id));
    }),
  );

  server.registerTool(
    "update_site_settings_draft",
    {
      title: "Update site settings draft",
      description: "Append a validated site settings draft revision without changing the public site.",
      inputSchema: z.object({ expectedSequence: z.number().int().positive(), value: siteSettingsValueSchema }),
      annotations: { destructiveHint: false },
    },
    async ({ expectedSequence, value }) => guard(async () => {
      const denied = requireScope(authInfo, "cms:content:write");
      if (denied) return denied;
      const currentSite = await dependencies.defaultSite();
      return ok(await (dependencies.settingsService ?? siteSettingsService).updateDraft({
        siteId: currentSite.id,
        expectedSequence,
        value,
        actor: actor(authInfo),
      }));
    }),
  );

  server.registerTool(
    "publish_site_settings",
    {
      title: "Publish site settings",
      description: "Publish the exact site settings draft identified by expectedSequence.",
      inputSchema: z.object({ expectedSequence: z.number().int().positive() }),
      annotations: { destructiveHint: true },
    },
    async ({ expectedSequence }) => guard(async () => {
      const denied = requireScope(authInfo, "cms:publish");
      if (denied) return denied;
      const currentSite = await dependencies.defaultSite();
      return ok(await (dependencies.settingsService ?? siteSettingsService).publish({
        siteId: currentSite.id,
        expectedSequence,
        actor: actor(authInfo),
      }));
    }),
  );

  server.registerTool(
    "list_media",
    {
      title: "List media",
      description: "List reusable image assets and their accessible metadata.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true },
    },
    async () => guard(async () => {
      const denied = requireScope(authInfo, "cms:content:read");
      if (denied) return denied;
      const currentSite = await dependencies.defaultSite();
      return ok(await (dependencies.listMedia ?? listMedia)(currentSite.id));
    }),
  );

  server.registerTool(
    "upload_media",
    {
      title: "Upload media",
      description: "Upload a validated image from base64 bytes. Maximum decoded size is 10 MB.",
      inputSchema: mediaInputSchema.extend({
        base64: z.string().min(1).max(14_000_000),
      }),
      annotations: { destructiveHint: false },
    },
    async ({ filename, altText, decorative, base64 }) => guard(async () => {
      const denied = requireScope(authInfo, "cms:content:write");
      if (denied) return denied;
      const currentSite = await dependencies.defaultSite();
      return ok(await (dependencies.createMedia ?? createMedia)({
        siteId: currentSite.id,
        filename,
        altText,
        decorative,
        bytes: new Uint8Array(Buffer.from(base64, "base64")),
        actor: actor(authInfo),
      }));
    }),
  );

  server.registerTool(
    "update_media_metadata",
    {
      title: "Update media metadata",
      description: "Update accessible metadata for an existing image asset.",
      inputSchema: z.object({ mediaId: z.string().uuid(), altText: z.string().max(500), decorative: z.boolean() }),
      annotations: { destructiveHint: false },
    },
    async ({ mediaId, altText, decorative }) => guard(async () => {
      const denied = requireScope(authInfo, "cms:content:write");
      if (denied) return denied;
      const currentSite = await dependencies.defaultSite();
      const updated = await (dependencies.updateMediaMetadata ?? updateMediaMetadata)({
        siteId: currentSite.id,
        id: mediaId,
        altText,
        decorative,
        actor: actor(authInfo),
      });
      return updated ? ok(updated) : fail(`Media ${mediaId} was not found.`);
    }),
  );

  return server;
}
