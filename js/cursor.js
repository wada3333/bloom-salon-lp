/**
 * カスタムカーソルの実装
 */

const init = () => {
  // タッチデバイスの判定（タッチデバイスではカーソルを非表示/無効化）
  if (window.matchMedia('(pointer: coarse)').matches) {
    return;
  }

  const dot = document.querySelector('.cursor__dot');
  const ring = document.querySelector('.cursor__ring');
  
  if (!dot || !ring) return;

  // カーソルの目標位置（マウス位置）
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  // リングの現在の位置（補間用）
  let ringPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  // マウス移動イベントで目標位置を更新
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // 線形補間(lerp)関数
  const lerp = (start, end, amount) => {
    return (1 - amount) * start + amount * end;
  };

  // アニメーションループ
  const render = () => {
    // dotはrequestAnimationFrameで即座に追従
    dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;

    // ringはlerpでなめらかに追従 (イージング: 0.15)
    ringPos.x = lerp(ringPos.x, mouse.x, 0.15);
    ringPos.y = lerp(ringPos.y, mouse.y, 0.15);
    ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;

    requestAnimationFrame(render);
  };
  // ループ開始
  requestAnimationFrame(render);

  // ホバーエフェクトの設定
  const addHoverEffects = () => {
    // data-cursor="view" を持つ要素へのホバー
    const viewElements = document.querySelectorAll('[data-cursor="view"]');
    viewElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        // ringを拡大し'VIEW'テキストを表示するクラスを付与
        ring.classList.add('is-view');
        // dotを隠す
        dot.style.opacity = '0';
      });
      el.addEventListener('mouseleave', () => {
        ring.classList.remove('is-view');
        dot.style.opacity = '1';
      });
    });

    // 一般的なリンクやボタンへのホバー
    const interactives = document.querySelectorAll('a, button, .interactive');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        // data-cursor="view"でない場合のみ適用
        if (!el.hasAttribute('data-cursor')) {
          // ringを縮小してdotを拡大するクラスを付与
          ring.classList.add('is-hover');
          dot.classList.add('is-hover');
        }
      });
      el.addEventListener('mouseleave', () => {
        ring.classList.remove('is-hover');
        dot.classList.remove('is-hover');
      });
    });
  };

  addHoverEffects();
};

// グローバルスコープに公開
window.bloomCursor = { init };
