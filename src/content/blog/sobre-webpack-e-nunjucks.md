---
title: "Por que Webpack + Nunjucks sem framework?"
date: 2026-06-10
tags: ["web", "arquitetura"]
excerpt: "Uma reflexão sobre a escolha de construir sem framework: quando a simplicidade é a decisão certa."
---

Quando comecei este portfólio, a pergunta óbvia era: *qual framework usar?*

Next.js? Astro? Hugo? Eleventy?

Optei por nenhum deles — ao menos não de forma ortodoxa. Webpack e Nunjucks. Por quê?

## Controle sem magia

Frameworks modernos são poderosos exatamente porque abstraem decisões. Mas abstrações têm custo: quando algo dá errado, é preciso entender a mágica para consertar.

Com Webpack e Nunjucks, **cada linha do build é minha**. Sei exatamente o que entra, o que sai e por quê.

## O custo real

Não é gratuito. Precisei escrever:

- Um pipeline de build manual
- Suporte a markdown via script pre-build
- Sistema de páginas dinâmicas por arquivos
- Filtragem de posts por categoria

Nenhuma dessas tarefas é difícil — mas todas teriam sido "gratuitas" em um framework.

## A troca que vale a pena

Para um portfólio pessoal — um projeto que existe para demonstrar *como* penso sobre código — faz sentido que a própria construção do site seja expressão dessa forma de pensar.

A simplicidade não é preguiça. É escolha.

---

No próximo post, vou detalhar a arquitetura de componentes Nunjucks usada aqui.
