/**
 * new-resenha.cjs
 * Scaffolds a new resenha markdown file in src/content/resenhas/.
 *
 * Usage:
 *   npm run new-resenha -- <slug> <type> [author] [title]
 *
 * Examples:
 *   npm run new-resenha -- ok-computer musica "Radiohead" "OK Computer"
 *   npm run new-resenha -- o-processo livro "Franz Kafka" "O Processo"
 *
 * Types: musica | livro
 */

"use strict";

const fs   = require("fs");
const path = require("path");

const CONTENT_DIR = path.resolve(__dirname, "..", "src", "content", "resenhas");

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

const [,, rawSlug, type, author = "", rawTitle = ""] = process.argv;

if (!rawSlug || !type) {
    console.error("Uso: npm run new-resenha -- <slug> <tipo> [autor] [titulo]");
    console.error("Tipos válidos: musica | livro");
    process.exit(1);
}

const validTypes = ["musica", "livro"];
if (!validTypes.includes(type)) {
    console.error(`Tipo inválido: "${type}". Use: ${validTypes.join(" | ")}`);
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
type: ${type}
author: "${author}"
date: ${today()}
rating:
cover: ""
tags: []
excerpt: ""
---

`;

fs.mkdirSync(CONTENT_DIR, { recursive: true });
fs.writeFileSync(file, template, "utf8");

console.log(`[new-resenha] Criado: src/content/resenhas/${slug}.md`);
