import type { PageValue, SiteSettingsValue } from "@snipgraph/content-domain";
import Link from "next/link";
import { googleFontsUrl, publicThemeStyle } from "../../lib/theme";
import { BlockRenderer } from "./block-renderer";
import { SiteBanner } from "./site-banner";

function PublicLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return href.startsWith("/") ? <Link className={className} href={href}>{children}</Link> : <a className={className} href={href}>{children}</a>;
}

export function PageRenderer({
  pageId,
  revisionId,
  value,
  settings,
}: {
  pageId: string;
  revisionId: string;
  value: PageValue;
  settings: SiteSettingsValue;
}) {
  return (<>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link rel="stylesheet" href={googleFontsUrl(settings.theme)} />
    <main className="site-shell" style={publicThemeStyle(settings.theme)} data-cms-entry={pageId} data-cms-revision={revisionId}>
      <SiteBanner banner={settings.chrome.banner} />
      <header className="public-header" data-variant={settings.chrome.headerVariant}>
        <nav className="topbar" aria-label="Primary navigation">
          <Link className="brand site-brand" href="/">{settings.logoMediaId && <img src={`/api/media/${settings.logoMediaId}`} alt="" />}{settings.siteName}</Link>
          <div className="desktop-navigation">{settings.navigation.map((item) => item.children?.length ? <details className="nav-flyout" data-variant={settings.chrome.flyoutVariant} key={item.id}><summary>{item.label}</summary><div>{item.children.map((child) => <PublicLink href={child.href} key={child.id}><strong>{child.label}</strong>{child.description && <span>{child.description}</span>}</PublicLink>)}</div></details> : <PublicLink href={item.href} key={item.id}>{item.label}</PublicLink>)}</div>
          <PublicLink className="header-cta" href={settings.chrome.headerCta.href}>{settings.chrome.headerCta.label}</PublicLink>
          <details className="mobile-navigation"><summary aria-label="Open navigation">Menu</summary><div>{settings.navigation.map((item) => <div key={item.id}><PublicLink href={item.href}>{item.label}</PublicLink>{item.children?.map((child) => <PublicLink href={child.href} key={child.id}>{child.label}</PublicLink>)}</div>)}</div></details>
        </nav>
      </header>
      {value.blocks.map((block) => <BlockRenderer block={block} key={block.id} />)}
      <footer className="site-footer" data-variant={settings.chrome.footerVariant}><div className="footer-identity"><span className="brand">{settings.siteName}</span><p>{settings.footerText}</p></div>{settings.footerGroups.map((group) => <nav aria-label={group.title} key={group.id}><strong>{group.title}</strong>{group.links.map((item) => <PublicLink href={item.href} key={item.id}>{item.label}</PublicLink>)}</nav>)}<nav aria-label="Social profiles"><strong>Follow</strong>{settings.socialLinks.map((item) => <a href={item.href} key={item.id} rel="me noreferrer">{item.label}</a>)}</nav></footer>
    </main>
  </>);
}
