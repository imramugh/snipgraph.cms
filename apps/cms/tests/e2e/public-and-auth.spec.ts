import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { BrowserContext } from "@playwright/test";

async function addAuthenticatedCookie(
  context: BrowserContext,
  baseURL: string,
) {
  await context.addCookies([
    {
      name: "__Secure-better-auth.session_token",
      value: process.env.E2E_SESSION_COOKIE!,
      url: baseURL,
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    },
  ]);
}

test("published content is public, semantic, and not editable anonymously", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("[data-cms-entry]")).toHaveCount(1);
  await expect(page.locator("[data-cms-block]")).not.toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Edit / })).toHaveCount(0);

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    ),
  ).toEqual([]);
});

test("the reference catalog provides interactive visual specimens", async ({ page }) => {
  await page.goto("/reference");

  await expect(page.getByRole("heading", { name: "See the pattern before you use it." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Screens", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Flows", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Patterns", exact: true })).toBeVisible();
  await expect(page.locator(".visual-category-tabs").getByRole("heading", { name: "Blocks", exact: true })).toBeVisible();
  await expect(page.getByTitle(/Hero.+preview/)).toBeVisible();

  await page.getByRole("button", { name: /Feature grid.+marketing\.feature-grid\.v1/ }).click();
  await page.getByLabel("Preview variant").selectOption("with-code-example-panel");
  await expect(page.getByTitle(/Feature grid.+With Code Example Panel preview/)).toHaveAttribute("src", /with-code-example-panel/);
  await page.getByRole("button", { name: "Mobile preview" }).click();
  await expect.poll(() => page.locator(".visual-browser").evaluate((element) => element.getBoundingClientRect().width)).toBeLessThanOrEqual(392);

  await page.getByRole("button", { name: /Patterns.+specimens/ }).click();
  await expect(page.getByText("pattern.inline-editing.v1")).toBeVisible();
  await page.getByRole("button", { name: /Inline editing.+pattern\.inline-editing\.v1/ }).click();
  await expect(page.getByText("Edit selected block")).toBeVisible();

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
});

test("admin access redirects to both configured interactive OAuth choices", async ({
  page,
}) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with LinkedIn" })).toBeVisible();
});

test("MCP discovery advertises scopes and unauthenticated calls are challenged", async ({
  request,
  baseURL,
}) => {
  const metadata = await request.get("/.well-known/oauth-protected-resource/mcp");
  expect(metadata.ok()).toBe(true);
  const document = await metadata.json();
  expect(document.scopes_supported).toEqual(
    expect.arrayContaining(["cms:content:read", "cms:content:write", "cms:publish"]),
  );

  const challenge = await request.post("/mcp", { data: {} });
  expect(challenge.status()).toBe(401);
  expect(challenge.headers()["www-authenticate"]).toContain("Bearer");

  const wrongOrigin = await request.post("/api/pages", {
    headers: { origin: "https://example.invalid" },
    data: {},
  });
  expect(wrongOrigin.status()).toBe(403);

  const anonymousMutation = await request.post("/api/pages", {
    headers: { origin: new URL(baseURL!).origin },
    data: {},
  });
  expect(anonymousMutation.status()).toBe(401);
});

test("an authenticated owner can compose, preview, publish, and edit inline", async ({
  browser,
  context,
  page,
  baseURL,
}, testInfo) => {
  test.setTimeout(180_000);
  test.skip(!process.env.E2E_SESSION_COOKIE || !process.env.E2E_PAGE_SLUG);
  const origin = new URL(baseURL!).origin;
  const slug = `${process.env.E2E_PAGE_SLUG!}-${testInfo.project.name}`;
  await addAuthenticatedCookie(context, origin);

  await page.goto("/admin/settings");
  await expect(page.getByRole("heading", { name: "Site settings" })).toBeVisible();
  expect(await page.locator(".settings-section input").first().evaluate((element) => getComputedStyle(element).fontWeight)).toBe("400");
  expect(await page.locator(".settings-section label").first().evaluate((element) => getComputedStyle(element).fontWeight)).toBe("500");
  expect(await page.locator(".settings-section h2").first().evaluate((element) => getComputedStyle(element).fontWeight)).toBe("600");
  await expect(page.getByLabel("Display type font family")).toHaveValue("Playfair Display");
  await expect(page.getByLabel("Header variant")).toBeVisible();
  await page.getByRole("button", { name: /Edit Canvas color/ }).click();
  await expect(page.getByLabel("Canvas hexadecimal value")).toHaveValue("#FDFCF8");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Change appearance" }).click();
  await page.getByRole("menuitem", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  const darkAccessibility = await new AxeBuilder({ page }).analyze();
  expect(darkAccessibility.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  await page.getByRole("button", { name: "Change appearance" }).click();
  await page.getByRole("menuitem", { name: "System" }).click();

  const mediaRunId = `${Date.now()}-${testInfo.project.name}`;
  const mediaFilename = `e2e-catalog-${mediaRunId}.png`;
  const croppedMediaFilename = `e2e-catalog-${mediaRunId}-cropped.jpg`;
  await page.goto("/admin/media");
  await page.getByRole("button", { name: "Upload and crop" }).click();
  await page.getByLabel("Image", { exact: true }).setInputFiles({
    name: mediaFilename,
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64"),
  });
  await page.getByLabel("Alternative text").fill("A tiny image used by the browser contract");
  await page.getByRole("button", { name: "Save and use image" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button").filter({ hasText: croppedMediaFilename }).first().click();
  await expect(page.getByRole("dialog").getByText(croppedMediaFilename, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close file details" }).click();

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Pages", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "New page" }).click();
  await expect(page).toHaveURL(/\/admin\/pages\/new$/);
  await page.getByLabel("Title", { exact: true }).fill("MVP browser verification");
  await page.getByLabel("Path").fill(slug);
  await page
    .getByRole("textbox", { name: "Description", exact: true })
    .fill("A disposable UAT page that verifies the complete owner workflow.");
  await page.getByRole("button", { name: "Create draft" }).click();
  await expect(page).toHaveURL(/\/admin\/pages\/[0-9a-f-]+$/);

  const addBlock = async (type: string, _expectedCount: number) => {
    void _expectedCount;
    const openOutline = page.getByRole("button", { name: "Open block outline" });
    if (await openOutline.isVisible()) await openOutline.click();
    const outline = page.locator(".block-outline:visible");
    await outline.getByLabel("Block type").selectOption(type);
    await outline.getByRole("button", { name: "Add block" }).click();
    await expect(page.locator(".selected-block code")).toContainText(type);
  };

  await page.getByLabel("Heading").fill("Browser-tested hero");
  await addBlock("content.rich-text", 2);
  await page.getByLabel("Heading").fill("Browser-tested rich text");
  await addBlock("marketing.feature-grid", 3);
  await page.getByLabel("Heading").fill("Browser-tested features");
  await addBlock("marketing.cta", 4);
  await page.getByLabel("Heading").fill("Browser-tested call to action");
  await addBlock("media.image", 5);
  await page.getByRole("button", { name: /Choose or upload image/ }).click();
  await page.getByRole("dialog").getByRole("button").filter({ hasText: croppedMediaFilename }).click();
  await addBlock("marketing.stats", 6);
  await page.getByLabel("Heading").fill("Browser-tested statistics");
  await addBlock("marketing.testimonial", 7);
  await page.getByLabel("Quotation").fill("This catalog works from authoring through publication.");
  await addBlock("marketing.logo-cloud", 8);
  await page.getByRole("button", { name: /Choose or upload image/ }).click();
  await page.getByRole("dialog").getByRole("button").filter({ hasText: croppedMediaFilename }).click();
  await addBlock("content.project-grid", 9);
  await page.getByLabel("Heading").fill("Browser-tested projects");
  await addBlock("content.contact", 10);
  await page.getByLabel("Heading").fill("Browser-tested contact");
  await page.getByLabel("Email").fill("hello@example.com");
  await addBlock("marketing.bento-grid", 11);
  await page.getByLabel("Heading").fill("Browser-tested bento grid");
  await addBlock("content.blog", 12);
  await page.getByLabel("Heading").fill("Browser-tested blog posts");
  await addBlock("marketing.faq", 13);
  await page.getByLabel("Heading").fill("Browser-tested questions");
  await addBlock("marketing.page-header", 14);
  await page.getByLabel("Heading").fill("Browser-tested page header");
  await addBlock("marketing.newsletter", 15);
  await page.getByLabel("Heading").fill("Browser-tested newsletter");
  await addBlock("marketing.pricing", 16);
  await page.getByLabel("Heading").fill("Browser-tested pricing");
  await addBlock("content.team", 17);
  await page.getByLabel("Heading").fill("Browser-tested team");

  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByText("Draft revision 2 saved")).toBeVisible();

  const previewPromise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Preview" }).click();
  const preview = await previewPromise;
  await expect(preview.getByRole("heading", { name: "Browser-tested hero" })).toBeVisible();
  await preview.close();

  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Revision 2 published")).toBeVisible();

  await page.goto(slug);
  await expect(page.getByText("Inline editor")).toBeVisible();
  await page.getByRole("button", { name: "Edit marketing.hero" }).click();
  const panel = page.getByRole("complementary", { name: "Edit selected block" });
  await panel.getByLabel("Heading").fill("Inline-tested hero");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByText("Draft revision 3 saved")).toBeVisible();
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Revision 3 published")).toBeVisible();

  const anonymous = await browser.newContext();
  const publishedPage = await anonymous.newPage();
  await publishedPage.goto(`${origin}${slug}`);
  await expect(
    publishedPage.getByRole("heading", { name: "Inline-tested hero" }),
  ).toBeVisible();
  await expect(publishedPage.getByRole("heading", { name: "Browser-tested statistics" })).toBeVisible();
  await expect(publishedPage.getByText("This catalog works from authoring through publication.")).toBeVisible();
  await expect(publishedPage.getByRole("heading", { name: "Browser-tested projects" })).toBeVisible();
  await expect(publishedPage.getByRole("heading", { name: "Browser-tested bento grid" })).toBeVisible();
  await expect(publishedPage.getByRole("heading", { name: "Browser-tested blog posts" })).toBeVisible();
  await expect(publishedPage.getByRole("heading", { name: "Browser-tested questions" })).toBeVisible();
  await expect(publishedPage.getByRole("heading", { name: "Browser-tested page header" })).toBeVisible();
  await expect(publishedPage.getByRole("heading", { name: "Browser-tested newsletter" })).toBeVisible();
  await expect(publishedPage.getByRole("heading", { name: "Browser-tested pricing" })).toBeVisible();
  await expect(publishedPage.getByRole("heading", { name: "Browser-tested team" })).toBeVisible();
  await expect(publishedPage.getByRole("link", { name: "hello@example.com" })).toBeVisible();
  await expect(publishedPage.getByText("Inline editor")).toHaveCount(0);
  await anonymous.close();

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    ),
  ).toEqual([]);
});
