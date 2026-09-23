/**
 * 予約カレンダー＆フォーム機能
 */

(function() {
  // --- 状態管理 ---
  const state = {
    currentDate: new Date(),
    selectedDate: null,
    selectedTime: null,
    selectedStaff: null,
    selectedMenus: [],
    totalPrice: 0,
    totalTime: 0,
    currentStep: 1,
    userInfo: {
      name: '',
      phone: '',
      email: '',
      note: ''
    }
  };

  const staffNames = {
    any: 'おまかせ',
    sato: '佐藤 蓮（Director）',
    tanaka: '田中 美咲（Top Stylist）',
    yamamoto: '山本 翔太（Stylist）',
    suzuki: '鈴木 あかり（Stylist）',
    nakamura: '中村 結衣（Jr. Stylist）'
  };

  // --- 初期化 ---
  function init() {
    initCalendar();
    initSteps();
    initStaffSelection();
    initMenuSelection();
    initFormInputs();
  }

  // --- カレンダー処理 ---
  function initCalendar() {
    const prevBtn = document.getElementById('calPrev');
    const nextBtn = document.getElementById('calNext');
    
    if(prevBtn) {
      prevBtn.addEventListener('click', () => {
        state.currentDate.setMonth(state.currentDate.getMonth() - 1);
        renderCalendar();
      });
    }
    
    if(nextBtn) {
      nextBtn.addEventListener('click', () => {
        state.currentDate.setMonth(state.currentDate.getMonth() + 1);
        renderCalendar();
      });
    }

    renderCalendar();
  }

  function renderCalendar() {
    const calTitle = document.getElementById('calTitle');
    const calGrid = document.getElementById('calGrid');
    
    if(!calTitle || !calGrid) return;

    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    
    calTitle.textContent = `${year}年${month + 1}月`;
    calGrid.innerHTML = '';

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay(); // 0(Sun) to 6(Sat)
    const totalDays = lastDay.getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 空白を埋める
    for (let i = 0; i < startingDay; i++) {
      const emptyDiv = document.createElement('div');
      emptyDiv.classList.add('empty');
      calGrid.appendChild(emptyDiv);
    }

    // 日付を生成
    for (let i = 1; i <= totalDays; i++) {
      const dateObj = new Date(year, month, i);
      const dayOfWeek = dateObj.getDay();
      
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.classList.add('booking__cal-date');
      
      const numSpan = document.createElement('span');
      numSpan.classList.add('date-num');
      numSpan.textContent = i;
      btn.appendChild(numSpan);

      // 過去判定
      if (dateObj < today) {
        btn.classList.add('disabled');
        btn.disabled = true;
      } 
      // 火曜日は定休日
      else if (dayOfWeek === 2) {
        btn.classList.add('closed');
        btn.disabled = true;
        const statusSpan = document.createElement('span');
        statusSpan.classList.add('date-status');
        statusSpan.textContent = '-';
        btn.appendChild(statusSpan);
      }
      else {
        // 空き状況モック表示
        const statusSpan = document.createElement('span');
        statusSpan.classList.add('date-status');
        const rand = Math.random();
        if (rand < 0.6) {
          statusSpan.textContent = '◎';
          btn.classList.add('available');
        } else if (rand < 0.85) {
          statusSpan.textContent = '△';
          btn.classList.add('few');
        } else {
          statusSpan.textContent = '×';
          btn.classList.add('full');
          btn.disabled = true;
        }
        btn.appendChild(statusSpan);

        // クリックイベント
        if (!btn.disabled) {
          btn.addEventListener('click', () => {
            document.querySelectorAll('.booking__cal-date').forEach(el => el.classList.remove('selected'));
            btn.classList.add('selected');
            state.selectedDate = dateObj;
            state.selectedTime = null; // リセット
            renderTimeSlots(dateObj);
            validateStep();
          });
        }
      }

      // 今日の日付
      if (dateObj.getTime() === today.getTime()) {
        btn.classList.add('today');
      }

      // 選択中の日付
      if (state.selectedDate && dateObj.getTime() === state.selectedDate.getTime()) {
        btn.classList.add('selected');
      }

      calGrid.appendChild(btn);
    }
  }

  // --- タイムスロット処理 ---
  function renderTimeSlots(dateObj) {
    const timeGrid = document.getElementById('timeGrid');
    if (!timeGrid) return;
    
    timeGrid.innerHTML = '';
    const dayOfWeek = dateObj.getDay();
    
    let startHour = 11;
    let endHour = 21;
    
    // 土日祝 (簡易判定: 0=日, 6=土)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      startHour = 10;
      endHour = 20;
    }
    
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += 30) {
        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.classList.add('booking__time-slot');
        btn.textContent = timeStr;
        
        // 空き状況モック
        const rand = Math.random();
        if (rand < 0.2) {
          btn.classList.add('full');
          btn.disabled = true;
        } else if (rand < 0.5) {
          btn.classList.add('few');
        } else {
          btn.classList.add('available');
        }
        
        if (state.selectedTime === timeStr) {
          btn.classList.add('selected');
        }
        
        if (!btn.disabled) {
          btn.addEventListener('click', () => {
            document.querySelectorAll('.booking__time-slot').forEach(el => el.classList.remove('selected'));
            btn.classList.add('selected');
            state.selectedTime = timeStr;
            validateStep();
          });
        }
        
        timeGrid.appendChild(btn);
      }
    }
  }

  // --- ステップナビゲーション処理 ---
  function initSteps() {
    const nextBtn = document.getElementById('bookingNext');
    const prevBtn = document.getElementById('bookingPrev');
    const submitBtn = document.getElementById('bookingSubmit');
    
    if(nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (validateStep()) {
          goToStep(state.currentStep + 1);
        }
      });
    }
    
    if(prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToStep(state.currentStep - 1);
      });
    }
    
    if(submitBtn) {
      submitBtn.addEventListener('click', submitBooking);
    }
    
    updateStepView();
  }

  // ステップ切り替え時のスクロール処理
  function scrollToStepper() {
    const stepper = document.querySelector('.booking__stepper');
    if (!stepper) return;

    const header = document.getElementById('header') || document.querySelector('.header');
    const headerHeight = header ? header.getBoundingClientRect().height : 70;
    const extraPadding = 16;
    const offset = headerHeight + extraPadding;

    const lenis = window.bloomLenis || window.lenis;
    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(stepper, { offset: -offset });
    } else {
      const targetPosition = stepper.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: 'smooth'
      });
    }
  }

  function goToStep(step) {
    if (step < 1 || step > 4) return;
    
    if (step === 4) {
      updateConfirmView();
    }
    
    state.currentStep = step;
    updateStepView();
    setTimeout(scrollToStepper, 20);
  }

  function updateStepView() {
    // ステップインジケーター更新
    document.querySelectorAll('.booking__step').forEach((el, index) => {
      const stepNum = index + 1;
      el.classList.remove('active', 'completed');
      if (stepNum === state.currentStep) {
        el.classList.add('active');
      } else if (stepNum < state.currentStep) {
        el.classList.add('completed');
      }
    });
    
    // パネル更新
    document.querySelectorAll('.booking__panel').forEach((el, index) => {
      const stepNum = index + 1;
      if (stepNum === state.currentStep) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
    
    // ボタン表示制御
    const nextBtn = document.getElementById('bookingNext');
    const prevBtn = document.getElementById('bookingPrev');
    const submitBtn = document.getElementById('bookingSubmit');
    
    if (state.currentStep === 1) {
      if(prevBtn) prevBtn.style.display = 'none';
      if(nextBtn) nextBtn.style.display = 'inline-block';
      if(submitBtn) submitBtn.style.display = 'none';
    } else if (state.currentStep === 4) {
      if(prevBtn) prevBtn.style.display = 'inline-block';
      if(nextBtn) nextBtn.style.display = 'none';
      if(submitBtn) submitBtn.style.display = 'inline-block';
    } else {
      if(prevBtn) prevBtn.style.display = 'inline-block';
      if(nextBtn) nextBtn.style.display = 'inline-block';
      if(submitBtn) submitBtn.style.display = 'none';
    }
    
    validateStep();
  }

  function validateStep() {
    const nextBtn = document.getElementById('bookingNext');
    let isValid = false;
    
    if (state.currentStep === 1) {
      isValid = state.selectedDate !== null && state.selectedTime !== null;
    } else if (state.currentStep === 2) {
      isValid = state.selectedStaff !== null && state.selectedMenus.length > 0;
    } else if (state.currentStep === 3) {
      isValid = state.userInfo.name.trim() !== '' && state.userInfo.phone.trim() !== '';
    } else if (state.currentStep === 4) {
      isValid = true;
    }
    
    if (nextBtn) {
      nextBtn.disabled = !isValid;
    }
    return isValid;
  }

  // --- スタッフ選択処理 ---
  function initStaffSelection() {
    const options = document.querySelectorAll('.booking__staff-option');
    options.forEach(option => {
      option.addEventListener('click', () => {
        options.forEach(el => el.classList.remove('selected'));
        option.classList.add('selected');
        state.selectedStaff = option.dataset.staff;
        validateStep();
      });
    });
  }

  // --- メニュー選択処理 ---
  function initMenuSelection() {
    const checkboxes = document.querySelectorAll('input[name="menu"]');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        calcMenuTotals();
        validateStep();
      });
    });
  }

  function calcMenuTotals() {
    const checkboxes = document.querySelectorAll('input[name="menu"]:checked');
    let price = 0;
    let time = 0;
    let menus = [];
    
    checkboxes.forEach(cb => {
      price += parseInt(cb.dataset.price || 0, 10);
      time += parseInt(cb.dataset.time || 0, 10);
      
      const label = cb.closest('label');
      if (label) {
        const titleEl = label.querySelector('.booking__menu-name');
        if (titleEl) {
          menus.push(titleEl.textContent.trim());
        } else {
          menus.push(cb.value);
        }
      }
    });
    
    state.totalPrice = price;
    state.totalTime = time;
    state.selectedMenus = menus;
    
    const priceEl = document.getElementById('bookingTotal');
    const timeEl = document.getElementById('bookingTime');
    
    if (priceEl) priceEl.textContent = `¥${price.toLocaleString()}`;
    if (timeEl) timeEl.textContent = `${time}分`;
  }

    // --- フォーム入力処理 ---
    function initFormInputs() {
      const nameInput = document.getElementById('customerName');
      const phoneInput = document.getElementById('customerPhone');
      const emailInput = document.getElementById('customerEmail');
      const noteInput = document.getElementById('customerNote');
      
      const updateInfo = () => {
        if(nameInput) state.userInfo.name = nameInput.value;
        if(phoneInput) state.userInfo.phone = phoneInput.value;
        if(emailInput) state.userInfo.email = emailInput.value;
        if(noteInput) state.userInfo.note = noteInput.value;
        validateStep();
      };
      
      if(nameInput) nameInput.addEventListener('input', updateInfo);
      if(phoneInput) phoneInput.addEventListener('input', updateInfo);
      if(emailInput) emailInput.addEventListener('input', updateInfo);
      if(noteInput) noteInput.addEventListener('input', updateInfo);
    }

  // --- 確認画面処理 ---
  function updateConfirmView() {
    const formatDate = (date) => {
      if (!date) return '';
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const d = date.getDate();
      const days = ['日', '月', '火', '水', '木', '金', '土'];
      const day = days[date.getDay()];
      return `${y}年${m}月${d}日(${day})`;
    };
    
    const elDate = document.getElementById('confirmDate');
    const elStaff = document.getElementById('confirmStaff');
    const elMenu = document.getElementById('confirmMenu');
    const elPrice = document.getElementById('confirmPrice');
    const elTime = document.getElementById('confirmTime');
    const elName = document.getElementById('confirmName');
    const elPhone = document.getElementById('confirmPhone');
    const elEmail = document.getElementById('confirmEmail');
    const elNote = document.getElementById('confirmNote');
    
    if (elDate) {
      elDate.textContent = `${formatDate(state.selectedDate)} ${state.selectedTime || ''}`;
    }
    if (elStaff) {
      elStaff.textContent = staffNames[state.selectedStaff] || '未選択';
    }
    if (elMenu) {
      elMenu.innerHTML = state.selectedMenus.map(m => `<div>${m}</div>`).join('');
    }
    if (elPrice) elPrice.textContent = `¥${state.totalPrice.toLocaleString()}`;
    if (elTime) elTime.textContent = `${state.totalTime}分`;
    if (elName) elName.textContent = state.userInfo.name;
    if (elPhone) elPhone.textContent = state.userInfo.phone;
    if (elEmail) elEmail.textContent = state.userInfo.email || 'なし';
    if (elNote) elNote.textContent = state.userInfo.note || 'なし';
  }

  // --- 送信処理 ---
  function submitBooking() {
    const submitBtn = document.getElementById('bookingSubmit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '送信中...';
    }
    
    // モック通信
    setTimeout(() => {
      const modal = document.getElementById('bookingSuccess');
      if (modal) {
        modal.classList.add('active');
      }
      
      if (submitBtn) {
        submitBtn.textContent = '予約を確定する';
        submitBtn.disabled = false;
      }
    }, 1500);
  }

  // 公開
  window.bloomBooking = {
    init
  };

})();
