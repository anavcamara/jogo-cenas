let cenas = [];

const estado = {
  modo: null,
  cenaAtual: null,
  tentativasRestantes: 3,
  dicasUsadas: 0,
  terminou: false,
  acertou: false
};

const elementos = {
  app: document.getElementById("app"),

  // Home
  homeScreen: document.getElementById("home-screen"),
  playButton: document.getElementById("play-button"),
  brandButton: document.getElementById("brand-button"),
  headerAction: document.getElementById("header-action"),
  loadError: document.getElementById("load-error"),

  // Jogo
  gameScreen: document.getElementById("game-screen"),
  backButton: document.getElementById("back-button"),
  gameModeLabel: document.getElementById("game-mode-label"),
  gameEyebrow: document.getElementById("game-eyebrow"),
  gameTitle: document.getElementById("game-title"),
  gameCopy: document.getElementById("game-copy"),
  dialogo: document.getElementById("dialogo"),

  // Complete a cena
  completeForm: document.getElementById("complete-form"),
  answerInput: document.getElementById("answer-input"),
  answerFeedback: document.getElementById("answer-feedback"),

  // Fora de contexto
  contextForm: document.getElementById("context-form"),
  contextInput: document.getElementById("context-input"),
  contextFeedback: document.getElementById("context-feedback"),
  suggestions: document.getElementById("suggestions"),

  // Jogo
  attemptDots: document.getElementById("attempt-dots"),
  hintButton: document.getElementById("hint-button"),
  hints: document.getElementById("hints"),

  // Feedback da rodada
  roundFeedback: document.getElementById("round-feedback"),
  feedbackMark: document.getElementById("feedback-mark"),
  feedbackEyebrow: document.getElementById("feedback-eyebrow"),
  feedbackTitle: document.getElementById("feedback-title"),
  feedbackMessage: document.getElementById("feedback-message"),
  feedbackAnswer: document.getElementById("feedback-answer"),
  feedbackWork: document.getElementById("feedback-work"),
  continueButton: document.getElementById("continue-button"),

  // Modais
  modeModal: document.getElementById("mode-modal"),
  howModal: document.getElementById("how-modal"),
  resultModal: document.getElementById("result-modal"),

  // Resultado
  resultEyebrow: document.getElementById("result-eyebrow"),
  resultTitle: document.getElementById("result-title"),
  resultCopy: document.getElementById("result-copy"),
  resultScore: document.getElementById("result-score"),
  resultWork: document.getElementById("result-work"),
  resultYear: document.getElementById("result-year"),
  resultGenre: document.getElementById("result-genre"),
  resultCharacter: document.getElementById("result-character"),
  resultAnswer: document.getElementById("result-answer"),
  playAgainButton: document.getElementById("play-again-button"),
  homeButton: document.getElementById("home-button")
};

elementos.playButton.disabled = true;

// ==============================
// NORMALIZAÇÃO
// ==============================

function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[.!?,;:"'“”‘’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ==============================
// SIMILARIDADE (LEVENSHTEIN)
// ==============================

function levenshtein(a, b) {
  const matriz = [];

  for (let i = 0; i <= a.length; i++) {
    matriz[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    matriz[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matriz[i][j] = matriz[i - 1][j - 1];
      } else {
        matriz[i][j] = Math.min(
          matriz[i - 1][j - 1] + 1,
          matriz[i][j - 1] + 1,
          matriz[i - 1][j] + 1
        );
      }
    }
  }

  return matriz[a.length][b.length];
}

function similaridade(a, b) {
  const distancia = levenshtein(a, b);
  const tamanhoMaximo = Math.max(a.length, b.length);
  const tamanhoMinimo = Math.min(a.length, b.length);

  if (tamanhoMaximo === 0) {
    return 1;
  }

  const proximidade = 1 - distancia / tamanhoMaximo;
  const penalidadeTamanho = tamanhoMinimo / tamanhoMaximo;

  return proximidade * penalidadeTamanho;
}

// ==============================
// MODAIS
// ==============================

function abrirModal(modal) {
  modal.hidden = false;
}

function fecharModal(modal) {
  modal.hidden = true;
}


// ==============================
// HOME
// ==============================

elementos.playButton.addEventListener("click", () => {
  abrirModal(elementos.modeModal);
});

elementos.headerAction.addEventListener("click", () => {
  abrirModal(elementos.howModal);
});

elementos.brandButton.addEventListener("click", voltarParaHome);


// Fecha modais pelos botões X
document.querySelectorAll(".modal-close").forEach(botao => {
  botao.addEventListener("click", () => {
    const modal = botao.closest(".modal-layer");
    fecharModal(modal);
  });
});


// Fecha pelo backdrop
document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
  backdrop.addEventListener("click", () => {
    const modal = backdrop.closest(".modal-layer");

    if (modal.id !== "result-modal") {
      fecharModal(modal);
    }
  });
});


// ==============================
// ESCOLHA DO MODO
// ==============================

document.querySelectorAll(".mode-option").forEach(botao => {
  botao.addEventListener("click", () => {
    const modo = botao.dataset.mode;

    iniciarJogo(modo);
  });
});


// ==============================
// INICIAR JOGO
// ==============================

function iniciarJogo(modo) {
  if (cenas.length === 0) {
    return;
  }

  estado.modo = modo;
  estado.cenaAtual = cenas[Math.floor(Math.random() * cenas.length)];
  estado.tentativasRestantes = 3;
  estado.dicasUsadas = 0;
  estado.terminou = false;
  estado.acertou = false;

  fecharModal(elementos.modeModal);

  elementos.homeScreen.hidden = true;
  elementos.gameScreen.hidden = false;

  prepararTelaDoModo();
  carregarCena();

  requestAnimationFrame(() => {
    elementos.gameScreen.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}


// ==============================
// PREPARAR MODO
// ==============================

function prepararTelaDoModo() {

  if (estado.modo === "complete") {

    elementos.gameModeLabel.textContent = "COMPLETE A CENA";
    elementos.gameEyebrow.textContent = "COMPLETE A FALA";
    elementos.gameTitle.textContent = "Continue a cena.";
    elementos.gameCopy.textContent =
      "Complete a fala antes que suas três tentativas acabem.";

    elementos.completeForm.hidden = false;
    elementos.contextForm.hidden = true;

  } else {

    elementos.gameModeLabel.textContent = "FORA DE CONTEXTO";
    elementos.gameEyebrow.textContent = "DESCUBRA A OBRA";
    elementos.gameTitle.textContent = "De onde veio essa fala?";
    elementos.gameCopy.textContent =
      "Digite o nome da obra e descubra se você reconhece a cena.";

    elementos.completeForm.hidden = true;
    elementos.contextForm.hidden = false;
  }
}


// ==============================
// CARREGAR CENA
// ==============================

function carregarCena() {
  const cena = estado.cenaAtual;

    elementos.answerInput.value = "";
    elementos.contextInput.value = "";

    elementos.answerInput.disabled = false;
    elementos.contextInput.disabled = false;

    elementos.completeForm.querySelector("button").disabled = false;
    elementos.contextForm.querySelector("button").disabled = false;

  elementos.answerFeedback.textContent = "";
  elementos.contextFeedback.textContent = "";

  elementos.hints.innerHTML = "";

  elementos.roundFeedback.hidden = true;
  elementos.roundFeedback.classList.remove("correct", "incorrect");

  elementos.hintButton.disabled = false;
  elementos.hintButton.innerHTML = `
    <span aria-hidden="true">+</span>
    <span>PEDIR DICA</span>
  `;

  renderizarTentativas();

  if (estado.modo === "complete") {

    elementos.dialogo.textContent =
      `“${cena.dialogo}”`;

    setTimeout(() => {
      elementos.answerInput.focus();
    }, 100);

  } else {

    const falaInteira = `${cena.dialogo} ${cena.resposta}`;

    elementos.dialogo.textContent =
      `“${falaInteira}”`;

    setTimeout(() => {
      elementos.contextInput.focus();
    }, 100);
  }
}


// ==============================
// TENTATIVAS
// ==============================

function renderizarTentativas() {

  elementos.attemptDots.innerHTML = "";

  for (let i = 0; i < 3; i++) {

    const ponto = document.createElement("span");

    ponto.classList.add("attempt-dot");

    if (i < estado.tentativasRestantes) {
      ponto.classList.add("available");
    }

    elementos.attemptDots.appendChild(ponto);
  }
}


// ==============================
// DICAS
// ==============================

function obterDicaAtual() {

  const cena = estado.cenaAtual;

  const dicas = [
    {
      titulo: "ANO",
      valor: cena.ano
    },
    {
      titulo: "GÊNERO",
      valor: cena.genero
    },
    {
      titulo: "PERSONAGEM",
      valor: cena.personagem
    }
  ];

  return dicas[estado.dicasUsadas];
}


function mostrarDica() {

  if (estado.terminou) {
    return;
  }

  const dica = obterDicaAtual();

  if (!dica) {
    return;
  }

  const bloco = document.createElement("div");

  bloco.classList.add("hint");

  bloco.innerHTML = `
    <span class="hint-number">
      DICA ${estado.dicasUsadas + 1}
    </span>

    <strong>${dica.titulo}</strong>

    <p>${dica.valor || "Informação ainda não cadastrada."}</p>
  `;

  elementos.hints.appendChild(bloco);

  estado.dicasUsadas++;

  if (estado.dicasUsadas < 3) {

    elementos.hintButton.innerHTML = `
      <span aria-hidden="true">+</span>
      <span>PEDIR OUTRA DICA</span>
    `;

  } else {

    elementos.hintButton.innerHTML = `
      <span>TODAS AS DICAS REVELADAS</span>
    `;

    elementos.hintButton.disabled = true;
  }
}


// ==============================
// SUBMIT COMPLETE A CENA
// ==============================

elementos.completeForm.addEventListener("submit", event => {

  event.preventDefault();

  if (estado.modo !== "complete" || estado.terminou) {
    return;
  }

  verificarResposta(elementos.answerInput.value);
});


// ==============================
// SUBMIT FORA DE CONTEXTO
// ==============================

elementos.contextForm.addEventListener("submit", event => {

  event.preventDefault();

  if (estado.modo !== "context" || estado.terminou) {
    return;
  }

  esconderSugestoes();

  verificarObra(elementos.contextInput.value);
});


// ==============================
// VERIFICAR RESPOSTA
// ==============================

function verificarResposta(respostaJogador) {

  const respostaNormalizada = normalizar(respostaJogador);

  if (!respostaNormalizada) {
    elementos.answerFeedback.textContent =
      "Digite uma resposta antes de enviar.";

    elementos.answerInput.focus();

    return;
  }

  const cena = estado.cenaAtual;

  const TOLERANCIA_ACERTO = 0.85;

  const acertou = similaridade(respostaNormalizada, normalizar(cena.resposta)) >= TOLERANCIA_ACERTO;

  if (acertou) {
    estado.tentativasRestantes--;
    finalizarRodada(true);
    return;
  }

  perderTentativa();

  elementos.answerFeedback.textContent =
    estado.tentativasRestantes > 0
      ? "Não foi dessa vez. Tente novamente."
      : "";
}


// ==============================
// VERIFICAR OBRA
// ==============================

function verificarObra(respostaJogador) {

  const respostaNormalizada = normalizar(respostaJogador);

  if (!respostaNormalizada) {
    elementos.contextFeedback.textContent =
      "Digite uma obra antes de enviar.";

    elementos.contextInput.focus();

    return;
  }

  const cena = estado.cenaAtual;

  const obraNormalizada = normalizar(cena.obra);
  const acertou =
    respostaNormalizada.length >= 3 &&
    (obraNormalizada === respostaNormalizada ||
      obraNormalizada.includes(respostaNormalizada) ||
      respostaNormalizada.includes(obraNormalizada));

  if (acertou) {
    estado.tentativasRestantes--;
    finalizarRodada(true);
    return;
  }

  perderTentativa();

  elementos.contextFeedback.textContent =
    estado.tentativasRestantes > 0
      ? "Ainda não. Tente outra vez."
      : "";
}


// ==============================
// PERDER TENTATIVA
// ==============================

function perderTentativa() {

  estado.tentativasRestantes--;

  renderizarTentativas();

  if (estado.tentativasRestantes <= 0) {

    finalizarRodada(false);

    return;
  }
}


// ==============================
// FINALIZAR RODADA
// ==============================

function finalizarRodada(acertou) {

  estado.acertou = acertou;
  estado.terminou = true;

  elementos.roundFeedback.classList.remove("correct", "incorrect");
  elementos.roundFeedback.classList.add(acertou ? "correct" : "incorrect");

  elementos.answerInput.disabled = true;
  elementos.contextInput.disabled = true;

  elementos.completeForm.querySelector("button").disabled = true;
  elementos.contextForm.querySelector("button").disabled = true;

  elementos.hintButton.disabled = true;

  elementos.roundFeedback.hidden = false;

  if (acertou) {

    elementos.feedbackMark.textContent = "✓";
    elementos.feedbackEyebrow.textContent = "ACERTOU";
    elementos.feedbackTitle.textContent = "Você reconheceu a cena.";
    elementos.feedbackMessage.textContent =
      "Boa. Essa você não deixou passar.";

  } else {

    elementos.feedbackMark.textContent = "×";
    elementos.feedbackEyebrow.textContent = "FIM DAS TENTATIVAS";
    elementos.feedbackTitle.textContent = "Essa passou longe.";
    elementos.feedbackMessage.textContent =
      "A resposta correta era:";
  }

  elementos.feedbackAnswer.textContent =
    `"${estado.cenaAtual.resposta}"`;

  elementos.feedbackWork.textContent =
    estado.cenaAtual.obra;

  elementos.continueButton.textContent =
    "VER RESULTADO";

  elementos.roundFeedback.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}


// ==============================
// RESULTADO FINAL
// ==============================

function mostrarResultado() {

  const cena = estado.cenaAtual;

  elementos.resultEyebrow.textContent =
    estado.acertou ? "VOCÊ ACERTOU" : "RESULTADO";

  elementos.resultTitle.textContent =
    estado.acertou
      ? "Essa você conhecia."
      : "Agora você conhece a resposta.";

  elementos.resultCopy.textContent =
    estado.acertou
      ? "Você completou o desafio."
      : "A cena fica registrada para a próxima tentativa.";

  elementos.resultWork.textContent =
    cena.obra || "Não informado";

  elementos.resultYear.textContent =
    cena.ano || "Não informado";

  elementos.resultGenre.textContent =
    cena.genero || "Não informado";

  elementos.resultCharacter.textContent =
    cena.personagem || "Não informado";

  elementos.resultAnswer.textContent =
    `"${cena.resposta}"`;

  elementos.resultScore.textContent =
    `${3 - estado.tentativasRestantes} tentativa(s) utilizada(s)`;

  abrirModal(elementos.resultModal);
}


// ==============================
// CONTINUAR
// ==============================

elementos.continueButton.addEventListener("click", mostrarResultado);


// ==============================
// JOGAR NOVAMENTE
// ==============================

elementos.playAgainButton.addEventListener("click", () => {

  fecharModal(elementos.resultModal);

  iniciarJogo(estado.modo);
});


// ==============================
// VOLTAR PARA HOME
// ==============================

function voltarParaHome() {

  fecharModal(elementos.modeModal);
  fecharModal(elementos.howModal);
  fecharModal(elementos.resultModal);

  elementos.gameScreen.hidden = true;
  elementos.homeScreen.hidden = false;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


elementos.homeButton.addEventListener("click", voltarParaHome);

elementos.backButton.addEventListener("click", () => {

  elementos.gameScreen.hidden = true;
  elementos.homeScreen.hidden = false;

  abrirModal(elementos.modeModal);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});


// ==============================
// AUTOCOMPLETE LOCAL
// ==============================

elementos.contextInput.addEventListener("input", () => {

  if (estado.modo !== "context" || estado.terminou) {
    return;
  }

  const texto = normalizar(elementos.contextInput.value);

  if (texto.length < 2) {
    esconderSugestoes();
    return;
  }

  const obras = [...new Set(
    cenas
      .map(cena => cena.obra)
      .filter(Boolean)
  )];

  const resultados = obras.filter(obra =>
    normalizar(obra).includes(texto)
  );

  mostrarSugestoes(resultados);
});


function mostrarSugestoes(resultados) {

  elementos.suggestions.innerHTML = "";

  if (resultados.length === 0) {
    esconderSugestoes();
    return;
  }

  resultados.slice(0, 5).forEach(obra => {

    const opcao = document.createElement("button");

    opcao.type = "button";
    opcao.classList.add("suggestion-option");

    opcao.textContent = obra;

    opcao.addEventListener("click", () => {

      elementos.contextInput.value = obra;

      esconderSugestoes();

      elementos.contextInput.focus();
    });

    elementos.suggestions.appendChild(opcao);
  });
}


function esconderSugestoes() {
  elementos.suggestions.innerHTML = "";
}


// ==============================
// PEDIR DICA
// ==============================

elementos.hintButton.addEventListener("click", mostrarDica);


// ==============================
// CARREGAR JSON
// ==============================

async function carregarCenas() {

  try {

    const resposta = await fetch("data/cenas.json");

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar as cenas.");
    }

    cenas = await resposta.json();
    elementos.playButton.disabled = false;

  } catch (erro) {
    console.error(erro);
    elementos.loadError.hidden = false;
  }
}

carregarCenas();