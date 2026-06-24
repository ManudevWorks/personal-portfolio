---
title: "Linguagem e código: o que têm em comum"
date: 2026-05-15
tags: ["reflexoes", "linguistica"]
excerpt: "Programar e falar uma língua compartilham mais do que parece: sistemas de regras, evolução orgânica e a tensão entre forma e sentido."
---

Estudo linguística como hobby. E quanto mais aprendo sobre gramática, mais percebo que programar e falar uma língua são atividades estruturalmente parecidas.

## Sintaxe e semântica

Em linguística, distinguimos *sintaxe* (a estrutura das sentenças) de *semântica* (o seu significado). Em código, a mesma distinção existe: um programa pode estar sintaticamente correto e semanticamente errado.

```
// Sintaxe: OK. Semântica: ???
const idades = usuarios.map(u => u.nome);
```

A sintaxe passou. O compilador não reclamou. Mas o código faz a coisa errada — extrai nomes onde deveriam estar idades.

## Línguas evoluem, APIs também

Línguas naturais mudam ao longo do tempo — palavras ganham novos sentidos, estruturas gramaticais se simplificam ou complexificam. APIs fazem o mesmo. O que ontem era `callback`, hoje é `Promise`, amanhã será outra coisa.

Nenhuma das duas evolui por decreto. Ambas evoluem por uso.

## O que fica

O que permanece em qualquer sistema de comunicação — seja língua natural ou linguagem de programação — é a tensão entre **expressividade** e **precisão**.

Expressividade demais cria ambiguidade. Precisão demais cria rigidez.

O equilíbrio é a arte.
