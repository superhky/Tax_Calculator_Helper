/**
 * UI 인터랙션 및 애니메이션 관리 모듈
 */
document.addEventListener('DOMContentLoaded', () => {
  // === DOM Elements ===
  const themeToggle = document.getElementById('themeToggle');
  const hometaxBtn = document.getElementById('hometaxBtn');
  const hometaxModal = document.getElementById('hometaxModal');
  const closeModalBtn = document.getElementById('closeModal');
  const calcBtn = document.getElementById('calcBtn');
  const resetBtn = document.getElementById('resetBtn');
  
  // Inputs
  const inputGross = document.getElementById('inputGross');
  const sliderGross = document.getElementById('sliderGross');
  const inputChildren = document.getElementById('inputChildren');
  const inputCredit = document.getElementById('inputCredit');
  const inputDebit = document.getElementById('inputDebit');
  const inputMarket = document.getElementById('inputMarket');
  
  // Sections
  const resultSection = document.getElementById('resultSection');
  
  // Output Elements
  const outTotalDeduction = document.getElementById('outTotalDeduction');
  const outDeterminedTax = document.getElementById('outDeterminedTax');
  const outDifferenceLabel = document.getElementById('outDifferenceLabel');
  const outDifferenceAmount = document.getElementById('outDifferenceAmount');
  const diffCard = document.getElementById('diffCard');
  
  // Progress
  const progBaseLimit = document.getElementById('progBaseLimit');
  const textBaseLimit = document.getElementById('textBaseLimit');
  const progAddLimit = document.getElementById('progAddLimit');
  const textAddLimit = document.getElementById('textAddLimit');
  
  // Recommendations
  const recContainer = document.getElementById('recommendationsList');
  
  // === Theme Management ===
  const savedTheme = Storage.loadTheme();
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    Storage.saveTheme(newTheme);
    themeToggle.innerHTML = newTheme === 'dark' ? '🌙' : '☀️';
  });
  themeToggle.innerHTML = savedTheme === 'dark' ? '🌙' : '☀️';

  // === Modal ===
  if (hometaxBtn) {
    hometaxBtn.addEventListener('click', () => {
      hometaxModal.classList.add('active');
    });
  }
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      hometaxModal.classList.remove('active');
    });
  }
  
  // Close modal on outside click
  window.addEventListener('click', (e) => {
    if (e.target === hometaxModal) {
      hometaxModal.classList.remove('active');
    }
  });

  // === Sync Slider and Input (Gross Salary) ===
  if (inputGross && sliderGross) {
    sliderGross.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      inputGross.value = val === 0 ? '' : (val * 100).toLocaleString('ko-KR'); // slider in 100만원 units
    });
    
    inputGross.addEventListener('input', (e) => {
      let val = e.target.value.replace(/,/g, '').replace(/\D/g, '');
      if (val === '') {
        inputGross.value = '';
        sliderGross.value = 0;
        return;
      }
      const numVal = parseInt(val, 10);
      inputGross.value = numVal.toLocaleString('ko-KR');
      const sliderVal = Math.floor(numVal / 100);
      sliderGross.value = sliderVal > 3000 ? 3000 : sliderVal; // max 3억 in slider
    });
  }

  // === Generic Number Input Formatting ===
  const formatInput = (e) => {
    let val = e.target.value.replace(/,/g, '').replace(/\D/g, '');
    if (val === '') {
      e.target.value = '';
      return;
    }
    e.target.value = parseInt(val, 10).toLocaleString('ko-KR');
  };

  [inputCredit, inputDebit, inputMarket].forEach(input => {
    if (input) input.addEventListener('input', formatInput);
  });

  // === Load Saved Inputs ===
  const savedData = Storage.loadInputs();
  if (savedData) {
    if (inputGross) inputGross.value = savedData.grossSalary ? (savedData.grossSalary / 10000).toLocaleString('ko-KR') : '';
    if (sliderGross) sliderGross.value = savedData.grossSalary ? Math.floor((savedData.grossSalary / 10000) / 100) : 0;
    if (inputChildren) inputChildren.value = savedData.children || '0';
    if (inputCredit) inputCredit.value = savedData.creditCard ? (savedData.creditCard / 10000).toLocaleString('ko-KR') : '';
    if (inputDebit) inputDebit.value = savedData.debitCash ? (savedData.debitCash / 10000).toLocaleString('ko-KR') : '';
    if (inputMarket) inputMarket.value = savedData.marketTransport ? (savedData.marketTransport / 10000).toLocaleString('ko-KR') : '';
  }

  // === Particle Animation (Gold Dust) ===
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const particleCount = 50;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedY = Math.random() * 0.5 - 0.25;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.opacity = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.speedX;
      this.y -= this.speedY; // float up slightly
      if (this.y < 0) this.y = canvas.height;
      if (this.x > canvas.width) this.x = 0;
      if (this.x < 0) this.x = canvas.width;
    }
    draw() {
      ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    requestAnimationFrame(animateParticles);
  }

  initParticles();
  animateParticles();

  // === Coin Rain Animation (On Refund) ===
  function createCoinRain() {
    const coinCount = 30;
    for (let i = 0; i < coinCount; i++) {
      const coin = document.createElement('div');
      coin.classList.add('coin');
      coin.innerHTML = '🪙';
      coin.style.left = `${Math.random() * 100}vw`;
      coin.style.animationDuration = `${Math.random() * 2 + 2}s`; // 2~4s
      coin.style.animationDelay = `${Math.random() * 1}s`;
      coin.style.fontSize = `${Math.random() * 1.5 + 1}rem`;
      document.body.appendChild(coin);
      
      // Remove after animation
      setTimeout(() => {
        coin.remove();
      }, 5000);
    }
  }

  // === Calculate and Render Results ===
  const getVal = (input) => {
    if (!input || !input.value) return 0;
    const str = input.value.replace(/,/g, '');
    return parseInt(str, 10) * 10000; // Man won to Won
  };

  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      const grossSalary = getVal(inputGross);
      if (grossSalary === 0) {
        alert('연봉을 입력해주세요.');
        inputGross.focus();
        return;
      }

      const inputs = {
        grossSalary,
        children: parseInt(inputChildren.value, 10) || 0,
        creditCard: getVal(inputCredit),
        debitCash: getVal(inputDebit),
        marketTransport: getVal(inputMarket)
      };

      // Save to localStorage
      Storage.saveInputs(inputs);

      // Calc
      const result = TaxCalculator.calcFinalResult(inputs);
      const recs = TaxCalculator.generateRecommendations(result, inputs);

      // Render Summary
      outTotalDeduction.textContent = (result.cardDeduction.totalDeduction / 10000).toLocaleString('ko-KR');
      outDeterminedTax.textContent = (result.totalDeterminedTax / 10000).toLocaleString('ko-KR');
      
      if (result.isRefund) {
        outDifferenceLabel.textContent = '예상 환급액';
        outDifferenceAmount.textContent = (result.refundAmount / 10000).toLocaleString('ko-KR');
        diffCard.className = 'summary-card refund animate-slide-up';
        if (result.refundAmount > 0) createCoinRain();
      } else {
        outDifferenceLabel.textContent = '예상 추가납부액';
        outDifferenceAmount.textContent = (result.additionalPayment / 10000).toLocaleString('ko-KR');
        diffCard.className = 'summary-card additional animate-slide-up';
      }

      // Render Progress Bars
      const cd = result.cardDeduction;
      if (cd.thresholdMet) {
        const basePct = cd.adjustedBaseLimit > 0 ? (cd.actualBaseDeduction / cd.adjustedBaseLimit) * 100 : 0;
        progBaseLimit.style.width = `${Math.min(100, basePct)}%`;
        textBaseLimit.textContent = `${TaxCalculator.fmtMan(cd.actualBaseDeduction)} / ${TaxCalculator.fmtMan(cd.adjustedBaseLimit)}`;
        
        if (basePct >= 100) progBaseLimit.classList.add('success');
        else progBaseLimit.classList.remove('success');

        const addPct = cd.additionalLimit > 0 ? (cd.actualAdditionalDeduction / cd.additionalLimit) * 100 : 0;
        progAddLimit.style.width = `${Math.min(100, addPct)}%`;
        textAddLimit.textContent = `${TaxCalculator.fmtMan(cd.actualAdditionalDeduction)} / ${TaxCalculator.fmtMan(cd.additionalLimit)}`;
        
        if (addPct >= 100) progAddLimit.classList.add('success');
        else progAddLimit.classList.remove('success');
      } else {
        progBaseLimit.style.width = '0%';
        textBaseLimit.textContent = `0원 / 0원 (최소사용 미달)`;
        progAddLimit.style.width = '0%';
        textAddLimit.textContent = `0원 / 0원`;
      }

      // Render Recommendations
      recContainer.innerHTML = '';
      recs.forEach(rec => {
        const li = document.createElement('li');
        li.className = `recommendation-item ${rec.type}`;
        li.innerHTML = `
          <div class="rec-icon">${rec.icon}</div>
          <div class="rec-text">${rec.text}</div>
        `;
        recContainer.appendChild(li);
      });

      // Show Section
      resultSection.classList.remove('hidden');
      
      // Scroll to result (smooth)
      setTimeout(() => {
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    });
  }

  // === Reset ===
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('입력된 모든 내용을 초기화하시겠습니까?')) {
        Storage.clearInputs();
        if (inputGross) inputGross.value = '';
        if (sliderGross) sliderGross.value = 0;
        if (inputChildren) inputChildren.value = '0';
        if (inputCredit) inputCredit.value = '';
        if (inputDebit) inputDebit.value = '';
        if (inputMarket) inputMarket.value = '';
        
        resultSection.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('navMenu');
  
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      menuToggle.innerHTML = nav.classList.contains('open') ? '✕' : '☰';
    });
  }
});
