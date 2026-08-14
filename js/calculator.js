/**
 * 2026년 귀속 연말정산 세금 계산 모듈
 * 순수 함수로 구성 — DOM 의존성 없음
 */
const TaxCalculator = (() => {

  /* =========================================
     소득세율표 (2026년 — 기존 유지)
     ========================================= */
  const TAX_BRACKETS = [
    { limit: 14000000,   rate: 0.06, deduction: 0 },
    { limit: 50000000,   rate: 0.15, deduction: 1260000 },
    { limit: 88000000,   rate: 0.24, deduction: 5760000 },
    { limit: 150000000,  rate: 0.35, deduction: 15440000 },
    { limit: 300000000,  rate: 0.38, deduction: 19940000 },
    { limit: 500000000,  rate: 0.40, deduction: 25940000 },
    { limit: 1000000000, rate: 0.42, deduction: 35940000 },
    { limit: Infinity,   rate: 0.45, deduction: 65940000 },
  ];

  /* =========================================
     1. 근로소득공제
     ========================================= */
  function calcEarnedIncomeDeduction(gross) {
    if (gross <= 5000000) return gross * 0.70;
    if (gross <= 15000000) return 3500000 + (gross - 5000000) * 0.40;
    if (gross <= 45000000) return 7500000 + (gross - 15000000) * 0.15;
    if (gross <= 100000000) return 12000000 + (gross - 45000000) * 0.05;
    return Math.min(14750000 + (gross - 100000000) * 0.02, 20000000);
  }

  /* =========================================
     2. 4대보험 (근로자 부담분)
     ========================================= */
  function calcSocialInsurance(gross) {
    // 국민연금: 4.5%, 기준소득월액 상한 약 617만원 (2026 추정)
    const pensionMonthCap = 6170000;
    const monthlyGross = gross / 12;
    const pensionBase = Math.min(monthlyGross, pensionMonthCap);
    const nationalPension = Math.floor(pensionBase * 0.045) * 12;

    // 건강보험: 3.545%
    const healthInsurance = Math.floor(gross * 0.03545);
    // 장기요양보험: 건강보험료의 12.81%
    const longTermCare = Math.floor(healthInsurance * 0.1281);
    // 고용보험: 0.9%
    const employmentInsurance = Math.floor(gross * 0.009);

    return {
      nationalPension,
      healthInsurance,
      longTermCare,
      employmentInsurance,
      total: nationalPension + healthInsurance + longTermCare + employmentInsurance,
    };
  }

  /* =========================================
     3. 신용카드 등 소득공제 (⚡ 2026 개정 반영)
     ========================================= */
  function calcCardDeduction(gross, creditCard, debitCash, marketTransport, children) {
    const threshold = gross * 0.25;
    const totalSpending = creditCard + debitCash + marketTransport;

    const result = {
      threshold,
      totalSpending,
      thresholdMet: totalSpending > threshold,
      shortfall: Math.max(0, threshold - totalSpending),
      creditCardDeduction: 0,
      debitCashDeduction: 0,
      marketTransportDeduction: 0,
      baseLimit: 0,
      childBonus: 0,
      adjustedBaseLimit: 0,
      additionalLimit: 2000000, // 전통시장 100만 + 대중교통 100만
      actualBaseDeduction: 0,
      actualAdditionalDeduction: 0,
      totalDeduction: 0,
      remainingBaseLimit: 0,
      remainingAdditionalLimit: 0,
    };

    if (!result.thresholdMet) return result;

    // 기본 한도 (2026: 자녀 수 반영)
    const childCount = Math.min(children || 0, 2);
    if (gross <= 70000000) {
      result.baseLimit = 3000000;
      result.childBonus = childCount * 500000;
    } else if (gross <= 120000000) {
      result.baseLimit = 2500000;
      result.childBonus = childCount * 250000;
    } else {
      result.baseLimit = 2000000;
      result.childBonus = childCount * 250000;
    }
    result.adjustedBaseLimit = result.baseLimit + result.childBonus;

    // 최소사용금액 소진 — 공제율 낮은 순서로 차감
    let remaining = threshold;

    const creditUsed = Math.min(remaining, creditCard);
    remaining -= creditUsed;
    const debitUsed = Math.min(remaining, debitCash);
    remaining -= debitUsed;
    const marketUsed = Math.min(remaining, marketTransport);

    // 초과분 공제액 계산
    result.creditCardDeduction = Math.floor((creditCard - creditUsed) * 0.15);
    result.debitCashDeduction = Math.floor((debitCash - debitUsed) * 0.30);
    result.marketTransportDeduction = Math.floor((marketTransport - marketUsed) * 0.40);

    // 추가 공제 (전통시장/대중교통) — 기본 한도와 별도
    result.actualAdditionalDeduction = Math.min(
      result.marketTransportDeduction,
      result.additionalLimit,
    );
    const marketRemainder = result.marketTransportDeduction - result.actualAdditionalDeduction;

    // 기본 공제
    const baseSources = result.creditCardDeduction + result.debitCashDeduction + marketRemainder;
    result.actualBaseDeduction = Math.min(baseSources, result.adjustedBaseLimit);

    // 최종
    result.totalDeduction = result.actualBaseDeduction + result.actualAdditionalDeduction;
    result.remainingBaseLimit = Math.max(0, result.adjustedBaseLimit - result.actualBaseDeduction);
    result.remainingAdditionalLimit = Math.max(0, result.additionalLimit - result.actualAdditionalDeduction);

    return result;
  }

  /* =========================================
     4. 산출세액 (종합소득세율)
     ========================================= */
  function calcTaxAmount(taxableIncome) {
    if (taxableIncome <= 0) return 0;
    for (const b of TAX_BRACKETS) {
      if (taxableIncome <= b.limit) {
        return Math.max(0, Math.floor(taxableIncome * b.rate - b.deduction));
      }
    }
    const last = TAX_BRACKETS[TAX_BRACKETS.length - 1];
    return Math.floor(taxableIncome * last.rate - last.deduction);
  }

  /* =========================================
     5. 근로소득 세액공제
     ========================================= */
  function calcEarnedIncomeTaxCredit(calcTax, gross) {
    // 공제액
    let credit;
    if (calcTax <= 1300000) {
      credit = calcTax * 0.55;
    } else {
      credit = 715000 + (calcTax - 1300000) * 0.30;
    }

    // 한도
    let limit;
    if (gross <= 33000000) {
      limit = 740000;
    } else if (gross <= 70000000) {
      limit = Math.max(740000 - (gross - 33000000) * 0.008, 660000);
    } else if (gross <= 120000000) {
      limit = Math.max(660000 - (gross - 70000000) * 0.005, 500000);
    } else {
      limit = Math.max(500000 - (gross - 120000000) * 0.005, 200000);
    }

    return Math.floor(Math.min(credit, limit));
  }

  /* =========================================
     6. 기납부세액 추정 (카드공제 없는 표준 세액)
     ========================================= */
  function estimateWithholdingTax(gross) {
    const eid = calcEarnedIncomeDeduction(gross);
    const earnedIncome = gross - eid;
    const personalDeduction = 1500000;
    const ins = calcSocialInsurance(gross);
    const taxable = Math.max(0, earnedIncome - personalDeduction - ins.total);
    const calcTax = calcTaxAmount(taxable);
    const taxCredit = calcEarnedIncomeTaxCredit(calcTax, gross);
    const finalTax = Math.max(0, calcTax - taxCredit);
    const localTax = Math.floor(finalTax * 0.1);
    return { incomeTax: finalTax, localTax, total: finalTax + localTax };
  }

  /* =========================================
     7. 전체 연말정산 계산
     ========================================= */
  function calcFinalResult(inputs) {
    const { grossSalary, creditCard, debitCash, marketTransport, children } = inputs;

    // 1) 근로소득공제
    const earnedIncomeDeduction = calcEarnedIncomeDeduction(grossSalary);
    const earnedIncome = grossSalary - earnedIncomeDeduction;

    // 2) 소득공제 합산
    const personalDeduction = 1500000;
    const insurance = calcSocialInsurance(grossSalary);
    const cardDeduction = calcCardDeduction(grossSalary, creditCard, debitCash, marketTransport, children);
    const totalIncomeDeduction = personalDeduction + insurance.total + cardDeduction.totalDeduction;

    // 3) 과세표준
    const taxableIncome = Math.max(0, earnedIncome - totalIncomeDeduction);

    // 4) 산출세액
    const calculatedTax = calcTaxAmount(taxableIncome);

    // 5) 세액공제
    const earnedIncomeTaxCredit = calcEarnedIncomeTaxCredit(calculatedTax, grossSalary);

    // 6) 결정세액
    const determinedTax = Math.max(0, calculatedTax - earnedIncomeTaxCredit);
    const localTax = Math.floor(determinedTax * 0.1);
    const totalDeterminedTax = determinedTax + localTax;

    // 7) 기납부세액
    const withholding = estimateWithholdingTax(grossSalary);

    // 8) 환급 / 추가납부
    const difference = withholding.total - totalDeterminedTax;

    return {
      grossSalary, children,
      earnedIncomeDeduction, earnedIncome,
      personalDeduction, insurance, cardDeduction,
      totalIncomeDeduction, taxableIncome,
      calculatedTax, earnedIncomeTaxCredit,
      determinedTax, localTax, totalDeterminedTax,
      withholding, difference,
      isRefund: difference >= 0,
      refundAmount: Math.max(0, difference),
      additionalPayment: Math.max(0, -difference),
    };
  }

  /* =========================================
     8. 맞춤 절세 추천사항
     ========================================= */
  function generateRecommendations(result, inputs) {
    const recs = [];
    const cd = result.cardDeduction;
    const { creditCard, debitCash, marketTransport, children } = inputs;
    const totalSpending = creditCard + debitCash + marketTransport;

    // (1) 최소 사용 기준 미달
    if (!cd.thresholdMet) {
      recs.push({
        type: 'warning', icon: '⚠️',
        text: `총 카드 사용액이 최소 기준(총급여의 25%, <strong>${fmtMan(cd.threshold)}</strong>)에 미달합니다. <strong>${fmtMan(cd.shortfall)}</strong> 더 사용해야 소득공제가 시작됩니다.`,
      });
      // 최소 기준 미달 시 다른 추천은 불필요
      if (children === 0) {
        recs.push({
          type: 'info', icon: '👶',
          text: '부양 자녀가 있으시다면 자녀 수를 입력해보세요! 2026년부터 자녀 1인당 공제 한도가 최대 50만 원 확대됩니다.',
        });
      }
      return recs;
    }

    // (2) 신용카드 비중 높음 → 체크카드 전환 추천
    if (creditCard > 0 && totalSpending > 0) {
      const creditRatio = creditCard / totalSpending;
      if (creditRatio > 0.5 && cd.remainingBaseLimit > 0) {
        recs.push({
          type: 'info', icon: '💳',
          text: '신용카드 사용 비중이 높습니다. 체크카드/현금영수증의 공제율(30%)이 신용카드(15%)의 <strong>2배</strong>입니다. 남은 기간 체크카드를 주로 사용하시면 추가 공제 효과를 얻을 수 있습니다.',
        });
      }
    }

    // (3) 기본 한도
    if (cd.remainingBaseLimit > 0) {
      const needed = Math.ceil(cd.remainingBaseLimit / 0.30);
      recs.push({
        type: 'info', icon: '📊',
        text: `기본 공제 한도(<strong>${fmtMan(cd.adjustedBaseLimit)}</strong>)까지 <strong>${fmtMan(cd.remainingBaseLimit)}</strong> 남았습니다. 체크카드로 약 <strong>${fmtMan(needed)}</strong> 더 사용하면 한도를 채울 수 있습니다.`,
      });
    } else {
      recs.push({
        type: 'success', icon: '✅',
        text: '기본 공제 한도를 모두 채웠습니다!',
      });
    }

    // (4) 전통시장/대중교통
    if (marketTransport === 0) {
      recs.push({
        type: 'info', icon: '🏪',
        text: '전통시장·대중교통 사용분은 <strong>40%</strong> 공제율에 최대 <strong>200만 원</strong> 추가 한도가 별도 적용됩니다. 적극 활용을 추천합니다!',
      });
    } else if (cd.remainingAdditionalLimit > 0) {
      const needed = Math.ceil(cd.remainingAdditionalLimit / 0.40);
      recs.push({
        type: 'info', icon: '🚌',
        text: `전통시장/대중교통 추가 한도까지 <strong>${fmtMan(cd.remainingAdditionalLimit)}</strong> 남았습니다. 약 <strong>${fmtMan(needed)}</strong> 더 사용하면 채울 수 있습니다.`,
      });
    } else {
      recs.push({
        type: 'success', icon: '🎯',
        text: '전통시장/대중교통 추가 공제 한도도 모두 채웠습니다!',
      });
    }

    // (5) 자녀 미입력
    if (children === 0) {
      recs.push({
        type: 'info', icon: '👶',
        text: '부양 자녀가 있으시다면 자녀 수를 입력해보세요! 2026년부터 자녀 1인당 공제 한도가 최대 <strong>50만 원</strong> 확대됩니다.',
      });
    }

    // (6) 환급 / 추가납부
    if (result.isRefund && result.refundAmount > 0) {
      recs.push({
        type: 'success', icon: '🎊',
        text: `카드 소득공제 적용으로 약 <strong>${fmtMan(result.refundAmount)}</strong> 환급이 예상됩니다!`,
      });
    } else if (!result.isRefund && result.additionalPayment > 0) {
      recs.push({
        type: 'danger', icon: '💸',
        text: `약 <strong>${fmtMan(result.additionalPayment)}</strong> 추가 납부가 예상됩니다. 남은 기간 절세 전략을 적극 활용해보세요.`,
      });
    } else {
      recs.push({
        type: 'success', icon: '⚖️',
        text: '카드 소득공제 적용 전후 세액이 동일합니다. 추가 납부나 환급이 없을 것으로 예상됩니다.',
      });
    }

    // (7) 모든 한도 달성 → 추가 팁
    if (cd.remainingBaseLimit <= 0 && cd.remainingAdditionalLimit <= 0) {
      recs.push({
        type: 'info', icon: '💡',
        text: '모든 카드 공제 한도를 달성했습니다! 추가 절세를 위해 <strong>연금저축(최대 600만 원)</strong>이나 <strong>IRP(합산 최대 900만 원)</strong> 가입을 고려해보세요.',
      });
    }

    return recs;
  }

  /* =========================================
     유틸: 금액 포맷팅
     ========================================= */
  function fmtWon(amount) {
    return Math.floor(amount).toLocaleString('ko-KR') + '원';
  }

  function fmtMan(amount) {
    const man = Math.floor(amount / 10000);
    if (man > 0) return man.toLocaleString('ko-KR') + '만 원';
    return Math.floor(amount).toLocaleString('ko-KR') + '원';
  }

  /* ---- Public API ---- */
  return {
    calcEarnedIncomeDeduction,
    calcSocialInsurance,
    calcCardDeduction,
    calcTaxAmount,
    calcEarnedIncomeTaxCredit,
    estimateWithholdingTax,
    calcFinalResult,
    generateRecommendations,
    fmtWon,
    fmtMan,
  };
})();
