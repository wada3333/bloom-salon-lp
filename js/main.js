/**
 * BLOOM Hair Salon LP - メインスクリプト
 * サイト全体の初期化・イベント管理を行うメインエントリーポイント
 */

(function () {
  'use strict';

  // ===========================
  // 定数・設定
  // ===========================
  const CONFIG = {
    scrollThreshold: 50,        // ヘッダー背景が出る閾値(px)
    smoothScrollOffset: 80,     // スムーススクロール時のオフセット
    backToTopThreshold: 500,    // トップへ戻るボタンの表示閾値
    floatingCtaDelay: 800,      // フローティングCTAの表示遅延(px)
  };

  // ===========================
  // DOM要素のキャッシュ
  // ===========================
  const els = {
    header: document.getElementById('header'),
    burger: document.getElementById('burger'),
    mobileMenu: document.getElementById('mobileMenu'),
    themeToggle: document.getElementById('themeToggle'),
    backToTop: document.getElementById('backToTop'),
    floatingCta: document.getElementById('floatingCta'),
    floatingLine: document.getElementById('floatingLine'),
    loading: document.getElementById('loading'),
  };

  // ===========================
  // 統合スクロール制御 (header / backToTop / floatingCta)
  // requestAnimationFrame でスロットル
  // ===========================
  function initUnifiedScroll() {
    let lastScrollY = 0;
    let ticking = false;

    function handleScroll() {
      const scrollY = window.scrollY;

      // 1. ヘッダー制御
      if (els.header) {
        if (scrollY > CONFIG.scrollThreshold) {
          els.header.classList.add('is-scrolled');
        } else {
          els.header.classList.remove('is-scrolled');
        }

        if (scrollY > lastScrollY && scrollY > 300) {
          els.header.classList.add('hidden');
        } else {
          els.header.classList.remove('hidden');
        }
      }

      // 2. トップへ戻るボタン
      if (els.backToTop) {
        if (scrollY > CONFIG.backToTopThreshold) {
          els.backToTop.classList.add('visible');
        } else {
          els.backToTop.classList.remove('visible');
        }
      }

      // 3. フローティングCTA
      if (els.floatingCta) {
        if (scrollY > CONFIG.floatingCtaDelay) {
          els.floatingCta.classList.add('visible');
        } else {
          els.floatingCta.classList.remove('visible');
        }
      }

      lastScrollY = scrollY;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    }, { passive: true });

    // 初期表示時の状態反映
    handleScroll();
  }

  // ===========================
  // モバイルメニュー
  // ===========================
  function initMobileMenu() {
    const burger = els.burger;
    const menu = els.mobileMenu;
    if (!burger || !menu) return;

    function toggleMenu() {
      const isOpen = burger.classList.toggle('active');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menu.classList.toggle('active');
      document.body.classList.toggle('menu-open', isOpen);
    }

    function closeMenu() {
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      menu.classList.remove('active');
      document.body.classList.remove('menu-open');
    }

    burger.addEventListener('click', toggleMenu);

    // メニュー内リンクをクリックしたらメニューを閉じる
    menu.querySelectorAll('.mobile-menu__link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Escapeキーでメニューを閉じる
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  // ===========================
  // ダークモード切替
  // ===========================
  function initThemeToggle() {
    const toggle = els.themeToggle;
    if (!toggle) return;

    // ローカルストレージからテーマを取得
    const savedTheme = localStorage.getItem('bloom-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    toggle.addEventListener('click', function () {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('bloom-theme', newTheme);
    });
  }

  // ===========================
  // スムーススクロール（アンカーリンク）
  // ===========================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const targetPosition = target.getBoundingClientRect().top + window.scrollY - CONFIG.smoothScrollOffset;

        // Lenisが使えればLenisでスクロール、なければネイティブ
        if (window.bloomLenis) {
          window.bloomLenis.scrollTo(target, { offset: -CONFIG.smoothScrollOffset });
        } else {
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth',
          });
        }
      });
    });
  }

  // ===========================
  // Lenis スムーススクロール初期化
  // ===========================
  function initLenis() {
    if (typeof Lenis === 'undefined') return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      orientation: 'vertical',
      smoothWheel: true,
    });

    // GSAPのScrollTriggerと連携
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    window.bloomLenis = lenis;
  }

  // ===========================
  // トップへ戻るボタン
  // ===========================
  function initBackToTop() {
    const btn = els.backToTop;
    if (!btn) return;

    btn.addEventListener('click', function () {
      if (window.bloomLenis) {
        window.bloomLenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // ===========================
  // フローティング要素の表示制御
  // ===========================
  function initFloatingElements() {
    // スクロールによる表示切り替えは initUnifiedScroll に統合済み
  }

  // ===========================
  // メニュータブ切替
  // ===========================
  function initMenuTabs() {
    const tabs = document.querySelectorAll('.menu__tab');
    const panels = document.querySelectorAll('.menu__panel');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const target = this.getAttribute('data-tab');

        // アクティブ状態の管理
        tabs.forEach(function (t) { t.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.remove('active'); });

        this.classList.add('active');
        const targetPanel = document.querySelector('.menu__panel[data-panel="' + target + '"]');
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  }

  // ===========================
  // アクティブナビリンクの更新
  // ===========================
  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.header__nav-link');

    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-50% 0px -50% 0px',
    });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // ===========================
  // 画像の遅延読み込みフォールバック
  // ===========================
  function initLazyLoad() {
    if ('loading' in HTMLImageElement.prototype) return; // ネイティブ対応済み

    const images = document.querySelectorAll('img[loading="lazy"]');
    if (typeof IntersectionObserver === 'undefined') return;

    const imageObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(function (img) {
      imageObserver.observe(img);
    });
  }

  // ===========================
  // ページ表示時のローディング解除
  // ===========================
  function hideLoading() {
    // アニメーションモジュールが初期化を担当する場合はスキップ
    if (window.bloomAnimations) return;

    // フォールバック: 2秒後にローディングを非表示にする
    setTimeout(function () {
      if (els.loading) {
        els.loading.classList.add('loaded');
        document.body.classList.remove('loading-active');
      }
    }, 2000);
  }

  // ===========================
  // ユーティリティ: デバウンス
  // ===========================
  function debounce(func, wait) {
    var timeout;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        func.apply(context, args);
      }, wait);
    };
  }

  // ===========================
  // リサイズハンドラー
  // ===========================
  function initResizeHandler() {
    var resizeHandler = debounce(function () {
      // GSAPのScrollTriggerをリフレッシュ
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }, 250);

    window.addEventListener('resize', resizeHandler);
  }

  // ===========================
  // 初期化
  // ===========================
  function init() {
    // ローディング中はbodyのスクロールを無効にする
    document.body.classList.add('loading-active');

    // Lenisスムーススクロール（最初に初期化）
    initLenis();

    // 各モジュールの初期化
    initUnifiedScroll();
    initMobileMenu();
    initThemeToggle();
    initSmoothScroll();
    initBackToTop();
    initFloatingElements();
    initMenuTabs();
    initActiveNav();
    initLazyLoad();
    initResizeHandler();

    // 外部モジュールの初期化
    if (window.bloomCursor) {
      window.bloomCursor.init();
    }

    if (window.bloomAnimations) {
      window.bloomAnimations.initAnimations();
    } else {
      hideLoading();
    }

    if (window.bloomGallery) {
      window.bloomGallery.init();
    }

    if (window.bloomBooking) {
      window.bloomBooking.init();
    }

    console.log('%c🌿 BLOOM Hair Salon LP Loaded', 'color: #2D5016; font-size: 14px; font-weight: bold;');
  }

  // DOM読み込み完了後に初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
