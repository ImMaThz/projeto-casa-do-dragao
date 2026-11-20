// Seleciona os elementos necessários
const imagens = document.querySelectorAll('.carrossel .imagem');
const informacoes = document.querySelectorAll('.conteudo .informacoes');
const botoes = document.querySelectorAll('.botoes-carrossel .botao');
const controles = document.querySelector('.controles');
const setaAnterior = document.querySelector('.seta-anterior');
const setaProxima = document.querySelector('.seta-proxima');

// Tempo de cada dragão no modo automático (vem da variável --duracao do CSS)
const DURACAO = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue('--duracao'),
  10
) || 7000;

let indiceAtual = 0;
let timer = null;
let pausado = false;
let tempoRestante = DURACAO;
let inicioContagem = 0;

// Reinicia uma animação CSS (remove a classe, força o navegador a "redesenhar" e coloca de volta)
function reiniciarAnimacao(elemento, classe) {
  elemento.classList.remove(classe);
  void elemento.offsetWidth;
  elemento.classList.add(classe);
}

// Troca o dragão exibido
function atualizarPagina(novoIndice, direcao) {
  if (novoIndice === indiceAtual) return;

  // Direção da animação: avançando (1) ou voltando (-1)
  const dir = direcao ?? (novoIndice > indiceAtual ? 1 : -1);
  document.documentElement.style.setProperty('--dir', dir);

  imagens[indiceAtual].classList.remove('ativa');
  informacoes[indiceAtual].classList.remove('ativa');
  botoes[indiceAtual].classList.remove('selecionado');

  indiceAtual = novoIndice;

  reiniciarAnimacao(imagens[indiceAtual], 'ativa');
  informacoes[indiceAtual].classList.add('ativa');
  reiniciarAnimacao(botoes[indiceAtual], 'selecionado');

  // Mantém a miniatura selecionada visível (útil no celular)
  botoes[indiceAtual].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

  reiniciarAutoplay();
}

function proximo() {
  atualizarPagina((indiceAtual + 1) % imagens.length, 1);
}

function anterior() {
  atualizarPagina((indiceAtual - 1 + imagens.length) % imagens.length, -1);
}

// ---------- Modo automático ----------
function agendar(ms) {
  clearTimeout(timer);
  inicioContagem = Date.now();
  tempoRestante = ms;
  timer = setTimeout(proximo, ms);
}

function reiniciarAutoplay() {
  if (pausado) {
    tempoRestante = DURACAO;
    return;
  }
  agendar(DURACAO);
}

function pausar() {
  if (pausado) return;
  pausado = true;
  clearTimeout(timer);
  tempoRestante -= Date.now() - inicioContagem;
  controles.classList.add('pausado');
}

function retomar() {
  if (!pausado) return;
  pausado = false;
  controles.classList.remove('pausado');
  agendar(Math.max(tempoRestante, 300));
}

// ---------- Eventos ----------
botoes.forEach((botao, indice) => {
  botao.addEventListener('click', () => atualizarPagina(indice));
});

setaProxima.addEventListener('click', proximo);
setaAnterior.addEventListener('click', anterior);

// Teclado: setas esquerda/direita
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') proximo();
  else if (e.key === 'ArrowLeft') anterior();
});

// Pausa o automático quando o mouse está sobre os botões
controles.addEventListener('mouseenter', pausar);
controles.addEventListener('mouseleave', retomar);

// Pausa quando a aba fica escondida
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pausar();
  else retomar();
});

// Celular: arrastar o dedo para os lados troca o dragão
let toqueInicioX = null;
document.addEventListener('touchstart', (e) => {
  toqueInicioX = e.touches[0].clientX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  if (toqueInicioX === null) return;
  const distancia = e.changedTouches[0].clientX - toqueInicioX;
  if (Math.abs(distancia) > 50) {
    distancia < 0 ? proximo() : anterior();
  }
  toqueInicioX = null;
});

// Começa o modo automático
agendar(DURACAO);
