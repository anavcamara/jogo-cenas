# Out of Context

Um jogo de memória e reconhecimento de cenas de filmes e séries. Complete falas ou descubra de qual obra elas vieram — tudo baseado em falas curtas e icônicas do cinema e da TV.

## Sobre o projeto

**Out of Context** tem dois modos de jogo:

- **Complete a Cena** — o jogo mostra o início de uma fala famosa, e você precisa digitar a continuação. A resposta não precisa ser 100% idêntica: o sistema usa um algoritmo de similaridade de texto (distância de Levenshtein) para aceitar respostas próximas o suficiente.
- **Fora de Contexto** — o jogo mostra a fala inteira, e você precisa adivinhar de qual filme ou série ela veio, com ajuda de autocomplete.

Em ambos os modos, você tem 3 tentativas por rodada e pode pedir dicas progressivas (ano, gênero, personagem).

Este é um projeto pessoal de estudo e portfólio, desenvolvido para praticar lógica de programação, manipulação de DOM, estruturas de dados e boas práticas de organização de código em JavaScript puro.

## Tecnologias

- HTML, CSS e JavaScript puro (sem frameworks)
- Sem backend — os dados ficam num arquivo `cenas.json`, carregado no navegador via `fetch`
- Hospedado com GitHub Pages

## Como rodar localmente

1. Clone o repositório
2. Abra a pasta num servidor local (o navegador bloqueia o `fetch` de arquivos locais abertos direto com duplo clique). No VS Code, a extensão **Live Server** resolve isso com um clique.
3. Acesse a página pelo endereço que o Live Server abrir

## Sobre as falas usadas

As falas incluídas são trechos curtos (uma ou duas frases) de filmes e séries conhecidos, usadas aqui com finalidade educacional e de portfólio pessoal, sem fins comerciais. Todos os direitos sobre as obras originais pertencem aos seus respectivos criadores e estúdios.

## Próximos passos

- Dar mais contexto às cenas (diálogo com mais de uma fala antes da pausa, não só uma frase isolada)
- Modo de desafio diário (mesma cena para todo mundo, uma vez por dia)
- Estatísticas persistentes entre sessões