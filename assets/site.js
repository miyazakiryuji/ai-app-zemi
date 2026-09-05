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
    '.now__inner', '.instructor', '.message',
    '.card', '.cycle__step', '.lesson-card', '.steps > li', '.stepcard',
    '.contrast__col', '.agenda__item', '.meta-card', '.app-card', '.career > li',
    '.note', '.table-wrap', '.section__inner > p', '.section__inner > ul'
  ].join(',');

  function ready(fn) {
    if (document.readyState !== 'loading') { fn(); }
    else { document.addEventListener('DOMContentLoaded', fn); }
  }

  ready(function () {
    var header = document.querySelector('.site-header');
    var targets = Array.prototype.slice.call(document.querySelectorAll(REVEAL));

    /* ---- 1) スクロールに合わせて要素をふわっと出す ---- */
    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      /* 同じ親の中で何番目かで遅延をずらす（カードが順に出る）。上限は 8 枚ぶん */
      targets.forEach(function (el) {
        var parent = el.parentNode;
        var siblings = Array.prototype.filter.call(parent.children, function (c) {
          return c.matches && c.matches(REVEAL);
        });
        var i = siblings.indexOf(el);
        if (i > 0) { el.style.transitionDelay = (Math.min(i, 8) * 70) + 'ms'; }
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
      var shown = 0;
      var io = new IntersectionObserver(function (entries) {
        var last = -1;
        entries.forEach(function (e) {
          if (e.isIntersecting) { last = Math.max(last, targets.indexOf(e.target)); }
        });
        if (last < 0) { return; }
        for (; shown <= last; shown++) {
          reveal(targets[shown]);
          io.unobserve(targets[shown]);
        }
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
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
    function onScroll() {
      if (ticking) { return; }
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY || window.pageYOffset;
        if (header) { header.classList.toggle('is-scrolled', y > 8); }
        if (bar) {
          var max = document.documentElement.scrollHeight - window.innerHeight;
          var p = max > 0 ? Math.min(1, y / max) : 0;
          bar.style.transform = 'scaleX(' + p + ')';
        }
        totop.classList.toggle('is-shown', y > 600);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    /* ---- 4) ヘッダのメニュー：いま見ている節を光らせる ---- */
    var links = header ? Array.prototype.slice.call(header.querySelectorAll('.site-header__nav a[href^="#"]')) : [];
    var sections = links.map(function (a) {
      return document.getElementById(a.getAttribute('href').slice(1));
    }).filter(Boolean);
    if (links.length && sections.length && 'IntersectionObserver' in window) {
      var current = null;
      var navIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { current = e.target.id; }
        });
        links.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + current;
          a.classList.toggle('is-active', on);
          if (on) {
            /* 画面が狭いときはメニューが横スクロールなので、光っている項目を見える位置へ寄せる */
            var nav = a.parentNode;
            if (nav.scrollWidth > nav.clientWidth) {
              nav.scrollTo({ left: a.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
            }
          }
        });
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
      /* 移動先にフォーカスを移す（Tab の続きが移動先から始まるように） */
      if (!el.hasAttribute('tabindex')) { el.setAttribute('tabindex', '-1'); }
      el.focus({ preventScroll: true });
    });

    root.classList.add('is-ready');
  });
})();
