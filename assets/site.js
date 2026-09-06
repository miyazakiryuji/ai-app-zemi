/* AIアプリ開発入門ゼミ 公開サイト — 動き（スクロール連動）
   - <head> で html に .js を付けてから読み込む（site.css の .js 配下の見た目と対）
   - JS が無効でも中身は全部見える（隠すのは .js が付いたときだけ）
   - OS の「視差効果を減らす」が有効なら、動きをすべて止める（.reduce） */
(function () {
  'use strict';

  var root = document.documentElement;
  var mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduce = !!(mq && mq.matches);
  if (reduce) { root.classList.add('reduce'); }

  /* 出現アニメーションの対象。site.css の .js:not(.reduce) の一覧と同じにしておく */
  var REVEAL = [
    '.section__kicker', '.section__title', '.section__lead',
    '.instructor', '.message',
    '.card', '.cycle__step', '.lesson-card', '.steps > li', '.stepcard',
    '.contrast__col', '.agenda__item',
    '.note', '.table-wrap', '.section__inner > p', '.section__inner > ul',
    /* 各回のページ用（site.css 末尾の一覧と同じ） */
    '.figure', '.prompt', '.flow__step', '.pitfall', '.section__inner > h3.sub', '.section__inner > ol', '.term'
  ].join(',');

  function ready(fn) {
    if (document.readyState !== 'loading') { fn(); }
    else { document.addEventListener('DOMContentLoaded', fn); }
  }

  ready(function () {
    var header = document.querySelector('.site-header');
    var targets = Array.prototype.slice.call(document.querySelectorAll(REVEAL));

    /* ---- 1) スクロールに合わせて要素をふわっと出す ---- */
    var revealUpTo = function () {};   /* あとで IO の分岐の中で差し替える */
    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      /* 横に並ぶもの（カードの列）だけ、何番目かで遅延をずらす。上限は 4 枚ぶん。
         縦に読み下すだけの並び（見出し→本文）に段差を付けても待たされるだけなので付けない */
      var STAGGER = '.cards, .lessons, .cycle, .contrast, .stepcards, .pitfalls, .flow, .figures';
      targets.forEach(function (el) {
        var parent = el.parentNode;
        if (!(parent.matches && parent.matches(STAGGER))) { return; }
        var siblings = Array.prototype.filter.call(parent.children, function (c) {
          return c.matches && c.matches(REVEAL);
        });
        var i = siblings.indexOf(el);
        if (i > 0) { el.style.transitionDelay = (Math.min(i, 4) * 45) + 'ms'; }
      });
      /* 見えた要素より上にあるものも一緒に出す。ページ内リンクや速いスクロールで
         画面を通り過ぎた要素は交差を検知できず、白い空きが残ってしまうため */
      /* 出現しきったら、ずらし用の遅延を外して通常のホバー速度（.is-settled）に戻す。
         残したままだと、2枚目以降のカードはホバーの反応まで遅れてしまう */
      function settle(el) {
        el.style.transitionDelay = '';
        el.classList.add('is-settled');
      }
      function reveal(el) {
        el.classList.add('is-visible');
        var done = false;
        var finish = function () { if (!done) { done = true; settle(el); } };
        el.addEventListener('transitionend', function onEnd(e) {
          if (e.target !== el || e.propertyName !== 'opacity') { return; }
          el.removeEventListener('transitionend', onEnd);
          finish();
        });
        setTimeout(finish, 1600); /* transitionend が来ない環境の保険 */
      }
      /* 画面の外にあるものは動かさずに確定させる（ページ内リンクで飛んだとき、
         誰も見ていない何十個ものアニメーションを同時に走らせない） */
      function revealFast(el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) {
          el.style.transitionDelay = '';
          el.classList.add('is-visible', 'is-settled');
        } else { reveal(el); }
      }
      var shown = 0;
      revealUpTo = function (limitY) {
        /* targets は文書順。上から順に、下端が limitY より上にあるものを出す（出したものは監視を外す） */
        while (shown < targets.length && targets[shown].getBoundingClientRect().top < limitY) {
          reveal(targets[shown]); io.unobserve(targets[shown]); shown++;
        }
      };
      var io = new IntersectionObserver(function (entries) {
        var last = -1;
        entries.forEach(function (e) {
          if (e.isIntersecting) { last = Math.max(last, targets.indexOf(e.target)); }
        });
        if (last < 0) { return; }
        for (; shown <= last; shown++) {
          revealFast(targets[shown]);
          io.unobserve(targets[shown]);
        }
      }, { rootMargin: '0px 0px 80px 0px', threshold: 0 });
      targets.forEach(function (el) { io.observe(el); });
      /* 表示中に OS の「視差効果を減らす」を有効にしたら、残りを全部出して止める */
      if (mq && mq.addEventListener) {
        mq.addEventListener('change', function (e) {
          if (!e.matches) { return; }
          reduce = true;
          root.classList.add('reduce');
          io.disconnect();
          targets.forEach(function (el) { el.classList.add('is-visible'); settle(el); });
        });
      }
    }

    /* ---- 2) 固定ヘッダ：スクロールしたら影を付ける／読み進み具合のバー ---- */
    var bar = null;
    if (header) {
      bar = document.createElement('div');
      bar.className = 'progress';
      bar.setAttribute('aria-hidden', 'true');
      header.appendChild(bar);
    }

    /* ---- 3) 「上へ戻る」ボタン（一定量スクロールしたら出す） ---- */
    var totop = document.createElement('a');
    totop.className = 'totop';
    totop.href = '#';
    totop.setAttribute('aria-label', 'ページの先頭へ戻る');
    totop.innerHTML = '<span aria-hidden="true">↑</span>';
    totop.addEventListener('click', function (ev) {
      ev.preventDefault();
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      /* フォーカスもページ先頭へ戻す（キーボード操作で、次の Tab が末尾から始まらないように） */
      var first = header ? header.querySelector('.site-header__name') : null;
      if (first) {
        if (!first.hasAttribute('tabindex')) { first.setAttribute('tabindex', '-1'); }
        first.focus({ preventScroll: true });
      }
    });
    document.body.appendChild(totop);

    var ticking = false;
    var maxScroll = 0;
    var lastY = window.scrollY || window.pageYOffset;
    var upDistance = 0;
    /* ページの高さはスクロールのたびに測らない（毎フレームのレイアウト計算を避ける） */
    function measure() { maxScroll = document.documentElement.scrollHeight - window.innerHeight; }
    function onScroll() {
      if (ticking) { return; }
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY || window.pageYOffset;
        if (header) {
          header.classList.toggle('is-scrolled', y > 8);
          root.style.scrollPaddingTop = (header.offsetHeight + 12) + 'px';   /* 2〜3段に折り返した高さにも追従 */
        }
        /* 保険：画面の下端より上にある要素は、観測（IntersectionObserver）を待たずに出す。
           メニューやブックマーク（#spec など）で一気に飛んだとき、観測が間に合わず白いまま残るのを防ぐ */
        if (typeof revealUpTo === 'function') { revealUpTo(window.innerHeight + 80); }
        if (bar) {
          var p = maxScroll > 0 ? Math.min(1, y / maxScroll) : 0;
          bar.style.transform = 'scaleX(' + p + ')';
        }
        /* 「上へ戻る」は、読み進めている最中（下方向）には出さない。
           ある程度戻ったときだけ出し、また下へ進めば引っ込める */
        var dy = y - lastY;
        upDistance = dy < 0 ? upDistance - dy : 0;
        lastY = y;
        totop.classList.toggle('is-shown', y > 1200 && upDistance > 120);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { measure(); onScroll(); });
    window.addEventListener('load', measure);
    measure();
    onScroll();

    /* ---- 4) ヘッダのメニュー：いま見ている節を光らせる ---- */
    var links = header ? Array.prototype.slice.call(header.querySelectorAll('.site-header__nav a[href^="#"]')) : [];
    var sections = links.map(function (a) {
      return document.getElementById(a.getAttribute('href').slice(1));
    }).filter(Boolean);
    if (links.length && sections.length && 'IntersectionObserver' in window) {
      var current = null, lastCurrent = null;
      var navIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { current = e.target.id; }
        });
        if (current === lastCurrent) { return; }
        links.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + current;
          a.classList.toggle('is-active', on);
          if (on) { a.setAttribute('aria-current', 'location'); } else { a.removeAttribute('aria-current'); }
          if (on) {
            /* 画面が狭いときはメニューが横スクロールなので、光っている項目を見える位置へ寄せる。
               offsetLeft はヘッダ基準になる（sticky が offsetParent）ので、nav の分を引く */
            var nav = a.parentNode;
            if (nav.scrollWidth > nav.clientWidth) {
              nav.scrollTo({ left: Math.max(0, a.offsetLeft - nav.offsetLeft - 16), behavior: reduce ? 'auto' : 'smooth' });
            }
          }
        });
        lastCurrent = current;
      }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
      sections.forEach(function (s) { navIo.observe(s); });
    }

    /* ---- 5) ページ内リンク：固定ヘッダの高さぶん止まる位置をずらす（CSS の scroll-padding が効かない古い環境向け） ---- */
    document.addEventListener('click', function (ev) {
      var a = ev.target.closest && ev.target.closest('a[href^="#"]');
      /* 「本文へスキップ」はブラウザ標準の挙動に任せる（フォーカス移動が目的のため） */
      if (!a || a === totop || a.classList.contains('skip-link')) { return; }
      var id = a.getAttribute('href').slice(1);
      var el = id && document.getElementById(id);
      if (!el) { return; }
      ev.preventDefault();
      var offset = header ? header.offsetHeight + 12 : 0;
      var top = el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - offset;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      if (history.pushState) { history.pushState(null, '', '#' + id); }
      /* 移動先の見出しにフォーカスを移す（Tab の続きが移動先から始まる。キーボード操作なら枠も見える） */
      var target = el.querySelector('.section__title') || el;
      if (!target.hasAttribute('tabindex')) { target.setAttribute('tabindex', '-1'); }
      target.focus({ preventScroll: true });
    });

    /* ---- 6) 図版を押すと大きく表示（Esc・背景クリックで閉じる） ---- */
    var shots = Array.prototype.slice.call(document.querySelectorAll('.figure img'));
    if (shots.length) {
      var lb = document.createElement('div');
      lb.className = 'lightbox'; lb.hidden = true;
      lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', '画像を拡大表示');
      lb.innerHTML = '<button type="button" class="lb-close" aria-label="閉じる">×</button><img alt=""><figcaption></figcaption>';
      document.body.appendChild(lb);
      var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption'), lbClose = lb.querySelector('.lb-close');
      var opener = null;
      function openLb(img) {
        opener = img;
        lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt || '';
        var cap = img.parentNode.querySelector('figcaption');
        lbCap.textContent = cap ? cap.textContent : (img.alt || '');
        lb.hidden = false; root.classList.add('lb-open');
        requestAnimationFrame(function () { lb.classList.add('is-open'); });
        lbClose.focus();
      }
      function closeLb() {
        lb.classList.remove('is-open'); root.classList.remove('lb-open');
        var after = function () { lb.hidden = true; if (opener) { opener.focus({ preventScroll: true }); } };
        if (reduce) { after(); } else { setTimeout(after, 260); }
      }
      shots.forEach(function (img) {
        img.setAttribute('tabindex', '0'); img.setAttribute('role', 'button');
        img.setAttribute('aria-label', (img.alt || '画像') + '（押すと大きく表示）');
        img.addEventListener('click', function () { openLb(img); });
        img.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(img); } });
      });
      lb.addEventListener('click', function (e) { if (e.target !== lbCap) { closeLb(); } });
      document.addEventListener('keydown', function (e) {
        if (lb.hidden) { return; }
        if (e.key === 'Escape') { closeLb(); }
        if (e.key === 'Tab') { e.preventDefault(); lbClose.focus(); }   /* 開いている間は背後へ抜けない */
      });
    }

    /* ---- 7) 指示の型：「コピー」ボタンで中身をクリップボードへ ---- */
    if (navigator.clipboard) {
      Array.prototype.forEach.call(document.querySelectorAll('.prompt'), function (pre) {
        var text = pre.textContent.trim();   /* ボタンを入れる前に控える（ボタンの文字を混ぜない） */
        var btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'copybtn'; btn.textContent = 'コピー';
        btn.setAttribute('aria-label', 'この指示の型をコピー');
        btn.addEventListener('click', function () {
          navigator.clipboard.writeText(text).then(function () {
            btn.textContent = 'コピーしました'; btn.classList.add('is-done');
            setTimeout(function () { btn.textContent = 'コピー'; btn.classList.remove('is-done'); }, 1800);
          });
        });
        pre.appendChild(btn);
      });
    }

    root.classList.add('is-ready');
  });
})();
