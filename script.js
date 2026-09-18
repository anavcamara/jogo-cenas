let cenas = [];

const estado = {
  modo: null,
  cena: null,
  tentativa: 0,
  maxTentativas: 3,
  dicasUsadas: 0,
  respostas: [],
  partida: 0,
  acertou: false
};

const els = {
  homeScreen: document.querySelector("#home-screen"),
  gameScreen: document.querySelector("#game-screen"),
  playButton: document.querySelector("#play-button"),
  homeCopy: document.querySelector(".home-copy"),
  brandButton: document.querySelector("#brand-button"),
  headerAction: document.querySelector("#header-action"),
  backButton: document.querySelector("#back-button"),
  gameModeLabel: document.querySelector("#game-mode-label"),
  gameEyebrow: document.querySelector("#game-eyebrow"),
  gameTitle: document.querySelector("#game-title"),
  gameCopy: document.querySelector("#game-copy"),
  dialogo: document.querySelector("#dialogo"),
  completeForm: document.querySelector("#complete-form"),
  answerInput: document.querySelector("#answer-input"),
  contextForm: document.querySelector("#context-form"),
  contextInput: document.querySelector("#context-input"),
  suggestions: document.querySelector("#suggestions"),
  attemptDots: document.querySelector("#attempt-dots"),
  hintButton: document.querySelector("#hint-button"),
  hints: document.querySelector("#hints"),
  roundFeedback: document.querySelector("#round-feedback"),
  feedbackMark: document.querySelector("#feedback-mark"),
  feedbackEyebrow: document.querySelector("#feedback-eyebrow"),
  feedbackTitle: document.querySelector("#feedback-title"),
  feedbackMessage: document.querySelector("#feedback-message"),
  feedbackAnswer: document.querySelector("#feedback-answer"),
  feedbackWork: document.querySelector("#feedback-work"),
  continueButton: document.querySelector("#continue-button"),
  answerFeedback: document.querySelector("#answer-feedback"),
  contextFeedback: document.querySelector("#context-feedback"),
  modeModal: document.querySelector("#mode-modal"),
  howModal: document.querySelector("#how-modal"),
  resultModal: document.querySelector("#result-modal"),
  resultEyebrow: document.querySelector("#result-eyebrow"),
  resultTitle: document.querySelector("#result-title"),
  resultCopy: document.querySelector("#result-copy"),
  resultScore: document.querySelector("#result-score"),
  playAgainButton: document.querySelector("#play-again-button"),
  homeButton: document.querySelector("#home-button")
};

function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[.!?,;:\"'“”‘’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function abrirModal(modal) {
  modal.hidden = false;
  document.body.classList.add("modal-open");
  const primeiroBotao = modal.querySelector("button:not(.modal-close)");
  if (primeiroBotao) primeiroBotao.focus();
}

function fecharModal(modal) {
  modal.hidden = true;
  if ([els.modeModal, els.howModal, els.resultModal].every(item => item.hidden)) {
    document.body.classList.remove("modal-open");
  }
}

function irParaHome() {
  fecharModal(els.modeModal);
  fecharModal(els.howModal);
  fecharModal(els.resultModal);
  els.gameScreen.hidden = true;
  els.homeScreen.hidden = false;
  estado.modo = null;
}

function abrirEscolhaDeModo() {
  abrirModal(els.modeModal);
}

function iniciarModo(modo) {
  estado.modo = modo;
  estado.cena = cenaAleatoria();
  estado.tentativa = 0;
  estado.dicasUsadas = 0;
  estado.respostas = [];
  estado.acertou = false;
  estado.partida += 1;

  fecharModal(els.modeModal);
  els.homeScreen.hidden = true;
  els.gameScreen.hidden = false;

  configurarInterfaceDoModo();
  prepararRodada();
}

function cenaAleatoria() {
  if (!cenas.length) return null;
  return cenas[Math.floor(Math.random() * cenas.length)];
}

function configurarInterfaceDoModo() {
  const ehCompletar = estado.modo === "complete";

  els.gameModeLabel.textContent = ehCompletar ? "MODO 01" : "MODO 02";
  els.gameEyebrow.textContent = ehCompletar ? "COMPLETE A CENA" : "FORA DE CONTEXTO";
  els.gameTitle.textContent = ehCompletar ? "Continue a fala." : "Descubra a obra.";
  els.gameCopy.textContent = ehCompletar
    ? "Uma frase incompleta. Três tentativas."
    : "Você sabe de onde essa fala veio?";

  els.completeForm.classList.toggle("is-hidden", !ehCompletar);
  els.contextForm.classList.toggle("is-hidden", ehCompletar);
}

function prepararRodada() {
  if (!estado.cena) return;

  els.dialogo.textContent = estado.cena.dialogo;
  els.answerInput.value = "";
  els.contextInput.value = "";
  els.answerFeedback.textContent = "";
  els.contextFeedback.textContent = "";
  els.hints.innerHTML = "";
  els.suggestions.innerHTML = "";
  els.suggestions.classList.remove("is-visible");
  els.roundFeedback.hidden = true;
  els.hintButton.disabled = false;

  atualizarTentativas();

  requestAnimationFrame(() => {
    const input = estado.modo === "complete" ? els.answerInput : els.contextInput;
    input.focus();
  });
}

function atualizarTentativas() {
  els.attemptDots.innerHTML = "";

  for (let i = 0; i < estado.maxTentativas; i += 1) {
    const dot = document.createElement("span");
    dot.className = "attempt-dot";
    if (i >= estado.tentativa) dot.classList.add("is-active");
    if (i === estado.tentativa - 1) dot.classList.add("is-used");
    dot.setAttribute("aria-hidden", "true");
    els.attemptDots.appendChild(dot);
  }
}

function obterDicas() {
  const cena = estado.cena || {};
  const dicas = [];

  if (cena.contexto) dicas.push({ titulo: "CONTEXTO", texto: cena.contexto });
  if (cena.personagem) dicas.push({ titulo: "PERSONAGEM", texto: cena.personagem });
  if (cena.genero) dicas.push({ titulo: "GÊNERO", texto: cena.genero });
  if (cena.ano) dicas.push({ titulo: "LANÇAMENTO", texto: String(cena.ano) });

  const resposta = estado.modo === "complete" ? cena.resposta : cena.obra;
  if (resposta) {
    const pista = normalizar(resposta).slice(0, 3);
    dicas.push({ titulo: "COMEÇA COM", texto: `${pista}...` });
  }

  return dicas;
}

function pedirDica() {
  const dicas = obterDicas();

  if (estado.dicasUsadas >= dicas.length) {
    els.hintButton.disabled = true;
    return;
  }

  const dica = dicas[estado.dicasUsadas];
  estado.dicasUsadas += 1;

  const item = document.createElement("div");
  item.className = "hint-item";
  item.innerHTML = `<span>DICA ${estado.dicasUsadas}</span><p></p>`;
  item.querySelector("p").textContent = dica.texto;
  els.hints.appendChild(item);

  els.hintButton.querySelector("span:last-child").textContent =
    estado.dicasUsadas < dicas.length ? "PEDIR OUTRA DICA" : "TODAS AS DICAS";

  if (estado.dicasUsadas >= dicas.length) els.hintButton.disabled = true;
}

function avaliarResposta(resposta) {
  const atual = estado.cena;

  if (estado.modo === "complete") {
    return normalizar(resposta) === normalizar(atual.resposta);
  }

  return normalizar(resposta) === normalizar(atual.obra);
}

function registrarTentativa(resposta) {
  estado.tentativa += 1;
  estado.respostas.push(resposta);
  atualizarTentativas();
}

function mostrarErro(input, feedbackElement) {
  input.classList.remove("shake");
  void input.offsetWidth;
  input.classList.add("shake");
  feedbackElement.textContent = estado.tentativa < estado.maxTentativas
    ? "NÃO FOI DESSA VEZ. Tente novamente."
    : "NÃO FOI DESSA VEZ.";
}

function finalizarRodada(acertou) {
  estado.acertou = acertou;

  els.answerInput.disabled = true;
  els.contextInput.disabled = true;
  els.completeForm.querySelector("button").disabled = true;
  els.contextForm.querySelector("button").disabled = true;
  els.hintButton.disabled = true;

  els.roundFeedback.hidden = false;
  els.roundFeedback.className = `round-feedback ${acertou ? "correct" : "incorrect"}`;
  els.feedbackEyebrow.textContent = acertou ? "ACERTO" : "FIM DAS TENTATIVAS";
  els.feedbackTitle.textContent = acertou ? "Você matou a cena." : "Essa não foi.";
  els.feedbackMessage.textContent = acertou
    ? "Boa. Você acertou antes de esgotar as tentativas."
    : "As três tentativas acabaram. A resposta certa está abaixo.";

  els.feedbackAnswer.textContent = estado.modo === "complete"
    ? estado.cena.resposta
    : estado.cena.obra;
  els.feedbackWork.textContent = estado.cena.obra;
  els.continueButton.textContent = "VER RESULTADO →";

  els.roundFeedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function enviarResposta(event) {
  event.preventDefault();

  if (estado.acertou || estado.tentativa >= estado.maxTentativas) return;

  const input = estado.modo === "complete" ? els.answerInput : els.contextInput;
  const feedback = estado.modo === "complete" ? els.answerFeedback : els.contextFeedback;
  const resposta = input.value.trim();

  if (!resposta) {
    feedback.textContent = "Digite uma resposta antes de enviar.";
    input.focus();
    return;
  }

  fecharSugestoes();
  const acertou = avaliarResposta(resposta);
  registrarTentativa(resposta);

  if (acertou) {
    input.value = resposta;
    finalizarRodada(true);
    return;
  }

  if (estado.tentativa >= estado.maxTentativas) {
    finalizarRodada(false);
    return;
  }

  mostrarErro(input, feedback);
  input.value = "";
  input.focus();
}

function mostrarResultadoFinal() {
  els.resultEyebrow.textContent = estado.acertou ? "RESULTADO" : "FIM DA RODADA";
  els.resultTitle.textContent = estado.acertou ? "Você levou essa." : "A cena escapou dessa vez.";
  els.resultCopy.textContent = estado.modo === "complete"
    ? `A continuação era: “${estado.cena.resposta}” — ${estado.cena.obra}.`
    : `A obra era “${estado.cena.obra}”.`;
  els.resultScore.textContent = `${estado.tentativa} / ${estado.maxTentativas} TENTATIVAS`;

  abrirModal(els.resultModal);
}

function reiniciarModo() {
  fecharModal(els.resultModal);
  iniciarModo(estado.modo);
}

function fecharSugestoes() {
  els.suggestions.classList.remove("is-visible");
  els.suggestions.innerHTML = "";
}

function encontrarSugestoes(texto) {
  const termo = normalizar(texto);
  if (termo.length < 2) return [];

  return cenas
    .filter(cena => normalizar(cena.obra).includes(termo))
    .slice(0, 5);
}

function renderizarSugestoes() {
  const sugestoes = encontrarSugestoes(els.contextInput.value);
  els.suggestions.innerHTML = "";

  if (!sugestoes.length || els.contextInput.value.trim().length < 2) {
    fecharSugestoes();
    return;
  }

  sugestoes.forEach(cena => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "suggestion";
    button.setAttribute("role", "option");

    const title = document.createElement("span");
    title.textContent = cena.obra;
    const type = document.createElement("small");
    type.textContent = cena.tipo || "obra";

    button.append(title, type);
    button.addEventListener("click", () => {
      els.contextInput.value = cena.obra;
      fecharSugestoes();
      els.contextInput.focus();
    });

    els.suggestions.appendChild(button);
  });

  els.suggestions.classList.add("is-visible");
}

function configurarListeners() {
  els.playButton.addEventListener("click", abrirEscolhaDeModo);
  els.brandButton.addEventListener("click", irParaHome);
  els.headerAction.addEventListener("click", () => abrirModal(els.howModal));
  els.backButton.addEventListener("click", irParaHome);
  els.hintButton.addEventListener("click", pedirDica);
  els.completeForm.addEventListener("submit", enviarResposta);
  els.contextForm.addEventListener("submit", enviarResposta);
  els.continueButton.addEventListener("click", mostrarResultadoFinal);
  els.playAgainButton.addEventListener("click", reiniciarModo);
  els.homeButton.addEventListener("click", irParaHome);
  els.contextInput.addEventListener("input", renderizarSugestoes);

  document.querySelectorAll("[data-mode]").forEach(button => {
    button.addEventListener("click", () => iniciarModo(button.dataset.mode));
  });

  document.querySelectorAll(".modal-close").forEach(button => {
    button.addEventListener("click", () => fecharModal(button.closest(".modal-layer")));
  });

  document.querySelectorAll("[data-close-modal]").forEach(backdrop => {
    backdrop.addEventListener("click", () => fecharModal(document.getElementById(backdrop.dataset.closeModal)));
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (!els.resultModal.hidden) return;
      if (!els.modeModal.hidden) fecharModal(els.modeModal);
      if (!els.howModal.hidden) fecharModal(els.howModal);
      fecharSugestoes();
    }
  });
}

async function iniciarAplicacao() {
  try {
    const resposta = await fetch("data/cenas.json");
    if (!resposta.ok) throw new Error("Não foi possível carregar as cenas.");

    cenas = await resposta.json();
    configurarListeners();
  } catch (erro) {
    console.error(erro);
    els.playButton.disabled = true;
    els.homeCopy.textContent = "Não foi possível carregar as cenas. Verifique o arquivo data/cenas.json.";
  }
}

iniciarAplicacao();
