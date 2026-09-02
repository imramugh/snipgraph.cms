import type { ContentBlock } from "@snipgraph/content-domain";
import Link from "next/link";

function ActionLink({ href, label, className, children }: { href?: string; label?: string; className: string; children?: React.ReactNode }) {
  if (!href || (!label && !children)) return null;
  return href.startsWith("/") ? <Link className={className} href={href}>{children ?? label}</Link> : <a className={className} href={href}>{children ?? label}</a>;
}

function Media({ id, alt = "", className }: { id?: string; alt?: string; className?: string }) {
  return id ? <img className={className} src={mediaUrl(id)} alt={alt} /> : null;
}

function mediaUrl(id: string) {
  return id === "reference-preview" ? "/reference-media-placeholder.svg" : `/api/media/${id}`;
}

function sectionClass(family: string, scheme?: string) {
  return `content-block marketing-section ${family}-block scheme-${scheme ?? "default"}`;
}

function SectionHeading({ eyebrow, heading, intro }: { eyebrow?: string; heading: string; intro?: string }) {
  return <header className="section-heading">{eyebrow && <p className="eyebrow" data-cms-field="eyebrow">{eyebrow}</p>}<h2 data-cms-field="heading">{heading}</h2>{intro && <p className="lede" data-cms-field="intro">{intro}</p>}</header>;
}

export function BlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "marketing.hero": {
      const variant = block.data.variant ?? "simple-centered";
      return <section className={sectionClass("hero", block.data.scheme)} data-variant={variant} data-family="hero" data-cms-block={block.id}>
        <div className="section-copy">{block.data.eyebrow && <p className="eyebrow" data-cms-field="eyebrow">{block.data.eyebrow}</p>}<h1 data-cms-field="heading">{block.data.heading}</h1><p className="lede" data-cms-field="body">{block.data.body}</p>{(block.data.primaryLabel || block.data.secondaryLabel) && <div className="hero-actions"><ActionLink className="button primary" href={block.data.primaryHref} label={block.data.primaryLabel} /><ActionLink className="button secondary" href={block.data.secondaryHref} label={block.data.secondaryLabel} /></div>}</div>
        {variant.includes("code") && <pre className="code-panel"><code>{block.data.code || "// Add a representative code example"}</code></pre>}
        {!variant.includes("code") && <Media className="section-media" id={block.data.imageMediaId} alt="" />}
      </section>;
    }
    case "content.rich-text": {
      const variant = block.data.variant ?? "centered";
      return <section className={sectionClass("content", block.data.scheme)} data-variant={variant} data-family="content" data-cms-block={block.id}><SectionHeading eyebrow={block.data.eyebrow} heading={block.data.heading} /><div className="prose-copy" data-cms-field="body">{block.data.body.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><Media className="section-media" id={block.data.imageMediaId} alt="" />{block.data.quote && <figure className="nested-quote"><blockquote>“{block.data.quote}”</blockquote>{block.data.quoteAuthor && <figcaption>{block.data.quoteAuthor}</figcaption>}</figure>}{block.data.stats?.length ? <dl className="mini-stats">{block.data.stats.map((item) => <div key={item.id}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl> : null}</section>;
    }
    case "marketing.feature-grid": {
      const variant = block.data.variant ?? "simple-three-column-with-small-icons";
      return <section className={sectionClass("features", block.data.scheme)} data-variant={variant} data-family="features" data-cms-block={block.id}><SectionHeading eyebrow={block.data.eyebrow} heading={block.data.heading} intro={block.data.intro} /><Media className="section-media" id={block.data.imageMediaId} alt="" />{variant.includes("code") && <pre className="code-panel"><code>{block.data.code || "// Add a representative code example"}</code></pre>}<div className="feature-grid">{block.data.items.map((item, index) => <article key={item.id} data-cms-field={`items.${index}`}><span>{item.icon || String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>{block.data.quote && <blockquote className="nested-quote">“{block.data.quote}”</blockquote>}</section>;
    }
    case "marketing.cta": {
      const variant = block.data.variant ?? "simple-centered";
      return <section className={sectionClass("cta", block.data.scheme ?? "dark")} data-variant={variant} data-family="cta" data-cms-block={block.id}><div className="section-copy"><h2 data-cms-field="heading">{block.data.heading}</h2>{block.data.body && <p data-cms-field="body">{block.data.body}</p>}<ActionLink className="button primary" href={block.data.buttonHref} label={block.data.buttonLabel} /></div><Media className="section-media" id={block.data.imageMediaId} alt="" /></section>;
    }
    case "media.image":
      return <figure className={`content-block image-block image-${block.data.presentation}`} data-cms-block={block.id}><img src={mediaUrl(block.data.mediaId)} alt={block.data.alt} data-cms-field="mediaId" />{block.data.caption && <figcaption data-cms-field="caption">{block.data.caption}</figcaption>}</figure>;
    case "marketing.stats": {
      const variant = block.data.variant ?? "simple-grid";
      return <section className={sectionClass("stats", block.data.scheme)} data-variant={variant} data-family="stats" data-cms-block={block.id}><SectionHeading eyebrow={block.data.eyebrow} heading={block.data.heading} intro={block.data.intro} /><Media className="section-media" id={block.data.imageMediaId} alt="" /><dl>{block.data.items.map((item, index) => <div key={item.id} data-cms-field={`items.${index}`}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></section>;
    }
    case "marketing.testimonial": {
      const variant = block.data.variant ?? "simple-centered";
      const items = block.data.items?.length ? block.data.items : [{ id: `${block.id}-primary`, quote: block.data.quote, author: block.data.author, role: block.data.role, avatarMediaId: block.data.avatarMediaId, rating: block.data.rating }];
      return <section className={sectionClass("testimonial", block.data.scheme)} data-variant={variant} data-family="testimonial" data-cms-block={block.id}><Media className="section-background" id={block.data.backgroundMediaId} alt="" /><div className="testimonial-grid">{items.map((item) => <figure key={item.id}><Media id={item.avatarMediaId} alt="" />{item.rating && <p className="rating" aria-label={`${item.rating} out of 5 stars`}>{"★".repeat(item.rating)}</p>}<blockquote>“{item.quote}”</blockquote><figcaption><strong>{item.author}</strong>{item.role && <span>{item.role}</span>}</figcaption></figure>)}</div></section>;
    }
    case "marketing.logo-cloud": {
      const variant = block.data.variant ?? "simple-with-heading";
      return <section className={sectionClass("logo-cloud", block.data.scheme)} data-variant={variant} data-family="logo-cloud" data-cms-block={block.id}><SectionHeading heading={block.data.heading} intro={block.data.body} /><div className="logo-grid">{block.data.logos.map((logo, index) => { const image = <img src={mediaUrl(logo.mediaId)} alt={logo.name} />; return logo.href ? <ActionLink href={logo.href} className="logo-link" key={logo.id}>{image}</ActionLink> : <span key={logo.id} data-cms-field={`logos.${index}`}>{image}</span>; })}</div><ActionLink className="text-link" href={block.data.actionHref} label={block.data.actionLabel} /></section>;
    }
    case "content.project-grid":
      return <section className="content-block project-block" data-cms-block={block.id}><SectionHeading eyebrow={block.data.eyebrow} heading={block.data.heading} intro={block.data.intro} /><div className="project-grid">{block.data.items.map((item, index) => <article key={item.id} data-cms-field={`items.${index}`}><Media id={item.imageMediaId} alt="" /><div><h3>{item.title}</h3><p>{item.body}</p>{item.href && <ActionLink href={item.href} label="View project" className="project-link" />}</div></article>)}</div></section>;
    case "content.contact": {
      const variant = block.data.variant ?? "centered";
      return <section className={sectionClass("contact", block.data.scheme)} data-variant={variant} data-family="contact" data-cms-block={block.id}><SectionHeading eyebrow={block.data.eyebrow} heading={block.data.heading} intro={block.data.body} /><Media className="section-media" id={block.data.imageMediaId} alt="" /><address>{block.data.email && <a href={`mailto:${block.data.email}`} data-cms-field="email">{block.data.email}</a>}{block.data.phone && <a href={`tel:${block.data.phone.replace(/[^+\d]/g, "")}`} data-cms-field="phone">{block.data.phone}</a>}{block.data.location && <span data-cms-field="location">{block.data.location}</span>}</address>{block.data.quote && <figure className="nested-quote"><blockquote>“{block.data.quote}”</blockquote>{block.data.quoteAuthor && <figcaption>{block.data.quoteAuthor}</figcaption>}</figure>}</section>;
    }
    case "marketing.bento-grid":
      return <section className={sectionClass("bento", block.data.scheme)} data-variant={block.data.variant} data-family="bento-grid" data-cms-block={block.id}><SectionHeading eyebrow={block.data.eyebrow} heading={block.data.heading} intro={block.data.intro} /><div className="bento-grid">{block.data.items.map((item, index) => <article key={item.id} data-cms-field={`items.${index}`}><Media id={item.imageMediaId} alt="" /><div><h3>{item.title}</h3><p>{item.body}</p><ActionLink href={item.href} label="Learn more" className="text-link" /></div></article>)}</div></section>;
    case "content.blog":
      return <section className={sectionClass("blog", block.data.scheme)} data-variant={block.data.variant} data-family="blog" data-cms-block={block.id}><SectionHeading eyebrow={block.data.eyebrow} heading={block.data.heading} intro={block.data.intro} /><div className="post-grid">{block.data.posts.map((post, index) => <article className={post.featured ? "featured" : undefined} key={post.id} data-cms-field={`posts.${index}`}><Media id={post.imageMediaId} alt="" /><div>{post.publishedAt && <time>{post.publishedAt}</time>}<h3><ActionLink href={post.href} className="stretched-link">{post.title}</ActionLink></h3><p>{post.excerpt}</p>{post.author && <span>{post.author}</span>}</div></article>)}</div></section>;
    case "marketing.faq":
      return <section className={sectionClass("faq", block.data.scheme)} data-variant={block.data.variant} data-family="faq" data-cms-block={block.id}><SectionHeading eyebrow={block.data.eyebrow} heading={block.data.heading} intro={block.data.intro} /><div className="faq-grid">{block.data.items.map((item, index) => block.data.variant.includes("accordion") ? <details key={item.id} data-cms-field={`items.${index}`}><summary>{item.question}</summary><p>{item.answer}</p></details> : <article key={item.id} data-cms-field={`items.${index}`}><h3>{item.question}</h3><p>{item.answer}</p></article>)}</div></section>;
    case "marketing.page-header":
      return <section className={sectionClass("page-header", block.data.scheme)} data-variant={block.data.variant} data-family="page-header" data-cms-block={block.id}><SectionHeading eyebrow={block.data.eyebrow} heading={block.data.heading} intro={block.data.body} /><Media className="section-media" id={block.data.imageMediaId} alt="" />{block.data.items?.length ? <div className="header-cards">{block.data.items.map((item) => <article key={item.id}><h3>{item.title}</h3><p>{item.body}</p></article>)}</div> : null}{block.data.stats?.length ? <dl className="mini-stats">{block.data.stats.map((item) => <div key={item.id}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl> : null}</section>;
    case "marketing.newsletter":
      return <section className={sectionClass("newsletter", block.data.scheme)} data-variant={block.data.variant} data-family="newsletter" data-cms-block={block.id}><SectionHeading eyebrow={block.data.eyebrow} heading={block.data.heading} intro={block.data.body} /><ActionLink className="button primary" href={block.data.buttonHref} label={block.data.buttonLabel} />{block.data.details?.length ? <div className="newsletter-details">{block.data.details.map((item) => <article key={item.id}><h3>{item.title}</h3>{item.body && <p>{item.body}</p>}</article>)}</div> : null}</section>;
    case "marketing.pricing":
      return <section className={sectionClass("pricing", block.data.scheme)} data-variant={block.data.variant} data-family="pricing" data-cms-block={block.id}><SectionHeading eyebrow={block.data.eyebrow} heading={block.data.heading} intro={block.data.intro} /><div className="pricing-grid">{block.data.tiers.map((tier) => <article className={tier.emphasized ? "emphasized" : undefined} key={tier.id}><h3>{tier.name}</h3>{tier.description && <p>{tier.description}</p>}<p className="price">{tier.price} {tier.period && <small>{tier.period}</small>}</p><ul>{tier.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><ActionLink className="button primary" href={tier.buttonHref} label={tier.buttonLabel} /></article>)}</div></section>;
    case "content.team":
      return <section className={sectionClass("team", block.data.scheme)} data-variant={block.data.variant} data-family="team" data-cms-block={block.id}><SectionHeading eyebrow={block.data.eyebrow} heading={block.data.heading} intro={block.data.intro} /><div className="team-grid">{block.data.people.map((person) => <article key={person.id}><Media id={person.imageMediaId} alt="" /><h3>{person.name}</h3><p className="role">{person.role}</p>{person.bio && <p>{person.bio}</p>}<div>{person.links?.map((link) => <ActionLink href={link.href} label={link.label} className="text-link" key={link.id} />)}</div></article>)}</div></section>;
  }
}
