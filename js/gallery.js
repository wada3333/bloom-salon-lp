/**
 * BLOOM Hair Salon LP - ギャラリー・ライトボックス・スライダー
 * ギャラリーフィルター、ライトボックス、Before/Afterスライダー、
 * お客様の声カルーセルの制御
 */

(function () {
  'use strict';

  // ===========================
  // ギャラリーフィルター
  // ===========================
  function initGalleryFilter() {
    var filterBtns = document.querySelectorAll('.gallery__filter');
    var items = document.querySelectorAll('.gallery__item');

    if (filterBtns.length === 0 || items.length === 0) return;

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = this.getAttribute('data-filter');

        // アクティブボタンの切替
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');

        // アイテムのフィルタリング
        items.forEach(function (item) {
          var categories = item.getAttribute('data-category') || '';
          var categoryList = categories.split(' ');

          if (filter === 'all' || categoryList.indexOf(filter) !== -1) {
            // 表示アニメーション
            item.style.display = '';
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            requestAnimationFrame(function () {
              item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            });
          } else {
            // 非表示アニメーション
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(function () {
              item.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  // ===========================
  // ライトボックス
  // ===========================
  function initLightbox() {
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    var lightboxImg = lightbox.querySelector('.lightbox__image');
    var lightboxTitle = lightbox.querySelector('.lightbox__title');
    var lightboxDetail = lightbox.querySelector('.lightbox__detail');
    var closeBtn = lightbox.querySelector('.lightbox__close');
    var prevBtn = lightbox.querySelector('.lightbox__prev');
    var nextBtn = lightbox.querySelector('.lightbox__next');

    var galleryItems = document.querySelectorAll('.gallery__item');
    var currentIndex = 0;
    var lastFocusedElement = null;

    // アイテムのデータを収集
    function getItemData(item) {
      var img = item.querySelector('img');
      var overlay = item.querySelector('.gallery__item-overlay');
      return {
        src: img ? img.src.replace(/w=600/, 'w=1200') : '',
        alt: img ? img.alt : '',
        title: overlay ? (overlay.querySelector('h3') ? overlay.querySelector('h3').textContent : '') : '',
        detail: overlay ? (overlay.querySelector('p') ? overlay.querySelector('p').textContent : '') : '',
      };
    }

    // ライトボックスを開く
    function openLightbox(index) {
      currentIndex = index;
      var visibleItems = getVisibleItems();
      if (visibleItems.length === 0) return;

      lastFocusedElement = document.activeElement;

      var data = getItemData(visibleItems[currentIndex]);
      lightboxImg.src = data.src;
      lightboxImg.alt = data.alt;
      if (lightboxTitle) lightboxTitle.textContent = data.title;
      if (lightboxDetail) lightboxDetail.textContent = data.detail;

      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';

      // 最初の要素（閉じるボタンなど）へフォーカス
      var focusable = lightbox.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href]');
      if (focusable.length > 0) {
        (closeBtn || focusable[0]).focus();
      }
    }

    // ライトボックスを閉じる
    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    }

    // 表示中のアイテムを取得
    function getVisibleItems() {
      var visible = [];
      galleryItems.forEach(function (item) {
        if (item.style.display !== 'none') {
          visible.push(item);
        }
      });
      return visible;
    }

    // 前の画像
    function showPrev() {
      var visibleItems = getVisibleItems();
      currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
      var data = getItemData(visibleItems[currentIndex]);
      animateTransition(data);
    }

    // 次の画像
    function showNext() {
      var visibleItems = getVisibleItems();
      currentIndex = (currentIndex + 1) % visibleItems.length;
      var data = getItemData(visibleItems[currentIndex]);
      animateTransition(data);
    }

    // トランジション付き画像切替
    function animateTransition(data) {
      lightboxImg.style.opacity = '0';
      lightboxImg.style.transform = 'scale(0.95)';
      setTimeout(function () {
        lightboxImg.src = data.src;
        lightboxImg.alt = data.alt;
        if (lightboxTitle) lightboxTitle.textContent = data.title;
        if (lightboxDetail) lightboxDetail.textContent = data.detail;
        lightboxImg.style.opacity = '1';
        lightboxImg.style.transform = 'scale(1)';
      }, 200);
    }

    // イベントリスナー
    galleryItems.forEach(function (item, index) {
      item.addEventListener('click', function () {
        var visibleItems = getVisibleItems();
        var visibleIndex = visibleItems.indexOf(item);
        if (visibleIndex !== -1) {
          openLightbox(visibleIndex);
        }
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);
    if (nextBtn) nextBtn.addEventListener('click', showNext);

    // 背景クリックで閉じる
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // キーボード操作（フォーカストラップと矢印操作）
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('active')) return;

      if (e.key === 'Tab') {
        var focusable = Array.prototype.slice.call(
          lightbox.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href]')
        );
        if (focusable.length > 0) {
          var first = focusable[0];
          var last = focusable[focusable.length - 1];
          if (e.shiftKey) {
            if (document.activeElement === first || !lightbox.contains(document.activeElement)) {
              last.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === last || !lightbox.contains(document.activeElement)) {
              first.focus();
              e.preventDefault();
            }
          }
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          showPrev();
          break;
        case 'ArrowRight':
          showNext();
          break;
      }
    });
  }

  // ===========================
  // Before/After スライダー
  // ===========================
  function initBeforeAfter() {
    var slider = document.getElementById('baSlider');
    var handle = document.getElementById('baHandle');
    if (!slider || !handle) return;

    var beforeImage = slider.querySelector('.gallery__ba-image--before');
    if (!beforeImage) return;

    var isDragging = false;

    function updateSlider(x) {
      var rect = slider.getBoundingClientRect();
      var position = Math.max(0, Math.min(x - rect.left, rect.width));
      var percentage = (position / rect.width) * 100;

      // Before画像のクリッピング（右側を隠す）
      beforeImage.style.clipPath = 'polygon(0 0, ' + percentage + '% 0, ' + percentage + '% 100%, 0 100%)';

      // ハンドルの位置
      handle.style.left = percentage + '%';
    }

    // 初期位置: 50%
    updateSlider(0); // will be corrected on first interaction
    beforeImage.style.clipPath = 'polygon(0 0, 50% 0, 50% 100%, 0 100%)';
    handle.style.left = '50%';

    // マウスイベント
    handle.addEventListener('mousedown', function (e) {
      isDragging = true;
      e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
      if (isDragging) {
        updateSlider(e.clientX);
      }
    });

    document.addEventListener('mouseup', function () {
      isDragging = false;
    });

    // タッチイベント
    handle.addEventListener('touchstart', function (e) {
      isDragging = true;
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', function (e) {
      if (isDragging && e.touches.length > 0) {
        updateSlider(e.touches[0].clientX);
      }
    }, { passive: true });

    document.addEventListener('touchend', function () {
      isDragging = false;
    });

    // スライダー上の直接クリック
    slider.addEventListener('click', function (e) {
      updateSlider(e.clientX);
    });
  }

  // ===========================
  // お客様の声カルーセル
  // ===========================
  function initTestimonials() {
    var slider = document.getElementById('testimonialSlider');
    if (!slider) return;

    var track = slider.querySelector('.testimonials__track');
    var cards = slider.querySelectorAll('.testimonials__card');
    var prevBtn = slider.querySelector('.testimonials__btn--prev');
    var nextBtn = slider.querySelector('.testimonials__btn--next');
    var dotsContainer = document.getElementById('testimonialDots');

    if (!track || cards.length === 0) return;

    var currentSlide = 0;
    var totalSlides = cards.length;
    var autoPlayInterval = null;
    var autoPlayDelay = 5000; // 5秒間隔

    // ドットインジケーターを生成
    if (dotsContainer) {
      for (var i = 0; i < totalSlides; i++) {
        var dot = document.createElement('button');
        dot.classList.add('testimonials__dot');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', 'スライド ' + (i + 1));
        dot.setAttribute('data-index', i);
        dot.addEventListener('click', function () {
          goToSlide(parseInt(this.getAttribute('data-index')));
        });
        dotsContainer.appendChild(dot);
      }
    }

    // スライドの表示幅を計算
    function getSlideWidth() {
      if (!cards[0]) return 0;
      var style = window.getComputedStyle(cards[0]);
      var width = cards[0].offsetWidth;
      var marginRight = parseInt(style.marginRight) || 0;
      var marginLeft = parseInt(style.marginLeft) || 0;
      return width + marginRight + marginLeft;
    }

    // スライド切替
    function goToSlide(index) {
      // 最大スライド数を超えないように
      var maxIndex = totalSlides - getVisibleCount();
      currentSlide = Math.max(0, Math.min(index, maxIndex));

      var slideWidth = getSlideWidth();
      track.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      track.style.transform = 'translateX(' + (-currentSlide * slideWidth) + 'px)';

      // ドットの更新
      if (dotsContainer) {
        var dots = dotsContainer.querySelectorAll('.testimonials__dot');
        dots.forEach(function (d, i) {
          d.classList.toggle('active', i === currentSlide);
        });
      }
    }

    // 表示中のカード数を取得
    function getVisibleCount() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    // 次のスライド
    function nextSlide() {
      var maxIndex = totalSlides - getVisibleCount();
      if (currentSlide >= maxIndex) {
        goToSlide(0);
      } else {
        goToSlide(currentSlide + 1);
      }
    }

    // 前のスライド
    function prevSlide() {
      var maxIndex = totalSlides - getVisibleCount();
      if (currentSlide <= 0) {
        goToSlide(maxIndex);
      } else {
        goToSlide(currentSlide - 1);
      }
    }

    // 自動再生
    function startAutoPlay() {
      stopAutoPlay();
      autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
    }

    function stopAutoPlay() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    }

    // ボタンイベント
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        prevSlide();
        startAutoPlay(); // リセット
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        nextSlide();
        startAutoPlay(); // リセット
      });
    }

    // スワイプ対応
    var touchStartX = 0;
    var touchEndX = 0;

    track.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      startAutoPlay();
    }, { passive: true });

    // ホバー時に自動再生を停止
    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);

    // リサイズ時にスライド位置を再計算
    window.addEventListener('resize', function () {
      goToSlide(currentSlide);
    });

    // 自動再生開始
    startAutoPlay();
  }

  // ===========================
  // 公開API
  // ===========================
  function init() {
    initGalleryFilter();
    initLightbox();
    initBeforeAfter();
    initTestimonials();
  }

  window.bloomGallery = {
    init: init,
  };
})();
