/**
 * build-resenhas.cjs
 * Pre-build step: converts src/content/resenhas/*.md into:
 *   - src/pages/resenhas/_generated/items/<slug>.njk   (one per review)
 *   - src/pages/resenhas/_generated/tipos/<type>.njk   (one per distinct type)
 *   - src/data/resenhas.json                           (listing + types data)
 *
 * Frontmatter fields: title, type (musica|livro), author, date, rating (0-10),
 * cover (filename under src/assets/media/resenhas/), tags[], excerpt, draft.
 *
 * Run automatically via npm prebuild / prebuild:prod / prewatch (via "content" script).
 */

"use strict";

const fs   = require("fs");
const path = require("path");
const glob = require("glob");
const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

const ROOT        = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "src", "content", "resenhas");
const GEN_ITEMS   = path.join(ROOT, "src", "pages", "resenhas", "_generated", "items");
const GEN_TIPOS   = path.join(ROOT, "src", "pages", "resenhas", "_generated", "tipos");
const DATA_JSON   = path.join(ROOT, "src", "data", "resenhas.json");

const site = require("../src/data/global.json").site;

// ── Type display labels ───────────────────────────────────────────────────────

const TYPE_LABELS = {
    musica: "Música",
    livro:  "Livro",
};

function typeLabel(type) {
    return TYPE_LABELS[type] || type;
}

// ── Helpers (mirrored from build-blog.cjs, kept separate to avoid coupling) ──

function slugify(s) {
    return s
        .toString()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Prevent markdown-rendered HTML from accidentally closing the Nunjucks
 * {% raw %} block we wrap it in.
 */
function safeRaw(html) {
    return html.replace(/{%-?\s*endraw\s*-?%}/g, "{% endraw %}{% raw %}");
}

function formatDate(dateInput) {
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return new Intl.DateTimeFormat("pt-BR", {
        day:      "2-digit",
        month:    "long",
        year:     "numeric",
        timeZone: "UTC",
    }).format(d);
}

// ── Main ─────────────────────────────────────────────────────────────────────

function build() {
    // Ensure output dirs exist and are clean
    fs.mkdirSync(GEN_ITEMS, { recursive: true });
    fs.mkdirSync(GEN_TIPOS, { recursive: true });

    for (const f of glob.sync("*.njk", { cwd: GEN_ITEMS })) fs.rmSync(path.join(GEN_ITEMS, f));
    for (const f of glob.sync("*.njk", { cwd: GEN_TIPOS })) fs.rmSync(path.join(GEN_TIPOS, f));

    const mdFiles = glob.sync("*.md", { cwd: CONTENT_DIR });
    const items = [];

    for (const file of mdFiles) {
        const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
        const { data, content } = matter(raw);

        if (data.draft) continue;

        const slug        = data.slug ? slugify(String(data.slug)) : slugify(path.basename(file, ".md"));
        const title       = data.title  || slug;
        const type        = data.type   || "outro";
        const author      = data.author || "";
        const date        = data.date ? new Date(data.date) : null;
        const dateIso     = date ? date.toISOString().slice(0, 10) : "";
        const dateDisplay = date ? formatDate(date) : "";
        const rating      = data.rating != null ? Number(data.rating) : null;
        const cover       = data.cover  || "";
        const tags        = Array.isArray(data.tags) ? data.tags.map(String) : [];
        const excerpt     = data.excerpt || "";

        const bodyHtml = safeRaw(md.render(content));

        // Pre-render HTML blocks so the layout never needs Nunjucks logic for them
        const coverHtml = cover
            ? `<img class="resenha__cover-img resenha__cover-img--${type}" src="/assets/media/resenhas/${cover}" alt="Capa de ${title.replace(/"/g, "&quot;")}">`
            : "";

        const ratingHtml = rating != null
            ? `<span class="rating-badge">${rating}/10</span>`
            : "";

        const typePillHtml = `<span class="resenha__type-pill resenha__type-pill--${type}">${typeLabel(type)}</span>`;

        const tagsHtml = tags.length
            ? `<ul class="resenha__tags list-unstyled">\n` +
              tags.map(t => `    <li class="resenha__tag">${t}</li>`).join("\n") +
              `\n</ul>`
            : "";

        // ── JSON-LD Review ────────────────────────────────────────────────────
        const itemReviewed = type === "livro"
            ? { "@type": "Book",        "name": title, "author": { "@type": "Person", "name": author } }
            : { "@type": "MusicAlbum", "name": title, "byArtist": { "@type": "MusicGroup", "name": author } };

        const schemaObj = {
            "@context": "https://schema.org",
            "@type": "Review",
            "itemReviewed": itemReviewed,
            "author": { "@type": "Person", "name": site.author },
            "datePublished": dateIso,
            "url": `${site.canonical_url}/resenhas/${slug}/`,
            ...(excerpt ? { "reviewBody": excerpt } : {}),
            ...(rating != null ? {
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": rating,
                    "bestRating": 10
                }
            } : {}),
            ...(cover ? { "image": `${site.canonical_url}/assets/media/resenhas/${cover}` } : {})
        };
        const schemaHtml = `<script type="application/ld+json">\n${JSON.stringify(schemaObj, null, 4)}\n</script>`;

        const itemNjk =
`{# AUTO-GENERATED from src/content/resenhas/${file} — do not edit, re-run npm run resenhas #}
{% extends "layouts/resenha.njk" %}

{% block resenha_cover %}${coverHtml}{% endblock %}
{% block resenha_type_pill %}${typePillHtml}{% endblock %}
{% block resenha_rating %}${ratingHtml}{% endblock %}
{% block resenha_title %}${title}{% endblock %}
{% block resenha_author %}${author}{% endblock %}
{% block resenha_date_iso %}${dateIso}{% endblock %}
{% block resenha_date_display %}${dateDisplay}{% endblock %}
{% block resenha_tags %}${tagsHtml}{% endblock %}
{% block resenha_body %}{% raw %}
${bodyHtml}
{% endraw %}{% endblock %}
{% block page_schema %}${schemaHtml}{% endblock %}
`;
        fs.writeFileSync(path.join(GEN_ITEMS, `${slug}.njk`), itemNjk, "utf8");

        items.push({ slug, title, type, author, date: dateIso, dateDisplay, rating, cover, tags, excerpt });
    }

    // Sort newest-first
    items.sort((a, b) => (a.date < b.date ? 1 : -1));

    // Unique types (preserving first-seen order, then sort)
    const typeSet = new Set();
    for (const item of items) typeSet.add(item.type);
    const types = [...typeSet].sort();

    // Per-type listing pages
    for (const type of types) {
        const tipoNjk =
`{# AUTO-GENERATED for type: ${type} — do not edit, re-run npm run resenhas #}
{% extends "layouts/base.njk" %}
{% set current_type = ${JSON.stringify(type)} %}

{% block content %}
{% include "components/resenha-list.njk" %}
{% endblock %}
`;
        fs.writeFileSync(path.join(GEN_TIPOS, `${slugify(type)}.njk`), tipoNjk, "utf8");
    }

    // Write resenhas.json — required() by webpack.config.cjs at config-eval time
    fs.writeFileSync(DATA_JSON, JSON.stringify({ items, types }, null, 2), "utf8");

    console.log(`[build-resenhas] ${items.length} item(s), tipos: ${types.join(", ")}`);
}

build();
