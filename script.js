const cena = {
    id: 1,
    filme: "Harry Potter e a Pedra Filosofal",
    dialogo: "Você é...",
    resposta: "um bruxo, Harry."
};

document.getElementById("dialogo").textContent = cena.dialogo;

const inputResposta = document.getElementById("resposta");

document.getElementById("botao-enviar").addEventListener("click", function() {
    console.log(inputResposta.value);

    document.getElementById("resultado").classList.remove("escondido");
    document.getElementById("resposta-correta").textContent = cena.resposta;
    document.getElementById("filme-revelado").textContent = cena.filme;
});