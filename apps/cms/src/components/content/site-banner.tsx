"use client";

import type { SiteSettingsValue } from "@snipgraph/content-domain";
import Link from "next/link";
import { useState } from "react";

type Banner = SiteSettingsValue["chrome"]["banner"];

export function SiteBanner({ banner }: { banner: Banner }) {
  const [visible, setVisible] = useState(true);
  if (!banner.enabled || !visible) return null;
  const action = banner.actionHref && banner.actionLabel
    ? banner.actionHref.startsWith("/")
      ? <Link href={banner.actionHref}>{banner.actionLabel}</Link>
      : <a href={banner.actionHref}>{banner.actionLabel}</a>
    : null;
  return <aside className="site-banner" data-variant={banner.variant} aria-label="Announcement">
    <p>{banner.message} {action}</p>
    {banner.dismissible && <button type="button" onClick={() => setVisible(false)} aria-label="Dismiss announcement">×</button>}
  </aside>;
}
