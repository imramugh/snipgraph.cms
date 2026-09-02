import Link from "next/link";
import { defaultSiteChrome, defaultTheme, siteSettingsValueSchema } from "@snipgraph/content-domain";
import { publishedSiteSettings } from "@/lib/site";
import { googleFontsUrl, publicThemeStyle } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function NotFound() {
  const settings = process.env.AUTH_BUILD_MODE === "true"
    ? siteSettingsValueSchema.parse({ siteName: "Snipgraph CMS", tagline: "", footerText: "", navigation: [], socialLinks: [], footerGroups: [], defaultSeo: { titleTemplate: "%s — Snipgraph CMS", description: "Snipgraph CMS" }, redirects: [], theme: defaultTheme, chrome: defaultSiteChrome })
    : await publishedSiteSettings();
  const variant = settings.chrome.notFoundVariant;
  const imageId = settings.defaultSeo.socialImageMediaId;
  return <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="stylesheet" href={googleFontsUrl(settings.theme)} />
    <main className="site-shell not-found-screen" style={publicThemeStyle(settings.theme)} data-variant={variant}>
      {variant === "with-navbar-and-footer" && <nav className="not-found-nav" aria-label="Primary navigation"><Link className="brand" href="/">{settings.siteName}</Link>{settings.navigation.map((item) => <Link href={item.href} key={item.id}>{item.label}</Link>)}</nav>}
      {imageId && variant.includes("image") && <img className="not-found-image" src={`/api/media/${imageId}`} alt="" />}
      <section><p className="eyebrow">404</p><h1>Page not found</h1><p className="lede">The page may have moved, or the address may be incomplete.</p><Link className="button primary" href="/">Return home</Link>{variant === "with-popular-pages" && <nav className="popular-pages" aria-label="Popular pages">{settings.navigation.slice(0, 6).map((item) => <Link href={item.href} key={item.id}>{item.label}</Link>)}</nav>}</section>
      {variant === "with-navbar-and-footer" && <footer>{settings.footerText}</footer>}
    </main>
  </>;
}
