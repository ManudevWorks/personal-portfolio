/**
 * build-blog.cjs
 * Pre-build step: converts src/content/blog/*.md into:
 *   - src/pages/blog/_generated/posts/<slug>.njk  (one per post)
 *   - src/pages/blog/_generated/tags/<tag>.njk    (one per unique tag)
 *   - src/data/posts.json                         (listing + allTags data)
 *
 * Run automatically via npm prebuild / prebuild:prod / prewatch.
 */

"use strict";

const fs   = require("fs");
const path = require("path");
const glob = require("glob");
const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

const ROOT        = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "src", "content", "blog");
const GEN_POSTS   = path.join(ROOT, "src", "pages", "blog", "_generated", "posts");
const GEN_TAGS    = path.join(ROOT, "src", "pages", "blog", "_generated", "tags");
const POSTS_JSON  = path.join(ROOT, "src", "data", "posts.json");

// ── helpers ──────────────────────────────────────────────────────────────────

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
 * Prevent the rendered HTML from accidentally closing the Nunjucks {% raw %}
 * block we wrap it in. Replaces any literal "{% endraw %}" in the HTML with
 * a safe equivalent that outputs the same text via a Nunjucks expression.
 */
function safeRaw(html) {
    // Replace {% endraw %} (with optional whitespace/dashes) so it doesn't
    // prematurely close our {% raw %} block. We break it into endraw + raw
    // which closes and immediately re-opens the raw section, consuming the
    // problematic tag without outputting anything extra.
    return html.replace(/{%-?\s*endraw\s*-?%}/g, "{% endraw %}{% raw %}");
}

function formatDate(dateInput) {
    // Parse the date as a UTC date to avoid timezone shifting.
    // Frontmatter dates like "2026-06-20" are treated as UTC midnight by gray-matter.
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return new Intl.DateTimeFormat("pt-BR", {
        day:      "2-digit",
        month:    "long",
        year:     "numeric",
        timeZone: "UTC",
    }).format(d);
}

// ── main ─────────────────────────────────────────────────────────────────────

function build() {
    // Ensure output directories exist and are clean
    fs.mkdirSync(GEN_POSTS, { recursive: true });
    fs.mkdirSync(GEN_TAGS,  { recursive: true });

    // Remove stale generated files
    for (const f of glob.sync("*.njk", { cwd: GEN_POSTS })) {
        fs.rmSync(path.join(GEN_POSTS, f));
    }
    for (const f of glob.sync("*.njk", { cwd: GEN_TAGS })) {
        fs.rmSync(path.join(GEN_TAGS, f));
    }

    // Discover source markdown files
    const mdFiles = glob.sync("*.md", { cwd: CONTENT_DIR });

    const posts = [];

    for (const file of mdFiles) {
        const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
        const { data, content } = matter(raw);

        // Skip drafts
        if (data.draft) continue;

        const slug        = data.slug ? slugify(String(data.slug)) : slugify(path.basename(file, ".md"));
        const title       = data.title || slug;
        const date        = data.date ? new Date(data.date) : null;
        const dateIso     = date ? date.toISOString().slice(0, 10) : "";
        const dateDisplay = date ? formatDate(date) : "";
        const tags        = Array.isArray(data.tags) ? data.tags.map(String) : [];
        const excerpt     = data.excerpt || "";

        // Render markdown body and make it safe for {% raw %}
        const bodyHtml = safeRaw(md.render(content));

        // Build the tags <ul> HTML for the post page (so the layout doesn't need
        // to loop over a variable — avoids Nunjucks set-scope subtleties)
        const tagsHtml = tags.length
            ? `<ul class="post__tags list-unstyled">\n` +
              tags.map(t => `    <li class="post__tag">${t}</li>`).join("\n") +
              `\n</ul>`
            : "";

        // Write the generated post page
        const postNjk =
`{# AUTO-GENERATED from src/content/blog/${file} — do not edit, re-run npm run blog #}
{% extends "layouts/post.njk" %}

{% block post_title %}${title}{% endblock %}
{% block post_date_iso %}${dateIso}{% endblock %}
{% block post_date_display %}${dateDisplay}{% endblock %}
{% block post_tags %}${tagsHtml}{% endblock %}
{% block post_body %}{% raw %}
${bodyHtml}
{% endraw %}{% endblock %}
`;
        fs.writeFileSync(path.join(GEN_POSTS, `${slug}.njk`), postNjk, "utf8");

        posts.push({ slug, title, date: dateIso, dateDisplay, excerpt, tags });
    }

    // Sort newest-first
    posts.sort((a, b) => (a.date < b.date ? 1 : -1));

    // Collect unique tags (preserving first-seen casing, sorted alphabetically)
    const tagSet = new Set();
    for (const p of posts) {
        for (const t of p.tags) tagSet.add(t);
    }
    const allTags = [...tagSet].sort();

    // Write per-tag listing pages
    for (const tag of allTags) {
        const tagSlug = slugify(tag);
        const tagNjk =
`{# AUTO-GENERATED for tag: ${tag} — do not edit, re-run npm run blog #}
{% extends "layouts/base.njk" %}
{% set current_tag = ${JSON.stringify(tag)} %}

{% block content %}
{% include "components/blog-list.njk" %}
{% endblock %}
`;
        fs.writeFileSync(path.join(GEN_TAGS, `${tagSlug}.njk`), tagNjk, "utf8");
    }

    // Write posts.json — this file is required() by webpack.config.cjs at config-eval
    // time, so it must exist before webpack is invoked.
    const postsJson = { posts, allTags };
    fs.writeFileSync(POSTS_JSON, JSON.stringify(postsJson, null, 2), "utf8");

    console.log(`[build-blog] ${posts.length} post(s), ${allTags.length} tag(s): ${allTags.join(", ")}`);
}

build();
