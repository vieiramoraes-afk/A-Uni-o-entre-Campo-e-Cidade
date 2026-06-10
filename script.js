/**
 * Campo & Cidade — script.js
 * Funcionalidades: nav, tema, parallax, reveal, quiz,
 * galeria/lightbox, contadores, gráficos, barras, formulário
 */

'use strict';

/* ============================================================
   1. UTILITÁRIOS
   ============================================================ */

/** Seleciona um elemento */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/** Seleciona múltiplos elementos */
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/** Mapeia um valor de um intervalo para outro */
const mapRange = (val, inMin, inMax, outMin, outMax) =>
  ((val - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;

/** Clamp */
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));


/* ============================================================
   2. NAVEGAÇÃO — menu fixo + active link + hambúrguer
   ============================================================ */
(function initNav() {
  const header    = $('#navHeader');
  const toggle    = $('#navToggle');
  const menu      = $('#navMenu');
  const navLinks  = $$('.nav-link');
  const sections  = $$('section[id]');

  // Scroll: adicionar sombra ao nav
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 20);

    // Botão voltar ao topo
    const scrollTop = $('#scrollTop');
    const visible   = window.scrollY > 400;
    scrollTop.style.opacity        = visible ? '1' : '0';
    scrollTop.style.pointerEvents  = visible ? 'auto' : 'none';

    // Link ativo no menu
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.id;
      }
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href')?.replace('#', '');
      link.classList.toggle('active', href === current);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hambúrguer
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });

  // Fechar menu ao clicar em link (mobile)
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Fechar ao clicar fora
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target) && menu.classList.contains('open')) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Botão voltar ao topo
  $('#scrollTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   3. MODO CLARO / ESCURO
   ============================================================ */
(function initTheme() {
  const btn  = $('#themeToggle');
  const html = document.documentElement;

  // Preferência salva ou sistema
  const saved = localStorage.getItem('campocidade-theme');
  const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (preferDark ? 'dark' : 'light');
  html.setAttribute('data-theme', theme);

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('campocidade-theme', next);
  });
})();


/* ============================================================
   4. PARALLAX no HERO (JavaScript puro)
   ============================================================ */
(function initParallax() {
  const parallax = $('#heroParallax');
  if (!parallax) return;

  // Respeitar preferência de acessibilidade
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;

  function onScroll() {
    const scrollY = window.scrollY;
    const shift   = scrollY * 0.35;
    parallax.style.transform = `translateY(${shift}px)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ============================================================
   5. REVEAL AO SCROLL (IntersectionObserver)
   ============================================================ */
(function initReveal() {
  // Adiciona classe reveal a elementos de seção
  const targets = $$([
    '.card',
    '.wheel-item',
    '.timeline-item',
    '.future-card',
    '.stat-card',
    '.gallery-item',
    '.contato-info-item',
    '.section-title',
    '.section-desc',
    '.section-eyebrow',
    '.beneficio-item',
  ].join(','));

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    // Adicionar delay escalonado para grupos de filhos
    const parent  = el.parentElement;
    const siblings = Array.from(parent.children).filter(c => c.classList.contains('reveal'));
    const idx      = siblings.indexOf(el);
    if (idx >= 1 && idx <= 4) el.classList.add(`reveal-delay-${idx}`);
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => obs.observe(el));
})();


/* ============================================================
   6. BARRAS DE BENEFÍCIOS (animadas ao entrar na tela)
   ============================================================ */
(function initBars() {
  const bars = $$('.beneficio-bar');
  if (!bars.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar   = entry.target;
        const width = bar.dataset.width;
        bar.style.width = width + '%';
        obs.unobserve(bar);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach(bar => obs.observe(bar));
})();


/* ============================================================
   7. GRÁFICO DE BARRAS (animado)
   ============================================================ */
(function initChart() {
  const chartBars = $$('.chart-bar');
  if (!chartBars.length) return;

  const maxValue = 110; // máximo para escala

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        chartBars.forEach(bar => {
          const val    = parseInt(bar.dataset.value, 10);
          const pct    = (val / maxValue) * 100;
          bar.style.height = pct + '%';
          bar.classList.add('animated');
        });
        obs.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const chart = $('#chartBars');
  if (chart) obs.observe(chart);
})();


/* ============================================================
   8. CONTADORES ANIMADOS
   ============================================================ */
(function initCounters() {
  const statCards = $$('.stat-card');
  if (!statCards.length) return;

  function animateCounter(el, target, suffix) {
    const duration = 1800;
    const start    = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = clamp(elapsed / duration, 0, 1);
      // Easing easeOutExpo
      const ease     = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current  = Math.round(ease * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card   = entry.target;
        const target = parseInt(card.dataset.target, 10);
        const suffix = card.dataset.suffix || '';
        const numEl  = card.querySelector('.stat-number');
        if (numEl) animateCounter(numEl, target, suffix);
        obs.unobserve(card);
      }
    });
  }, { threshold: 0.5 });

  statCards.forEach(card => obs.observe(card));
})();


/* ============================================================
   9. TIMELINE INTERATIVA
   ============================================================ */
(function initTimeline() {
  const items = $$('.timeline-item');
  if (!items.length) return;

  items.forEach(item => {
    // Teclado: Enter/Space ativa hover
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.classList.toggle('focused');
      }
    });
  });
})();


/* ============================================================
   10. QUIZ INTERATIVO
   ============================================================ */
(function initQuiz() {
  const container  = $('#quizContainer');
  const resultBox  = $('#quizResult');
  if (!container)  return;

  // Banco de perguntas
  const questions = [
    {
      q: 'Qual percentual dos alimentos consumidos nas cidades brasileiras é proveniente do campo?',
      opts: ['Cerca de 30%', 'Cerca de 50%', 'Cerca de 70%', 'Cerca de 90%'],
      answer: 2,
      explanation: 'Aproximadamente 70% dos alimentos nas cidades vêm diretamente da produção rural, segundo dados do IBGE.',
    },
    {
      q: 'Qual dessas práticas é considerada sustentável para o campo?',
      opts: ['Desmatamento extensivo', 'Monocultura sem rotação', 'Agrofloresta integrada', 'Queimada para limpeza'],
      answer: 2,
      explanation: 'A agrofloresta integra árvores, culturas e animais, preservando a biodiversidade e melhorando o solo.',
    },
    {
      q: 'O que é agricultura de precisão?',
      opts: [
        'Plantar em linhas bem retas',
        'Uso de tecnologia para aplicar insumos apenas onde necessário',
        'Produção exclusiva de alimentos orgânicos',
        'Cultivo em estufas herméticas',
      ],
      answer: 1,
      explanation: 'Agricultura de precisão usa GPS, drones e sensores para identificar variações no campo e aplicar insumos com exatidão.',
    },
    {
      q: 'Qual é o principal gás de efeito estufa emitido pela agropecuária?',
      opts: ['Dióxido de carbono (CO₂)', 'Metano (CH₄)', 'Ozônio (O₃)', 'Monóxido de carbono (CO)'],
      answer: 1,
      explanation: 'O metano (CH₄) é emitido principalmente pela fermentação entérica do gado bovino e decomposição de resíduos orgânicos.',
    },
    {
      q: 'O que é êxodo rural?',
      opts: [
        'Migração de pessoas da cidade para o campo',
        'Técnica de irrigação eficiente',
        'Migração de pessoas do campo para a cidade',
        'Exportação de produtos agrícolas',
      ],
      answer: 2,
      explanation: 'O êxodo rural é a migração intensa da população do campo para as cidades, geralmente em busca de oportunidades de trabalho.',
    },
    {
      q: 'Qual tecnologia permite identificar doenças em plantações a partir de imagens aéreas?',
      opts: ['Impressoras 3D', 'Drones com sensores multiespectrais', 'Rádio amador', 'Catracas inteligentes'],
      answer: 1,
      explanation: 'Drones equipados com câmeras multiespectrais detectam variações no espectro de luz das plantas, revelando estresse hídrico e doenças antes que se tornem visíveis a olho nu.',
    },
    {
      q: 'O agronegócio representa aproximadamente qual porcentagem do PIB brasileiro?',
      opts: ['5%', '13%', '26%', '42%'],
      answer: 2,
      explanation: 'O agronegócio responde por cerca de 26% do PIB do Brasil, tornando o país um dos maiores produtores e exportadores de alimentos do mundo.',
    },
    {
      q: 'Qual prática representa melhor o princípio de "economia circular" entre campo e cidade?',
      opts: [
        'Importar alimentos de outros países',
        'Transformar resíduos orgânicos urbanos em adubo para o campo',
        'Construir mais supermercados',
        'Aumentar o uso de agrotóxicos',
      ],
      answer: 1,
      explanation: 'A economia circular fecha o ciclo: resíduos orgânicos das cidades se transformam em composto, que volta ao campo como adubo, gerando alimentos para a cidade.',
    },
  ];

  let currentQ    = 0;
  let score       = 0;
  let answered    = false;

  const progressBar = $('#quizProgressBar');
  const counter     = $('#quizCounter');
  const questionEl  = $('#quizQuestion');
  const optionsEl   = $('#quizOptions');
  const feedbackEl  = $('#quizFeedback');
  const nextBtn     = $('#quizNextBtn');
  const resultIcon  = $('#quizResultIcon');
  const resultTitle = $('#quizResultTitle');
  const resultText  = $('#quizResultText');
  const scoreEl     = $('#quizScore');
  const restartBtn  = $('#quizRestartBtn');

  function renderQuestion() {
    const q  = questions[currentQ];
    answered = false;

    // Progress
    const pct = (currentQ / questions.length) * 100;
    progressBar.style.width = pct + '%';
    progressBar.setAttribute('aria-valuenow', Math.round(pct));

    counter.textContent    = `Pergunta ${currentQ + 1} de ${questions.length}`;
    questionEl.textContent = q.q;

    optionsEl.innerHTML = '';
    feedbackEl.textContent = '';
    feedbackEl.className   = 'quiz-feedback';
    nextBtn.style.display  = 'none';

    const letters = ['A', 'B', 'C', 'D'];
    q.opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.innerHTML = `<span class="quiz-option-letter">${letters[i]}</span><span>${opt}</span>`;
      btn.addEventListener('click', () => selectAnswer(i, q));
      optionsEl.appendChild(btn);
    });

    // Focus na primeira opção
    setTimeout(() => {
      const first = optionsEl.querySelector('.quiz-option');
      if (first) first.focus();
    }, 100);
  }

  function selectAnswer(idx, q) {
    if (answered) return;
    answered = true;

    const opts = $$('.quiz-option', optionsEl);
    opts.forEach(o => (o.disabled = true));

    const selected = opts[idx];
    if (idx === q.answer) {
      selected.classList.add('correct');
      feedbackEl.textContent = '✓ Correto! ' + q.explanation;
      feedbackEl.className   = 'quiz-feedback correct';
      score++;
    } else {
      selected.classList.add('wrong');
      opts[q.answer].classList.add('correct');
      feedbackEl.textContent = '✗ Incorreto. ' + q.explanation;
      feedbackEl.className   = 'quiz-feedback wrong';
    }

    nextBtn.style.display = 'inline-flex';
    nextBtn.focus();
  }

  nextBtn.addEventListener('click', () => {
    currentQ++;
    if (currentQ < questions.length) {
      renderQuestion();
    } else {
      showResult();
    }
  });

  function showResult() {
    container.style.display = 'none';
    resultBox.style.display = 'block';

    progressBar.style.width = '100%';

    // Ícone conforme pontuação
    const pct = score / questions.length;
    if (pct >= 0.8) {
      resultIcon.textContent  = '🌱';
      resultTitle.textContent = 'Excelente! Você é um(a) especialista!';
      resultText.textContent  = 'Seus conhecimentos sobre campo, cidade e sustentabilidade são impressionantes. Continue espalhando essa consciência!';
    } else if (pct >= 0.5) {
      resultIcon.textContent  = '🌾';
      resultTitle.textContent = 'Muito bem! Você está no caminho certo!';
      resultText.textContent  = 'Você demonstra um bom entendimento sobre a conexão rural-urbana. Continue aprendendo!';
    } else {
      resultIcon.textContent  = '🌿';
      resultTitle.textContent = 'Continue aprendendo!';
      resultText.textContent  = 'Ainda há muito para descobrir sobre a importância do campo e da cidade. Explore o site e tente novamente!';
    }

    // Animar contador de pontos
    let displayed = 0;
    const target  = score;
    const step    = () => {
      if (displayed < target) {
        displayed++;
        scoreEl.textContent = displayed;
        setTimeout(step, 100);
      } else {
        scoreEl.textContent = `${score}/${questions.length}`;
      }
    };
    scoreEl.textContent = '0';
    setTimeout(step, 300);
  }

  restartBtn.addEventListener('click', () => {
    currentQ = 0;
    score    = 0;
    container.style.display = 'block';
    resultBox.style.display = 'none';
    renderQuestion();
  });

  // Inicializar
  renderQuestion();
})();


/* ============================================================
   11. GALERIA & LIGHTBOX
   ============================================================ */
(function initGallery() {
  const items     = $$('.gallery-item');
  const lightbox  = $('#lightbox');
  const overlay   = $('#lightboxOverlay');
  const closeBtn  = $('#lightboxClose');
  const imgWrap   = $('#lightboxImg');
  const titleEl   = $('#lightboxTitle');
  const descEl    = $('#lightboxDesc');

  if (!lightbox || !items.length) return;

  let lastFocused = null;

  function openLightbox(item) {
    lastFocused = item;
    const imgDiv = item.querySelector('.gallery-img');
    const title  = item.dataset.title || '';
    const desc   = item.dataset.desc  || '';

    // Clonar o SVG da galeria
    imgWrap.innerHTML = '';
    if (imgDiv) {
      const clone = imgDiv.cloneNode(true);
      imgWrap.appendChild(clone);
    }

    titleEl.textContent = title;
    descEl.textContent  = desc;

    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtn.focus(), 50);
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  items.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(item);
      }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.style.display !== 'none') {
      closeLightbox();
    }
  });

  // Trap focus no lightbox
  lightbox.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = lightbox.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });
})();


/* ============================================================
   12. FORMULÁRIO DE CONTATO — Validação
   ============================================================ */
(function initForm() {
  const form    = $('#contatoForm');
  const success = $('#formSuccess');
  if (!form)    return;

  const fields = {
    nome:     { el: $('#nome'),     err: $('#nome-error'),     label: 'nome' },
    email:    { el: $('#email'),    err: $('#email-error'),    label: 'e-mail' },
    assunto:  { el: $('#assunto'),  err: $('#assunto-error'),  label: 'assunto' },
    mensagem: { el: $('#mensagem'), err: $('#mensagem-error'), label: 'mensagem' },
  };

  function validateField(key) {
    const { el, err, label } = fields[key];
    const val = el.value.trim();
    let msg = '';

    if (!val) {
      msg = `O campo ${label} é obrigatório.`;
    } else if (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      msg = 'Informe um e-mail válido.';
    } else if (key === 'mensagem' && val.length < 10) {
      msg = 'A mensagem deve ter pelo menos 10 caracteres.';
    } else if (key === 'nome' && val.length < 2) {
      msg = 'O nome deve ter pelo menos 2 caracteres.';
    }

    err.textContent = msg;
    el.classList.toggle('error', !!msg);
    return !msg;
  }

  // Validação em tempo real (blur)
  Object.keys(fields).forEach(key => {
    fields[key].el.addEventListener('blur', () => validateField(key));
    fields[key].el.addEventListener('input', () => {
      if (fields[key].el.classList.contains('error')) validateField(key);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const valid = Object.keys(fields).map(k => validateField(k)).every(Boolean);
    if (!valid) {
      // Focar no primeiro campo com erro
      const firstErr = Object.values(fields).find(f => f.el.classList.contains('error'));
      if (firstErr) firstErr.el.focus();
      return;
    }

    // Simular envio (sem backend)
    const btn = form.querySelector('.form-submit');
    btn.disabled    = true;
    btn.textContent = 'Enviando…';

    setTimeout(() => {
      form.style.display    = 'none';
      success.style.display = 'flex';
      success.focus();
    }, 1000);
  });
})();


/* ============================================================
   13. ÂNCORAS SUAVES — corrigir offset do nav fixo
   ============================================================ */
(function initSmoothAnchors() {
  const NAV_HEIGHT = 80;

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id  = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });

      // Acessibilidade: focar na seção alvo
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    });
  });
})();


/* ============================================================
   14. LAZY LOADING / PERFORMANCE — imagens e elementos pesados
   ============================================================ */
(function initLazyLoad() {
  // Os SVGs já estão inline; aplicar loading="lazy" em imagens futuras
  // Adicionar will-change apenas quando necessário
  const heroSvg = document.querySelector('.hero-svg');
  if (heroSvg) heroSvg.style.willChange = 'auto';
})();


/* ============================================================
   15. TECLADO — garantir foco visível em elementos interativos
   ============================================================ */
(function initKeyboardNav() {
  // Detectar uso de teclado vs mouse
  let usingKeyboard = false;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      usingKeyboard = true;
      document.body.classList.add('keyboard-nav');
    }
  });

  document.addEventListener('mousedown', () => {
    usingKeyboard = false;
    document.body.classList.remove('keyboard-nav');
  });
})();


/* ============================================================
   16. INICIALIZAÇÃO FINAL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Anunciar carregamento para leitores de tela
  const main = document.getElementById('conteudo-principal');
  if (main) main.setAttribute('aria-label', 'Conteúdo principal carregado');
  
  console.log(
    '%cCampo & Cidade 🌱🏙️',
    'color:#4A8C3F; font-size:1.3rem; font-weight:900;'
  );
  console.log('%cSite educativo sobre sustentabilidade rural-urbana', 'color:#A0522D;');
});
