/**
 * BLOOM Hair Salon LP - GSAPアニメーション
 * GSAP + ScrollTrigger を使用したアニメーション制御
 */

(function () {
  'use strict';

  // ScrollTrigger プラグインの登録
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ===========================
  // ローディングアニメーション
  // ===========================
  function initLoading() {
    const loading = document.getElementById('loading');
    if (!loading) return;

    // ローディング中はスクロールを禁止
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: function () {
        // ローディング完了後の処理
        loading.classList.add('loaded');
        document.body.style.overflow = '';
        document.body.classList.remove('loading-active');

        // ローディング要素を少し後に削除
        setTimeout(function () {
          loading.style.display = 'none';
        }, 500);
      }
    });

    // SVGテキストのストローク描画アニメーション
    const textPath = loading.querySelector('.loading__text-path');
    if (textPath) {
      // stroke-dasharrayを設定
      const length = textPath.textContent.length * 30; // おおよその文字パス長
      textPath.style.strokeDasharray = length;
      textPath.style.strokeDashoffset = length;

      tl.to(textPath, {
        strokeDashoffset: 0,
        duration: 1.8,
        ease: 'power2.inOut',
      });

      // フィルのフェードイン
      tl.to(textPath, {
        fill: 'var(--color-primary, #2D5016)',
        duration: 0.6,
        ease: 'power2.out',
      }, '-=0.3');
    }

    // プログレスバーのアニメーション
    const barFill = loading.querySelector('.loading__bar-fill');
    if (barFill) {
      tl.to(barFill, {
        scaleX: 1,
        duration: 1.2,
        ease: 'power3.inOut',
      }, '-=1.5');
    }

    // タグラインのフェードイン
    const tagline = loading.querySelector('.loading__tagline');
    if (tagline) {
      tl.fromTo(tagline,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.5'
      );
    }

    // ローディング画面をスライドアップで非表示
    tl.to(loading, {
      yPercent: -100,
      duration: 0.8,
      ease: 'power4.inOut',
      delay: 0.3,
    });
  }

  // ===========================
  // ヒーローセクションアニメーション
  // ===========================
  function initHeroAnimations() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // 背景画像の緩やかなズーム（Ken Burns効果）
    const bgImage = hero.querySelector('.hero__bg-image');
    if (bgImage) {
      gsap.to(bgImage, {
        scale: 1.1,
        duration: 20,
        ease: 'none',
        repeat: -1,
        yoyo: true,
      });
    }

    // テキストのリビールアニメーション（clip-pathで順番に出現）
    const revealTexts = hero.querySelectorAll('.reveal-text');
    revealTexts.forEach(function (el, index) {
      gsap.fromTo(el,
        {
          clipPath: 'inset(0 100% 0 0)',
          opacity: 0,
        },
        {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration: 1,
          ease: 'power4.out',
          delay: 0.8 + index * 0.2,
        }
      );
    });

    // スクロールインジケーターのバウンス
    var scrollIndicator = hero.querySelector('.hero__scroll-line');
    if (scrollIndicator) {
      gsap.to(scrollIndicator, {
        scaleY: 1,
        duration: 1,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true,
      });
    }

    // ヒーローセクションのパララックス（スクロール連動）
    if (bgImage) {
      gsap.to(bgImage, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    // ヒーローコンテンツのフェードアウト（スクロール時）
    var heroContent = hero.querySelector('.hero__content');
    if (heroContent) {
      gsap.to(heroContent, {
        opacity: 0,
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: '60% top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  }

  // ===========================
  // スクロール連動アニメーション
  // ===========================
  function initScrollAnimations() {
    // フェードアップアニメーション（.fade-up要素）
    var fadeUps = document.querySelectorAll('.fade-up');
    if (fadeUps.length > 0) {
      // 初期状態を設定
      gsap.set(fadeUps, { opacity: 0, y: 30 });

      ScrollTrigger.batch(fadeUps, {
        onEnter: function (batch) {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
          });
        },
        start: 'top 85%',
      });
    }

    // スプリットテキスト（1文字ずつフェードイン）
    var splitTexts = document.querySelectorAll('.split-text');
    splitTexts.forEach(function (el) {
      // HTML内のbr要素を保持しつつテキストを分割
      var innerHTML = el.innerHTML;
      var result = '';
      var inTag = false;

      for (var i = 0; i < innerHTML.length; i++) {
        var char = innerHTML[i];

        if (char === '<') {
          inTag = true;
          result += char;
        } else if (char === '>') {
          inTag = false;
          result += char;
        } else if (inTag) {
          result += char;
        } else if (char === ' ' || char === '\n' || char === '\r' || char === '\t') {
          result += char;
        } else {
          result += '<span class="char" style="display:inline-block;opacity:0;transform:translateY(20px)">' + char + '</span>';
        }
      }

      el.innerHTML = result;

      // ScrollTriggerでアニメーション
      var chars = el.querySelectorAll('.char');
      if (chars.length > 0) {
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.03,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
          },
        });
      }
    });

    // パララックスコンテナ内の画像
    var parallaxImages = document.querySelectorAll('.parallax-container img');
    parallaxImages.forEach(function (img) {
      gsap.set(img, { scale: 1.2 });
      gsap.to(img, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: img.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    // セクション見出し(.section__label)のスライドイン
    var sectionLabels = document.querySelectorAll('.section__label');
    sectionLabels.forEach(function (label) {
      gsap.fromTo(label,
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: label,
            start: 'top 90%',
          },
        }
      );
    });
  }

  // ===========================
  // マグネティックボタン
  // ===========================
  function initMagneticButtons() {
    // タッチデバイスではスキップ
    if ('ontouchstart' in window) return;

    var magnetics = document.querySelectorAll('.magnetic');

    magnetics.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.4,
          ease: 'power2.out',
        });
      });

      btn.addEventListener('mouseleave', function () {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.3)',
        });
      });
    });
  }

  // ===========================
  // ナビリンクのホバーアニメーション
  // ===========================
  function initNavAnimations() {
    var navLinks = document.querySelectorAll('.header__nav-link');

    navLinks.forEach(function (link) {
      // リンクの中身をspanで囲む（まだ囲まれていなければ）
      if (!link.querySelector('span')) {
        var text = link.textContent;
        link.textContent = '';
        var span = document.createElement('span');
        span.textContent = text;
        span.style.display = 'inline-block';
        span.style.transition = 'transform 0.3s ease';
        link.appendChild(span);
      }

      link.addEventListener('mouseenter', function () {
        var span = link.querySelector('span');
        if (span) {
          gsap.to(span, { yPercent: -100, duration: 0.3, ease: 'power2.out' });
        }
      });

      link.addEventListener('mouseleave', function () {
        var span = link.querySelector('span');
        if (span) {
          gsap.to(span, { yPercent: 0, duration: 0.3, ease: 'power2.out' });
        }
      });
    });
  }

  // ===========================
  // 公開API
  // ===========================
  function initAnimations() {
    initLoading();
    initHeroAnimations();
    initScrollAnimations();
    initMagneticButtons();
    initNavAnimations();
  }

  window.bloomAnimations = {
    initAnimations: initAnimations,
  };
})();
