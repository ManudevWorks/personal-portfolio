/**
 * new-post.cjs
 * Scaffolds a new blog post markdown file in src/content/blog/.
 *
 * Usage:
 *   npm run new-post -- <slug> [title]
 *
 * Examples:
 *   npm run new-post -- meu-primeiro-post "Meu Primeiro Post"
 *   npm run new-post -- sobre-css
 */

"use strict";

const fs   = require("fs");
const path = require("path");

const CONTENT_DIR = path.resolve(__dirname, "..", "src", "content", "blog");

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

function today() {
    return new Date().toISOString().slice(0, 10);
}

const [,, rawSlug, rawTitle = ""] = process.argv;

if (!rawSlug) {
    console.error("Uso: npm run new-post -- <slug> [titulo]");
    process.exit(1);
}

const slug  = slugify(rawSlug);
const title = rawTitle || rawSlug;
const file  = path.join(CONTENT_DIR, `${slug}.md`);

if (fs.existsSync(file)) {
    console.error(`Arquivo já existe: ${file}`);
    process.exit(1);
}

const template =
`---
title: "${title}"
date: ${today()}
tags: []
excerpt: ""
---

`;

fs.mkdirSync(CONTENT_DIR, { recursive: true });
fs.writeFileSync(file, template, "utf8");

console.log(`[new-post] Criado: src/content/blog/${slug}.md`);
