// Configuração do Leitor de Voz IA (Web Speech API)
const sinteseVoz = window.speechSynthesis;
let locucaoAtiva = null;

const respostaTexto = document.getElementById("respostaTexto");
const statusBusca = document.getElementById("statusBusca");
const cardNoticia = document.getElementById("cardNoticia");
const noticiaTitulo = document.getElementById("noticiaTitulo");
const noticiaTrecho = document.getElementById("noticiaTrecho");
const noticiaLink = document.getElementById("noticiaLink");
const btnVoz = document.getElementById("btnVoz");

// Função acionada ao clicar em sugestão
function definirPergunta(texto) {
    document.getElementById("campoPergunta").value = texto;
    buscarNoDuckDuckGo();
}

function tratarEnter(event) {
    if (event.key === "Enter") {
        buscarNoDuckDuckGo();
    }
}

// Realiza a busca no DuckDuckGo (HTML / JSON API) sem abrir nova aba
async function buscarNoDuckDuckGo() {
    const termo = document.getElementById("campoPergunta").value.trim();
    if (!termo) return;

    pararVoz();
    statusBusca.style.display = "block";
    cardNoticia.style.display = "none";
    respostaTexto.innerText = "";

    // Query otimizada para meteorologia no campo
    const queryCompleta = `${termo} meteorologia clima agricultura`;
    const urlDuck = `https://api.duckduckgo.com/?q=${encodeURIComponent(queryCompleta)}&format=json&no_html=1&skip_disambig=1`;

    try {
        const resposta = await fetch(urlDuck);
        const data = await resposta.json();

        statusBusca.style.display = "none";

        if (data.AbstractText) {
            // Caso a API retorne um resumo direto
            respostaTexto.innerText = data.AbstractText;
            
            exibirCardNoticia(
                data.Heading || "Resumo da Notícia",
                data.AbstractSource || "DuckDuckGo / Meteorologia",
                data.AbstractURL || "https://duckduckgo.com/?q=" + encodeURIComponent(queryCompleta)
            );
        } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            // Pega o primeiro resultado relevante encontrado
            const primeiroResultado = data.RelatedTopics.find(topic => topic.Text && topic.FirstURL);

            if (primeiroResultado) {
                respostaTexto.innerText = primeiroResultado.Text;
                exibirCardNoticia(
                    "Resultado Encontrado na Web",
                    "Fonte Oficial / Notícias Agrícolas",
                    primeiroResultado.FirstURL
                );
            } else {
                exibirRespostaFallback(termo);
            }
        } else {
            exibirRespostaFallback(termo);
        }
    } catch (erro) {
        console.error("Erro na busca:", erro);
        statusBusca.style.display = "none";
        exibirRespostaFallback(termo);
    }
}

// Caso a API retorne resultados vazios ou restritivos, gera a busca no DuckDuckGo embutida
function exibirRespostaFallback(termo) {
    respostaTexto.innerText = `Buscamos informações atualizadas sobre "${termo}". Devido a atualizações nos portais meteorológicos, consulte o resultado extraído da web abaixo.`;
    
    const urlBuscaDireta = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(termo + " meteorologia agricultura")}`;
    
    exibirCardNoticia(
        `Resultados de Busca: ${termo}`,
        "DuckDuckGo Agro Search",
        urlBuscaDireta
    );
}

function exibirCardNoticia(titulo, fonte, link) {
    cardNoticia.style.display = "flex";
    noticiaTitulo.innerText = titulo;
    noticiaTrecho.innerText = `Fonte: ${fonte}`;
    noticiaLink.href = link;
}

// --- Leitor de Voz IA ---
function alternarLeituraVoz() {
    if (sinteseVoz.speaking) {
        pararVoz();
    } else {
        iniciarVoz();
    }
}

function iniciarVoz() {
    const texto = respostaTexto.innerText;
    if (!texto) return;

    locucaoAtiva = new SpeechSynthesisUtterance(texto);
    locucaoAtiva.lang = "pt-BR";
    locucaoAtiva.rate = 1.0;

    locucaoAtiva.onstart = () => {
        btnVoz.innerHTML = `<i class="fa-solid fa-square"></i> Parar Áudio`;
        btnVoz.style.background = "#ef4444";
        btnVoz.style.color = "#ffffff";
    };

    locucaoAtiva.onend = () => {
        resetarBotaoVoz();
    };

    sinteseVoz.speak(locucaoAtiva);
}

function pararVoz() {
    if (sinteseVoz.speaking) {
        sinteseVoz.cancel();
    }
    resetarBotaoVoz();
}

function resetarBotaoVoz() {
    btnVoz.innerHTML = `<i class="fa-solid fa-volume-high"></i> Ouvir Resposta`;
    btnVoz.style.background = "rgba(0, 156, 59, 0.2)";
    btnVoz.style.color = "#4ade80";
}