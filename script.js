//Cria um array com as cenas, seus respectivos IDs, títulos, diálogos e resposta
const cenas = [
    { id: 1, filme: "Round 6", dialogo: "Eu acho que precisamos...", resposta: "conversar sobre isso." },
    { id: 2, filme: "Friends", dialogo: "Como assim você...", resposta: "esqueceu do aniversário dela." },
    { id: 3, filme: "Harry Potter e a Pedra Filosofal", dialogo: "Você é...", resposta: "um bruxo, Harry."}
];

//Sorteia um índice aleatório
const indiceAleatorio = Math.floor(Math.random() * cenas.length);
const cenaAtual = cenas[indiceAleatorio];

document.getElementById("dialogo").textContent = cenaAtual.dialogo;

const inputResposta = document.getElementById("resposta");

//Levenshtein

function normalizar(texto) {
    return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .trim();
}

function levenshtein(a, b) {
    const matriz = [];

  // Primeira coluna: distância de "a" até uma string vazia = remover tudo
    for (let i = 0; i <= a.length; i++) {
        matriz[i] = [i];
    }
  // Primeira linha: distância de uma string vazia até "b" = inserir tudo
    for (let j = 0; j <= b.length; j++) {
        matriz[0][j] = j;
    }

  // Preenche o resto da tabela, célula por célula
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
        // Letras iguais: não precisa de operação extra, repete o valor da diagonal
        matriz[i][j] = matriz[i - 1][j - 1];
        } else {
        // Letras diferentes: pega o menor caminho entre substituir, inserir ou remover
        matriz[i][j] = Math.min(
          matriz[i - 1][j - 1] + 1, // substituir
          matriz[i][j - 1] + 1,     // inserir
          matriz[i - 1][j] + 1      // remover
        );
        }
        }
    }

    return matriz[a.length][b.length]; // resultado final: última célula da tabela
}

function calcularPontuacao(respostaJogador, respostaCorreta) {
    const a = normalizar(respostaJogador);
    const b = normalizar(respostaCorreta);

    const distancia = levenshtein(a, b);
    const tamanhoMaximo = Math.max(a.length, b.length);

    if (tamanhoMaximo === 0) return 100;

    const similaridade = 1 - (distancia / tamanhoMaximo);
    return Math.round(similaridade * 100);
}

document.getElementById("botao-enviar").addEventListener("click", function() {
    const pontuacao = calcularPontuacao(inputResposta.value, cenaAtual.resposta);
    document.getElementById("pontuacao").textContent = pontuacao;

    document.getElementById("resultado").classList.remove("escondido");
    document.getElementById("resposta-correta").textContent = cenaAtual.resposta;
    document.getElementById("filme-revelado").textContent = cenaAtual.filme;
});

