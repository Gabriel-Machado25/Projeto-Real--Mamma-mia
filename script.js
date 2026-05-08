/**
 * MAMMA MIA PIZZARIA — script.js
 * * O que este arquivo faz:
 * 1. Header: glassmorphism ativo no scroll
 * 2. Animações: elementos entram na tela ao scrollar (Intersection Observer)
 * 3. Counter: números das stats contam de 0 até o valor final
 * 4. Quantity Picker: botões + / − para número de pessoas
 * 5. Formulário multi-etapas: navegação com validação
 * 6. Envio: abre WhatsApp com a mensagem de reserva formatada
 * 7. Modal: feedback visual de sucesso
 */

/* ================================================
   1. QUANDO O DOM ESTIVER PRONTO
================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initScrollAnimations();
  initCounters();
  initQuantityPicker();
  initMultiStepForm();
  initModal();
  setMinDate();
});

/* ================================================
   2. HEADER — GLASSMORPHISM NO SCROLL
================================================ */
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ================================================
   3. ANIMAÇÕES DE SCROLL
================================================ */
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ================================================
   4. CONTADOR ANIMADO (STATS)
================================================ */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'), 10);
  const duration = 1500;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    
    el.textContent = Math.round(eased * target);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target;
    }
  }
  requestAnimationFrame(update);
}

/* ================================================
   5. QUANTITY PICKER
================================================ */
function initQuantityPicker() {
  const minusBtn = document.getElementById('qty-minus');
  const plusBtn  = document.getElementById('qty-plus');
  const display  = document.getElementById('qty-display');
  const input    = document.getElementById('pessoas');

  if (!minusBtn || !plusBtn) return;

  let qty = 2;

  function updateDisplay() {
    display.textContent = qty;
    input.value = qty;
    minusBtn.disabled = qty <= 1;
    minusBtn.style.opacity = qty <= 1 ? '0.3' : '1';
    plusBtn.disabled = qty >= 20;
    plusBtn.style.opacity = qty >= 20 ? '0.3' : '1';
  }

  minusBtn.addEventListener('click', () => {
    if (qty > 1) { qty--; updateDisplay(); }
  });

  plusBtn.addEventListener('click', () => {
    if (qty < 20) { qty++; updateDisplay(); }
  });

  updateDisplay();
}

/* ================================================
   6. FORMULÁRIO MULTI-ETAPAS
================================================ */
function initMultiStepForm() {
  const form = document.getElementById('reservation-form');
  if (!form) return;

  const steps         = form.querySelectorAll('.form-step');
  const btnNext       = document.getElementById('btn-next');
  const btnBack       = document.getElementById('btn-back');
  const btnSubmit     = document.getElementById('btn-submit');
  const progressFill  = document.getElementById('progress-fill');
  const progressLabel = document.getElementById('progress-label');

  let currentStep = 1;
  const totalSteps = steps.length;

  function showStep(stepNumber) {
    steps.forEach(step => {
      const isActive = parseInt(step.dataset.step) === stepNumber;
      step.classList.toggle('form-step--hidden', !isActive);
    });

    const percent = (stepNumber / totalSteps) * 100;
    progressFill.style.width = percent + '%';
    progressLabel.textContent = `Etapa ${stepNumber} de ${totalSteps}`;

    btnBack.style.display   = stepNumber > 1 ? 'flex' : 'none';
    btnNext.style.display   = stepNumber < totalSteps ? 'flex' : 'none';
    btnSubmit.style.display = stepNumber === totalSteps ? 'flex' : 'none';

    if (stepNumber === 3) {
      buildSummary();
    }
  }

  function validateStep(stepNumber) {
    let isValid = true;
    if (stepNumber === 1) {
      isValid = validateField('nome', val => val.trim().length >= 3, 'Por favor, informe seu nome completo.')
        && validatePhone()
        && isValid;
    }
    if (stepNumber === 2) {
      isValid = validateField('data', val => val !== '' && isWednesday(val), 'Selecione uma quarta-feira para a reserva.')
        && validateField('horario', val => val !== '', 'Selecione um horário.')
        && isValid;
    }
    if (stepNumber === 3) {
      isValid = validateCheckbox();
    }
    return isValid;
  }

  function validateField(id, testFn, msg) {
    const input = document.getElementById(id);
    const error = document.getElementById('erro-' + id);
    if (!input) return true;

    const isValid = testFn(input.value);
    input.classList.toggle('has-error', !isValid);
    if (error) error.textContent = isValid ? '' : msg;

    return isValid;
  }

  function validatePhone() {
    const input = document.getElementById('telefone');
    const error = document.getElementById('erro-telefone');
    if (!input) return true;

    const digits = input.value.replace(/\D/g, '');
    const isValid = digits.length >= 10 && digits.length <= 11;

    input.classList.toggle('has-error', !isValid);
    if (error) error.textContent = isValid ? '' : 'Informe um número de WhatsApp válido.';
    return isValid;
  }

  function validateCheckbox() {
    const cb = document.getElementById('aceite');
    const error = document.getElementById('erro-aceite');
    const isValid = cb && cb.checked;
    if (error) error.textContent = isValid ? '' : 'Você precisa confirmar para continuar.';
    return isValid;
  }

  function buildSummary() {
    const container = document.getElementById('reservation-summary');
    if (!container) return;

    const nome    = document.getElementById('nome')?.value || '';
    const tel     = document.getElementById('telefone')?.value || '';
    const data    = document.getElementById('data')?.value || '';
    const horario = document.getElementById('horario')?.value || '';
    const pessoas = document.getElementById('pessoas')?.value || '';

    const dataFormatada = data ? data.split('-').reverse().join('/') : '';

    container.innerHTML = `
      <p class="summary-title">Resumo da reserva</p>
      <div class="summary-row">
        <span class="summary-key">Nome</span>
        <span class="summary-val">${escapeHtml(nome)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-key">WhatsApp</span>
        <span class="summary-val">${escapeHtml(tel)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-key">Data</span>
        <span class="summary-val">${dataFormatada}</span>
      </div>
      <div class="summary-row">
        <span class="summary-key">Horário</span>
        <span class="summary-val">${horario}</span>
      </div>
      <div class="summary-row">
        <span class="summary-key">Pessoas</span>
        <span class="summary-val">${pessoas}</span>
      </div>
    `;
  }

  btnNext.addEventListener('click', () => {
    if (validateStep(currentStep)) {
      currentStep++;
      showStep(currentStep);
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  btnBack.addEventListener('click', () => {
    currentStep--;
    showStep(currentStep);
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // SUBMIT DO FORMULÁRIO CORRIGIDO
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    btnSubmit.classList.add('btn--loading');
    btnSubmit.textContent = 'Enviando...';

    const nome    = document.getElementById('nome')?.value || '';
    const tel     = document.getElementById('telefone')?.value || '';
    const email   = document.getElementById('email')?.value || '';
    const data    = document.getElementById('data')?.value || '';
    const horario = document.getElementById('horario')?.value || '';
    const pessoas = document.getElementById('pessoas')?.value || '';
    const obs     = document.getElementById('obs')?.value || '';

    const dataFormatada = data.split('-').reverse().join('/');

    // Montagem direta e limpa para garantir compatibilidade entre plataformas
    const msgTexto = 
      "🍕 *NOVA RESERVA — Mamma Mia Pizzaria* 🍕\n\n" +
      "👤 *Cliente:* " + nome + "\n" +
      "📱 *WhatsApp:* " + tel + "\n" +
      (email ? "✉️ *E-mail:* " + email + "\n\n" : "\n") +
      "🗓️ *Data:* " + dataFormatada + "\n" +
      "⏰ *Horário:* " + horario + "\n" +
      "👥 *Pessoas:* " + pessoas + " pessoas\n\n" +
      (obs ? "💬 *Obs:* " + obs + "\n\n" : "") +
      "✨ _Gerado automaticamente pelo sistema Mamma Mia._";

    const whatsappNumber = "5588997399472"; 
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msgTexto)}`;

    // Primeiro abre a janela do WhatsApp
    window.open(whatsappURL, '_blank');

    // EXECUTAR FLUXO COMPLETO: Mostra o modal de sucesso na tela e restaura o botão
    setTimeout(() => {
      btnSubmit.classList.remove('btn--loading');
      btnSubmit.textContent = 'Confirmar reserva via WhatsApp 🍕';
      showSuccessModal();
    }, 600);
  });

  const telefoneInput = document.getElementById('telefone');
  if (telefoneInput) {
    telefoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length <= 10) {
        val = val.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else {
        val = val.replace(/(\d{2})(\d{1})(\d{4})(\d{0,4})/, '($1) $2 $3-$4');
      }
      e.target.value = val;
    });
  }

  // Validação em tempo real para data (apenas quartas-feiras)
  const dateInput = document.getElementById('data');
  if (dateInput) {
    dateInput.addEventListener('change', () => {
      const error = document.getElementById('erro-data');
      if (dateInput.value && !isWednesday(dateInput.value)) {
        dateInput.classList.add('has-error');
        if (error) error.textContent = 'Selecione uma quarta-feira para a reserva.';
      } else {
        dateInput.classList.remove('has-error');
        if (error) error.textContent = '';
      }
    });
  }

  showStep(1);
}

/* ================================================
   7. MODAL DE SUCESSO
================================================ */
function initModal() {
  const closeBtn = document.getElementById('modal-close');
  if (!closeBtn) return;

  closeBtn.addEventListener('click', () => {
    closeSuccessModal();
    const form = document.getElementById('reservation-form');
    if (form) form.reset();
    setTimeout(() => initMultiStepForm(), 100);
  });
}

function showSuccessModal() {
  const modal = document.getElementById('success-modal');
  if (!modal) return;
  modal.hidden = false;
  modal.offsetHeight; // force reflow
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
  const modal = document.getElementById('success-modal');
  if (!modal) return;
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
  setTimeout(() => { modal.hidden = true; }, 300);
}

/* ================================================
   8. DEFINE A DATA MÍNIMA DO INPUT (APENAS QUARTAS-FEIRAS)
================================================ */
function setMinDate() {
  const dateInput = document.getElementById('data');
  if (!dateInput) return;

  const today = new Date();
  let nextWednesday = new Date(today);
  const dayOfWeek = today.getDay(); // 0=dom, 1=seg, 2=ter, 3=qua, 4=qui, 5=sex, 6=sab

  if (dayOfWeek === 3) {
    // Hoje é quarta-feira, permitir hoje
    nextWednesday = today;
  } else {
    // Calcular dias até a próxima quarta-feira
    const daysUntilWednesday = (3 - dayOfWeek + 7) % 7;
    nextWednesday.setDate(today.getDate() + daysUntilWednesday);
  }

  const minStr = nextWednesday.toISOString().split('T')[0];
  dateInput.min = minStr;
}

/* ================================================
   UTILITÁRIO — VERIFICA SE É QUARTA-FEIRA
================================================ */
function isWednesday(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr + 'T00:00:00'); // Evita problemas de timezone
  return date.getDay() === 3; // 3 = quarta-feira
}

/* ================================================
   9. UTILITÁRIO — ESCAPE HTML
================================================ */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}