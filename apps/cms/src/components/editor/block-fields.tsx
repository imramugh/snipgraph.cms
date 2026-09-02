"use client";

import { marketingLabel, variantsForBlock, type ContentBlock } from "@snipgraph/content-domain";
import type { MediaAsset } from "@snipgraph/content-domain";
import Link from "next/link";
import { useEffect, useState } from "react";

type Props = { block: ContentBlock; onChange: (block: ContentBlock) => void };

export function BlockFields({ block, onChange }: Props) {
  switch (block.type) {
    case "marketing.hero": {
      const update = (name: keyof typeof block.data, value: string) =>
        onChange({ ...block, data: { ...block.data, [name]: value } });
      return <>
        <AppearanceFields block={block} onChange={onChange} />
        <TextField label="Eyebrow" value={block.data.eyebrow ?? ""} onChange={(value) => update("eyebrow", value)} />
        <TextField label="Heading" value={block.data.heading} onChange={(value) => update("heading", value)} />
        <TextArea label="Body" value={block.data.body} onChange={(value) => update("body", value)} />
        <div className="field-pair">
          <TextField label="Primary label" value={block.data.primaryLabel ?? ""} onChange={(value) => update("primaryLabel", value)} />
          <TextField label="Primary link" value={block.data.primaryHref ?? ""} onChange={(value) => update("primaryHref", value)} />
        </div>
        <div className="field-pair">
          <TextField label="Secondary label" value={block.data.secondaryLabel ?? ""} onChange={(value) => update("secondaryLabel", value)} />
          <TextField label="Secondary link" value={block.data.secondaryHref ?? ""} onChange={(value) => update("secondaryHref", value)} />
        </div>
        <MediaPicker label="Hero image or screenshot (optional)" value={block.data.imageMediaId ?? ""} allowEmpty onChange={(asset) => onChange({ ...block, data: { ...block.data, imageMediaId: asset.id } })} />
        {block.data.variant?.includes("code") && <TextArea label="Code example" rows={8} value={block.data.code ?? ""} onChange={(code) => onChange({ ...block, data: { ...block.data, code } })} />}
      </>;
    }
    case "content.rich-text": {
      const update = (name: keyof typeof block.data, value: string) =>
        onChange({ ...block, data: { ...block.data, [name]: value } });
      return <>
        <AppearanceFields block={block} onChange={onChange} />
        <TextField label="Eyebrow" value={block.data.eyebrow ?? ""} onChange={(value) => update("eyebrow", value)} />
        <TextField label="Heading" value={block.data.heading} onChange={(value) => update("heading", value)} />
        <TextArea label="Body" rows={10} value={block.data.body} onChange={(value) => update("body", value)} />
        <MediaPicker label="Section image (optional)" value={block.data.imageMediaId ?? ""} allowEmpty onChange={(asset) => onChange({ ...block, data: { ...block.data, imageMediaId: asset.id } })} />
        <TextArea label="Supporting quotation (optional)" value={block.data.quote ?? ""} onChange={(quote) => onChange({ ...block, data: { ...block.data, quote } })} />
        <TextField label="Quotation author" value={block.data.quoteAuthor ?? ""} onChange={(quoteAuthor) => onChange({ ...block, data: { ...block.data, quoteAuthor } })} />
      </>;
    }
    case "marketing.feature-grid": {
      const update = (name: "eyebrow" | "heading" | "intro", value: string) =>
        onChange({ ...block, data: { ...block.data, [name]: value } });
      return <>
        <AppearanceFields block={block} onChange={onChange} />
        <TextField label="Eyebrow" value={block.data.eyebrow ?? ""} onChange={(value) => update("eyebrow", value)} />
        <TextField label="Heading" value={block.data.heading} onChange={(value) => update("heading", value)} />
        <TextArea label="Introduction" value={block.data.intro ?? ""} onChange={(value) => update("intro", value)} />
        <div className="repeater">
          <div className="repeater-heading"><strong>Items</strong><button type="button" className="text-button" onClick={() => onChange({ ...block, data: { ...block.data, items: [...block.data.items, { id: crypto.randomUUID(), title: "New feature", body: "Describe this feature." }] } })}>Add item</button></div>
          {block.data.items.map((item, index) => (
            <fieldset key={item.id}>
              <legend>Item {index + 1}</legend>
              <TextField label="Title" value={item.title} onChange={(value) => onChange({ ...block, data: { ...block.data, items: block.data.items.map((candidate) => candidate.id === item.id ? { ...candidate, title: value } : candidate) } })} />
              <TextArea label="Body" value={item.body} onChange={(value) => onChange({ ...block, data: { ...block.data, items: block.data.items.map((candidate) => candidate.id === item.id ? { ...candidate, body: value } : candidate) } })} />
              {block.data.items.length > 1 && <button type="button" className="text-button danger" onClick={() => onChange({ ...block, data: { ...block.data, items: block.data.items.filter((candidate) => candidate.id !== item.id) } })}>Remove item</button>}
            </fieldset>
          ))}
        </div>
        <MediaPicker label="Feature image or screenshot (optional)" value={block.data.imageMediaId ?? ""} allowEmpty onChange={(asset) => onChange({ ...block, data: { ...block.data, imageMediaId: asset.id } })} />
        {block.data.variant?.includes("code") && <TextArea label="Code example" rows={8} value={block.data.code ?? ""} onChange={(code) => onChange({ ...block, data: { ...block.data, code } })} />}
      </>;
    }
    case "marketing.cta": {
      const update = (name: keyof typeof block.data, value: string) =>
        onChange({ ...block, data: { ...block.data, [name]: value } });
      return <>
        <AppearanceFields block={block} onChange={onChange} />
        <TextField label="Heading" value={block.data.heading} onChange={(value) => update("heading", value)} />
        <TextArea label="Body" value={block.data.body ?? ""} onChange={(value) => update("body", value)} />
        <div className="field-pair">
          <TextField label="Button label" value={block.data.buttonLabel} onChange={(value) => update("buttonLabel", value)} />
          <TextField label="Button link" value={block.data.buttonHref} onChange={(value) => update("buttonHref", value)} />
        </div>
        <MediaPicker label="CTA image (optional)" value={block.data.imageMediaId ?? ""} allowEmpty onChange={(asset) => onChange({ ...block, data: { ...block.data, imageMediaId: asset.id } })} />
      </>;
    }
    case "media.image": {
      const update = (name: keyof typeof block.data, value: string) =>
        onChange({ ...block, data: { ...block.data, [name]: value } });
      return <>
        <AppearanceFields block={block} onChange={onChange} />
        <MediaPicker
          value={block.data.mediaId}
          onChange={(asset) => onChange({
            ...block,
            data: {
              ...block.data,
              mediaId: asset.id,
              alt: block.data.alt || (asset.decorative ? "" : asset.altText),
            },
          })}
        />
        <TextField label="Alternative text" value={block.data.alt} onChange={(value) => update("alt", value)} />
        <TextField label="Caption" value={block.data.caption ?? ""} onChange={(value) => update("caption", value)} />
        <label>Presentation<select value={block.data.presentation} onChange={(event) => update("presentation", event.target.value)}><option value="wide">Wide</option><option value="contained">Contained</option><option value="portrait">Portrait</option></select></label>
      </>;
    }
    case "marketing.stats": {
      const update = (name: "eyebrow" | "heading" | "intro", value: string) => onChange({ ...block, data: { ...block.data, [name]: value } });
      return <>
        <AppearanceFields block={block} onChange={onChange} />
        <TextField label="Eyebrow" value={block.data.eyebrow ?? ""} onChange={(value) => update("eyebrow", value)} />
        <TextField label="Heading" value={block.data.heading} onChange={(value) => update("heading", value)} />
        <TextArea label="Introduction" value={block.data.intro ?? ""} onChange={(value) => update("intro", value)} />
        <div className="repeater"><div className="repeater-heading"><strong>Statistics</strong><button type="button" className="text-button" onClick={() => onChange({ ...block, data: { ...block.data, items: [...block.data.items, { id: crypto.randomUUID(), value: "100%", label: "New statistic" }] } })}>Add statistic</button></div>{block.data.items.map((item, index) => <fieldset key={item.id}><legend>Statistic {index + 1}</legend><div className="field-pair"><TextField label="Value" value={item.value} onChange={(value) => onChange({ ...block, data: { ...block.data, items: block.data.items.map((candidate) => candidate.id === item.id ? { ...candidate, value } : candidate) } })} /><TextField label="Label" value={item.label} onChange={(label) => onChange({ ...block, data: { ...block.data, items: block.data.items.map((candidate) => candidate.id === item.id ? { ...candidate, label } : candidate) } })} /></div>{block.data.items.length > 1 && <button type="button" className="text-button danger" onClick={() => onChange({ ...block, data: { ...block.data, items: block.data.items.filter((candidate) => candidate.id !== item.id) } })}>Remove statistic</button>}</fieldset>)}</div>
      </>;
    }
    case "marketing.testimonial": {
      const update = (name: "quote" | "author" | "role" | "avatarMediaId", value: string) => onChange({ ...block, data: { ...block.data, [name]: value } });
      return <>
        <AppearanceFields block={block} onChange={onChange} />
        <TextArea label="Quotation" rows={7} value={block.data.quote} onChange={(value) => update("quote", value)} />
        <div className="field-pair"><TextField label="Author" value={block.data.author} onChange={(value) => update("author", value)} /><TextField label="Role and organisation" value={block.data.role ?? ""} onChange={(value) => update("role", value)} /></div>
        <MediaPicker label="Portrait (optional)" value={block.data.avatarMediaId ?? ""} allowEmpty onChange={(asset) => update("avatarMediaId", asset.id)} />
      </>;
    }
    case "marketing.logo-cloud":
      return <>
        <AppearanceFields block={block} onChange={onChange} />
        <TextField label="Heading" value={block.data.heading} onChange={(heading) => onChange({ ...block, data: { ...block.data, heading } })} />
        <div className="repeater"><div className="repeater-heading"><strong>Logos</strong><button type="button" className="text-button" onClick={() => onChange({ ...block, data: { ...block.data, logos: [...block.data.logos, { id: crypto.randomUUID(), name: "Organisation", mediaId: "00000000-0000-4000-8000-000000000000", href: "" }] } })}>Add logo</button></div>{block.data.logos.map((logo, index) => <fieldset key={logo.id}><legend>Logo {index + 1}</legend><TextField label="Organisation name" value={logo.name} onChange={(name) => onChange({ ...block, data: { ...block.data, logos: block.data.logos.map((candidate) => candidate.id === logo.id ? { ...candidate, name } : candidate) } })} /><MediaPicker label="Logo asset" value={logo.mediaId} onChange={(asset) => onChange({ ...block, data: { ...block.data, logos: block.data.logos.map((candidate) => candidate.id === logo.id ? { ...candidate, mediaId: asset.id } : candidate) } })} /><TextField label="Link (optional)" value={logo.href ?? ""} onChange={(href) => onChange({ ...block, data: { ...block.data, logos: block.data.logos.map((candidate) => candidate.id === logo.id ? { ...candidate, href } : candidate) } })} />{block.data.logos.length > 1 && <button type="button" className="text-button danger" onClick={() => onChange({ ...block, data: { ...block.data, logos: block.data.logos.filter((candidate) => candidate.id !== logo.id) } })}>Remove logo</button>}</fieldset>)}</div>
      </>;
    case "content.project-grid": {
      const update = (name: "eyebrow" | "heading" | "intro", value: string) => onChange({ ...block, data: { ...block.data, [name]: value } });
      return <>
        <TextField label="Eyebrow" value={block.data.eyebrow ?? ""} onChange={(value) => update("eyebrow", value)} />
        <TextField label="Heading" value={block.data.heading} onChange={(value) => update("heading", value)} />
        <TextArea label="Introduction" value={block.data.intro ?? ""} onChange={(value) => update("intro", value)} />
        <div className="repeater"><div className="repeater-heading"><strong>Projects</strong><button type="button" className="text-button" onClick={() => onChange({ ...block, data: { ...block.data, items: [...block.data.items, { id: crypto.randomUUID(), title: "Project title", body: "Describe this project.", href: "", imageMediaId: "" }] } })}>Add project</button></div>{block.data.items.map((item, index) => <fieldset key={item.id}><legend>Project {index + 1}</legend><TextField label="Title" value={item.title} onChange={(title) => onChange({ ...block, data: { ...block.data, items: block.data.items.map((candidate) => candidate.id === item.id ? { ...candidate, title } : candidate) } })} /><TextArea label="Description" value={item.body} onChange={(body) => onChange({ ...block, data: { ...block.data, items: block.data.items.map((candidate) => candidate.id === item.id ? { ...candidate, body } : candidate) } })} /><TextField label="Link (optional)" value={item.href ?? ""} onChange={(href) => onChange({ ...block, data: { ...block.data, items: block.data.items.map((candidate) => candidate.id === item.id ? { ...candidate, href } : candidate) } })} /><MediaPicker label="Image (optional)" value={item.imageMediaId ?? ""} allowEmpty onChange={(asset) => onChange({ ...block, data: { ...block.data, items: block.data.items.map((candidate) => candidate.id === item.id ? { ...candidate, imageMediaId: asset.id } : candidate) } })} />{block.data.items.length > 1 && <button type="button" className="text-button danger" onClick={() => onChange({ ...block, data: { ...block.data, items: block.data.items.filter((candidate) => candidate.id !== item.id) } })}>Remove project</button>}</fieldset>)}</div>
      </>;
    }
    case "content.contact": {
      const update = (name: keyof typeof block.data, value: string) => onChange({ ...block, data: { ...block.data, [name]: value } });
      return <>
        <AppearanceFields block={block} onChange={onChange} />
        <TextField label="Eyebrow" value={block.data.eyebrow ?? ""} onChange={(value) => update("eyebrow", value)} />
        <TextField label="Heading" value={block.data.heading} onChange={(value) => update("heading", value)} />
        <TextArea label="Body" value={block.data.body ?? ""} onChange={(value) => update("body", value)} />
        <TextField label="Email" value={block.data.email ?? ""} onChange={(value) => update("email", value)} />
        <div className="field-pair"><TextField label="Phone" value={block.data.phone ?? ""} onChange={(value) => update("phone", value)} /><TextField label="Location" value={block.data.location ?? ""} onChange={(value) => update("location", value)} /></div>
        <MediaPicker label="Contact image (optional)" value={block.data.imageMediaId ?? ""} allowEmpty onChange={(asset) => onChange({ ...block, data: { ...block.data, imageMediaId: asset.id } })} />
      </>;
    }
    case "marketing.bento-grid": {
      const update = (name: "eyebrow" | "heading" | "intro", value: string) => onChange({ ...block, data: { ...block.data, [name]: value } });
      return <><AppearanceFields block={block} onChange={onChange} /><TextField label="Eyebrow" value={block.data.eyebrow ?? ""} onChange={(value) => update("eyebrow", value)} /><TextField label="Heading" value={block.data.heading} onChange={(value) => update("heading", value)} /><TextArea label="Introduction" value={block.data.intro ?? ""} onChange={(value) => update("intro", value)} /><div className="repeater"><div className="repeater-heading"><strong>Tiles</strong><button type="button" className="text-button" onClick={() => onChange({ ...block, data: { ...block.data, items: [...block.data.items, { id: crypto.randomUUID(), title: "New tile", body: "Describe this highlight.", href: "", imageMediaId: "" }] } })}>Add tile</button></div>{block.data.items.map((item, index) => <fieldset key={item.id}><legend>Tile {index + 1}</legend><TextField label="Title" value={item.title} onChange={(title) => onChange({ ...block, data: { ...block.data, items: block.data.items.map((candidate) => candidate.id === item.id ? { ...candidate, title } : candidate) } })} /><TextArea label="Body" value={item.body} onChange={(body) => onChange({ ...block, data: { ...block.data, items: block.data.items.map((candidate) => candidate.id === item.id ? { ...candidate, body } : candidate) } })} /><TextField label="Link" value={item.href ?? ""} onChange={(href) => onChange({ ...block, data: { ...block.data, items: block.data.items.map((candidate) => candidate.id === item.id ? { ...candidate, href } : candidate) } })} /><MediaPicker label="Image" value={item.imageMediaId ?? ""} allowEmpty onChange={(asset) => onChange({ ...block, data: { ...block.data, items: block.data.items.map((candidate) => candidate.id === item.id ? { ...candidate, imageMediaId: asset.id } : candidate) } })} />{block.data.items.length > 3 && <button type="button" className="text-button danger" onClick={() => onChange({ ...block, data: { ...block.data, items: block.data.items.filter((candidate) => candidate.id !== item.id) } })}>Remove tile</button>}</fieldset>)}</div></>;
    }
    case "content.blog": {
      const update = (name: "eyebrow" | "heading" | "intro", value: string) => onChange({ ...block, data: { ...block.data, [name]: value } });
      return <><AppearanceFields block={block} onChange={onChange} /><TextField label="Eyebrow" value={block.data.eyebrow ?? ""} onChange={(value) => update("eyebrow", value)} /><TextField label="Heading" value={block.data.heading} onChange={(value) => update("heading", value)} /><TextArea label="Introduction" value={block.data.intro ?? ""} onChange={(value) => update("intro", value)} /><div className="repeater"><div className="repeater-heading"><strong>Posts</strong><button type="button" className="text-button" onClick={() => onChange({ ...block, data: { ...block.data, posts: [...block.data.posts, { id: crypto.randomUUID(), title: "New article", excerpt: "Summarize the article.", href: "/", publishedAt: "", author: "", imageMediaId: "", featured: false }] } })}>Add post</button></div>{block.data.posts.map((post, index) => <fieldset key={post.id}><legend>Post {index + 1}</legend><TextField label="Title" value={post.title} onChange={(title) => onChange({ ...block, data: { ...block.data, posts: block.data.posts.map((candidate) => candidate.id === post.id ? { ...candidate, title } : candidate) } })} /><TextArea label="Excerpt" value={post.excerpt} onChange={(excerpt) => onChange({ ...block, data: { ...block.data, posts: block.data.posts.map((candidate) => candidate.id === post.id ? { ...candidate, excerpt } : candidate) } })} /><div className="field-pair"><TextField label="Link" value={post.href} onChange={(href) => onChange({ ...block, data: { ...block.data, posts: block.data.posts.map((candidate) => candidate.id === post.id ? { ...candidate, href } : candidate) } })} /><TextField label="Published date" value={post.publishedAt ?? ""} onChange={(publishedAt) => onChange({ ...block, data: { ...block.data, posts: block.data.posts.map((candidate) => candidate.id === post.id ? { ...candidate, publishedAt } : candidate) } })} /></div><MediaPicker label="Image" value={post.imageMediaId ?? ""} allowEmpty onChange={(asset) => onChange({ ...block, data: { ...block.data, posts: block.data.posts.map((candidate) => candidate.id === post.id ? { ...candidate, imageMediaId: asset.id } : candidate) } })} />{block.data.posts.length > 1 && <button type="button" className="text-button danger" onClick={() => onChange({ ...block, data: { ...block.data, posts: block.data.posts.filter((candidate) => candidate.id !== post.id) } })}>Remove post</button>}</fieldset>)}</div></>;
    }
    case "marketing.faq": {
      const update = (name: "eyebrow" | "heading" | "intro", value: string) => onChange({ ...block, data: { ...block.data, [name]: value } });
      return <><AppearanceFields block={block} onChange={onChange} /><TextField label="Eyebrow" value={block.data.eyebrow ?? ""} onChange={(value) => update("eyebrow", value)} /><TextField label="Heading" value={block.data.heading} onChange={(value) => update("heading", value)} /><TextArea label="Introduction" value={block.data.intro ?? ""} onChange={(value) => update("intro", value)} /><div className="repeater"><div className="repeater-heading"><strong>Questions</strong><button type="button" className="text-button" onClick={() => onChange({ ...block, data: { ...block.data, items: [...block.data.items, { id: crypto.randomUUID(), question: "New question", answer: "Add the answer." }] } })}>Add question</button></div>{block.data.items.map((item, index) => <fieldset key={item.id}><legend>Question {index + 1}</legend><TextField label="Question" value={item.question} onChange={(question) => onChange({ ...block, data: { ...block.data, items: block.data.items.map((candidate) => candidate.id === item.id ? { ...candidate, question } : candidate) } })} /><TextArea label="Answer" value={item.answer} onChange={(answer) => onChange({ ...block, data: { ...block.data, items: block.data.items.map((candidate) => candidate.id === item.id ? { ...candidate, answer } : candidate) } })} />{block.data.items.length > 1 && <button type="button" className="text-button danger" onClick={() => onChange({ ...block, data: { ...block.data, items: block.data.items.filter((candidate) => candidate.id !== item.id) } })}>Remove question</button>}</fieldset>)}</div></>;
    }
    case "marketing.page-header": {
      const update = (name: "eyebrow" | "heading" | "body", value: string) => onChange({ ...block, data: { ...block.data, [name]: value } });
      return <><AppearanceFields block={block} onChange={onChange} /><TextField label="Eyebrow" value={block.data.eyebrow ?? ""} onChange={(value) => update("eyebrow", value)} /><TextField label="Heading" value={block.data.heading} onChange={(value) => update("heading", value)} /><TextArea label="Body" value={block.data.body ?? ""} onChange={(value) => update("body", value)} /><MediaPicker label="Background or supporting image" value={block.data.imageMediaId ?? ""} allowEmpty onChange={(asset) => onChange({ ...block, data: { ...block.data, imageMediaId: asset.id } })} /></>;
    }
    case "marketing.newsletter": {
      const update = (name: "eyebrow" | "heading" | "body" | "buttonLabel" | "buttonHref", value: string) => onChange({ ...block, data: { ...block.data, [name]: value } });
      return <><AppearanceFields block={block} onChange={onChange} /><TextField label="Eyebrow" value={block.data.eyebrow ?? ""} onChange={(value) => update("eyebrow", value)} /><TextField label="Heading" value={block.data.heading} onChange={(value) => update("heading", value)} /><TextArea label="Body" value={block.data.body ?? ""} onChange={(value) => update("body", value)} /><div className="field-pair"><TextField label="Button label" value={block.data.buttonLabel} onChange={(value) => update("buttonLabel", value)} /><TextField label="Subscription link" value={block.data.buttonHref} onChange={(value) => update("buttonHref", value)} /></div></>;
    }
    case "marketing.pricing": {
      const update = (name: "eyebrow" | "heading" | "intro", value: string) => onChange({ ...block, data: { ...block.data, [name]: value } });
      return <><AppearanceFields block={block} onChange={onChange} /><TextField label="Eyebrow" value={block.data.eyebrow ?? ""} onChange={(value) => update("eyebrow", value)} /><TextField label="Heading" value={block.data.heading} onChange={(value) => update("heading", value)} /><TextArea label="Introduction" value={block.data.intro ?? ""} onChange={(value) => update("intro", value)} /><div className="repeater"><div className="repeater-heading"><strong>Pricing tiers</strong><button type="button" className="text-button" onClick={() => onChange({ ...block, data: { ...block.data, tiers: [...block.data.tiers, { id: crypto.randomUUID(), name: "New tier", description: "Who this is for.", price: "$100", period: "per month", buttonLabel: "Get started", buttonHref: "/contact", emphasized: false, features: ["Included feature"] }] } })}>Add tier</button></div>{block.data.tiers.map((tier, index) => <fieldset key={tier.id}><legend>Tier {index + 1}</legend><div className="field-pair"><TextField label="Name" value={tier.name} onChange={(name) => onChange({ ...block, data: { ...block.data, tiers: block.data.tiers.map((candidate) => candidate.id === tier.id ? { ...candidate, name } : candidate) } })} /><TextField label="Price" value={tier.price} onChange={(price) => onChange({ ...block, data: { ...block.data, tiers: block.data.tiers.map((candidate) => candidate.id === tier.id ? { ...candidate, price } : candidate) } })} /></div><TextArea label="Description" value={tier.description ?? ""} onChange={(description) => onChange({ ...block, data: { ...block.data, tiers: block.data.tiers.map((candidate) => candidate.id === tier.id ? { ...candidate, description } : candidate) } })} /><TextArea label="Features (one per line)" value={tier.features.join("\n")} onChange={(features) => onChange({ ...block, data: { ...block.data, tiers: block.data.tiers.map((candidate) => candidate.id === tier.id ? { ...candidate, features: features.split("\n").filter(Boolean) } : candidate) } })} /><label className="checkbox-field"><input type="checkbox" checked={tier.emphasized ?? false} onChange={(event) => onChange({ ...block, data: { ...block.data, tiers: block.data.tiers.map((candidate) => candidate.id === tier.id ? { ...candidate, emphasized: event.target.checked } : candidate) } })} />Emphasize this tier</label>{block.data.tiers.length > 1 && <button type="button" className="text-button danger" onClick={() => onChange({ ...block, data: { ...block.data, tiers: block.data.tiers.filter((candidate) => candidate.id !== tier.id) } })}>Remove tier</button>}</fieldset>)}</div></>;
    }
    case "content.team": {
      const update = (name: "eyebrow" | "heading" | "intro", value: string) => onChange({ ...block, data: { ...block.data, [name]: value } });
      return <><AppearanceFields block={block} onChange={onChange} /><TextField label="Eyebrow" value={block.data.eyebrow ?? ""} onChange={(value) => update("eyebrow", value)} /><TextField label="Heading" value={block.data.heading} onChange={(value) => update("heading", value)} /><TextArea label="Introduction" value={block.data.intro ?? ""} onChange={(value) => update("intro", value)} /><div className="repeater"><div className="repeater-heading"><strong>People</strong><button type="button" className="text-button" onClick={() => onChange({ ...block, data: { ...block.data, people: [...block.data.people, { id: crypto.randomUUID(), name: "Team member", role: "Role", bio: "Short biography", imageMediaId: "", links: [] }] } })}>Add person</button></div>{block.data.people.map((person, index) => <fieldset key={person.id}><legend>Person {index + 1}</legend><div className="field-pair"><TextField label="Name" value={person.name} onChange={(name) => onChange({ ...block, data: { ...block.data, people: block.data.people.map((candidate) => candidate.id === person.id ? { ...candidate, name } : candidate) } })} /><TextField label="Role" value={person.role} onChange={(role) => onChange({ ...block, data: { ...block.data, people: block.data.people.map((candidate) => candidate.id === person.id ? { ...candidate, role } : candidate) } })} /></div><TextArea label="Biography" value={person.bio ?? ""} onChange={(bio) => onChange({ ...block, data: { ...block.data, people: block.data.people.map((candidate) => candidate.id === person.id ? { ...candidate, bio } : candidate) } })} /><MediaPicker label="Portrait" value={person.imageMediaId ?? ""} allowEmpty onChange={(asset) => onChange({ ...block, data: { ...block.data, people: block.data.people.map((candidate) => candidate.id === person.id ? { ...candidate, imageMediaId: asset.id } : candidate) } })} />{block.data.people.length > 1 && <button type="button" className="text-button danger" onClick={() => onChange({ ...block, data: { ...block.data, people: block.data.people.filter((candidate) => candidate.id !== person.id) } })}>Remove person</button>}</fieldset>)}</div></>;
    }
  }
}

function AppearanceFields({ block, onChange }: Props) {
  if (!("variant" in block.data)) return null;
  const variants = variantsForBlock(block.type);
  const update = (change: { variant?: string; scheme?: string }) => onChange({ ...block, data: { ...block.data, ...change } } as ContentBlock);
  return <fieldset className="appearance-fields"><legend>Appearance</legend><label>Variant<select value={block.data.variant ?? variants[0]} onChange={(event) => update({ variant: event.target.value })}>{variants.map((variant) => <option value={variant} key={variant}>{marketingLabel(variant)}</option>)}</select></label><label>Color scheme<select value={block.data.scheme ?? "default"} onChange={(event) => update({ scheme: event.target.value })}><option value="default">Default</option><option value="muted">Muted</option><option value="brand">Brand</option><option value="dark">Dark</option><option value="image">Image overlay</option></select></label></fieldset>;
}

function MediaPicker({ value, onChange, label = "Media asset", allowEmpty = false }: { value: string; onChange: (asset: MediaAsset) => void; label?: string; allowEmpty?: boolean }) {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [state, setState] = useState("Loading media…");
  useEffect(() => {
    let active = true;
    fetch("/api/media")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Media unavailable");
        if (active) {
          setMedia(result.media);
          setState(result.media.length === 0 ? "No media uploaded yet." : "");
        }
      })
      .catch((error: Error) => active && setState(error.message));
    return () => { active = false; };
  }, []);
  const selected = media.find((asset) => asset.id === value);
  return <div className="media-picker">
    <label>{label}<select value={media.some((asset) => asset.id === value) ? value : ""} onChange={(event) => { const asset = media.find((candidate) => candidate.id === event.target.value); if (asset) onChange(asset); }}><option value="">{allowEmpty ? "No image" : "Choose an image"}</option>{media.map((asset) => <option key={asset.id} value={asset.id}>{asset.filename}</option>)}</select></label>
    {selected && <div className="media-picker-preview"><img src={`/api/media/${selected.id}`} alt="" /><span>{selected.width} × {selected.height}</span></div>}
    {state && <p className="save-state">{state}</p>}
    <Link className="text-button" href="/admin/media" target="_blank">Open media library</Link>
  </div>;
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label>{label}<input value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function TextArea({ label, value, onChange, rows = 5 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return <label>{label}<textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
