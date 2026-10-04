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
    function paintBar(y) {
      if (!bar) { return; }
      var p = maxScroll > 0 ? Math.min(1, y / maxScroll) : 0;
      bar.style.transform = 'scaleX(' + p + ')';
    }
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
        paintBar(y);
        /* 「上へ戻る」は、読み進めている最中（下方向）には出さない。
           ある程度戻ったときだけ出し、また下へ進めば引っ込める */
        var dy = y - lastY;
        upDistance = dy < 0 ? upDistance - dy : 0;
        lastY = y;
        totop.classList.toggle('is-shown', y > 1200 && upDistance > 120);
        ticking = false;
      });
    }
    /* ヘッダのメニューが横にはみ出しているときだけ印を付ける（site.css が端をぼかす。収まっているのにぼかすと最後の項目が薄くなる）。
       端まで送ったら、その側はぼかさない（.at-start／.at-end。端まで送っても最後の「つまずき」が薄いまま残っていた） */
    var navBox = header ? header.querySelector('.site-header__nav') : null;
    var NAV_FADE_L = 20, NAV_FADE_R = 40;   /* site.css のぼかしの幅（左・右）と同じにしておく */
    function markNav() {
      if (!navBox) { return; }
      navBox.classList.toggle('is-overflow', navBox.scrollWidth > navBox.clientWidth + 1);
      navBox.classList.toggle('at-start', navBox.scrollLeft <= 1);
      navBox.classList.toggle('at-end', navBox.scrollLeft + navBox.clientWidth >= navBox.scrollWidth - 1);
    }
    if (navBox) {
      navBox.addEventListener('scroll', markNav, { passive: true });
      /* マウスのホイール（縦）でもメニューを横に送る（1240px 以下。スクロールバーを消しているので、マウスだけでは
         右の項目に届かなかった）。端まで送ったら、いつもどおりページのスクロールに戻す */
      navBox.addEventListener('wheel', function (e) {
        if (e.ctrlKey || navBox.scrollWidth <= navBox.clientWidth + 1 || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) { return; }
        var x = navBox.scrollLeft;
        navBox.scrollLeft = x + e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? navBox.clientWidth : 1);
        if (navBox.scrollLeft !== x) { e.preventDefault(); }
      }, { passive: false });
      /* Tab で来た項目が端で切れていたり、ぼかしの中にあったりしたら、見える位置へ寄せる
         （ブラウザは一部でも見えている項目はスクロールしないので、フォーカスした項目が読めなかった） */
      navBox.addEventListener('focusin', function (e) {
        var a = e.target.closest ? e.target.closest('a') : null;
        if (!a || navBox.scrollWidth <= navBox.clientWidth + 1) { return; }
        var r = a.getBoundingClientRect(), n = navBox.getBoundingClientRect();
        if (r.left < n.left + NAV_FADE_L || r.right > n.right - NAV_FADE_R) {
          navBox.scrollLeft += r.left - n.left - (NAV_FADE_L + 8);
        }
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { measure(); onScroll(); markNav(); });
    window.addEventListener('load', markNav);
    markNav();
    window.addEventListener('load', measure);
    /* 画像が読み込まれるたびにページが伸びるので、高さが変わったら測り直す（読み進みバーがページの途中で満タンにならないように） */
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { measure(); paintBar(window.scrollY || window.pageYOffset); }).observe(document.body);
    }
    measure();
    onScroll();

    /* ---- 4) ヘッダのメニュー：いま見ている節を光らせる ---- */
    var links = header ? Array.prototype.slice.call(header.querySelectorAll('.site-header__nav a[href^="#"]')) : [];
    var sections = links.map(function (a) {
      return document.getElementById(a.getAttribute('href').slice(1));
    }).filter(Boolean);
    if (links.length && sections.length) {
      /* 画面の上から 45% の線より上に頭がある節のうち、いちばん下の節（＝いま読んでいる節）を光らせる。
         最初の節より上（ヒーローのあたり）では、どれも光らせず、メニューも先頭に戻す。
         以前は IntersectionObserver で「帯に入った節」だけを見ていたため、一気に飛んで位置を合わせ直したとき・
         フッターから先頭へ戻したときに、通りがかった節や最後の節が光ったまま残っていた。節は 10 個前後なので、
         スクロールのたびに位置を読んで決める（requestAnimationFrame で 1 コマに 1 回まで） */
      var lastCurrent = null, navTick = false;
      var markCurrent = function () {
        var line = window.innerHeight * 0.45, current = null, best = -Infinity;
        sections.forEach(function (s) {
          var top = s.getBoundingClientRect().top;
          if (top <= line && top > best) { best = top; current = s.id; }
        });
        if (current === lastCurrent) { return; }
        if (!current && navBox) { navBox.scrollTo({ left: 0, behavior: reduce ? 'auto' : 'smooth' }); }
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
      };
      window.addEventListener('scroll', function () {
        if (navTick) { return; }
        navTick = true;
        window.requestAnimationFrame(function () { navTick = false; markCurrent(); });
      }, { passive: true });
      window.addEventListener('resize', markCurrent);
      markCurrent();
    }

    /* ---- 5') 移動先に着くまで・着いたあと、位置を合わせ直す ----
       本文の画像は loading="lazy" で大きさを持たないので、移動の途中や着いたあとに読み込まれてページが伸び、
       移動先が何画面も手前で止まっていた（第5回「データの持ち方」で 5,000px 以上）。
       - 飛び先より上でまだ読み込んでいない画像は、先に読ませる（途中で少しずつ伸びるのを早く出し切る）
       - なめらかに動いている間は、移動先がずれたら行き先だけ差し替える（動いている途中でその場合わせをすると、
         Chrome ではなめらかスクロールの残りが後から足され、移動先を数百 px 行き過ぎていた）
       - 止まったら、残りのずれをその場で合わせる。ずれが 4px 以内で2回続き、先に読ませた画像が読み終わったら終わり
       - 利用者が自分で動かしたら（ホイール・タッチ・クリック・キー）・8秒たったらやめる */
    var settleRun = 0;   /* 新しい移動が始まった・利用者が動かしたら、前の合わせ直しはやめる */
    ['wheel', 'touchstart', 'mousedown', 'keydown'].forEach(function (t) {
      window.addEventListener(t, function () { settleRun++; }, { passive: true });
    });
    var headerGap = function () { return header ? header.offsetHeight + 12 : 0; };
    var jumpTo = function (y) {   /* html の scroll-behavior: smooth を一時的に外して、その場で合わせる */
      var prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, y);
      root.style.scrollBehavior = prev;
    };
    var settleAt = function (el, firstWait, dest0) {   /* dest0：最初に向かわせた位置（同じなら行き先を差し替えない） */
      var run = ++settleRun, calm = 0, until = Date.now() + 8000;
      var lastY = -1, lastDest = typeof dest0 === 'number' ? dest0 : -1;
      var elTop = el.getBoundingClientRect().top;
      var pending = Array.prototype.filter.call(document.querySelectorAll('main img'), function (img) {
        return !img.complete && img.getBoundingClientRect().top < elTop;
      });
      pending.forEach(function (img) { img.loading = 'eager'; });
      (function again(wait) {
        setTimeout(function () {
          if (run !== settleRun || Date.now() > until) { return; }
          var y = window.scrollY || window.pageYOffset;
          if (lastY < 0) { lastY = y; again(120); return; }   /* 1回目は位置を控えるだけ（動いているかは2回目から分かる） */
          var d = el.getBoundingClientRect().top - headerGap();
          var dest = Math.max(0, Math.min(y + d, document.documentElement.scrollHeight - window.innerHeight));
          var moving = Math.abs(y - lastY) > 1;
          lastY = y;
          if (moving) {
            calm = 0;
            if (Math.abs(dest - lastDest) > 4) { lastDest = dest; window.scrollTo({ top: dest, behavior: reduce ? 'auto' : 'smooth' }); }
          } else if (Math.abs(dest - y) > 4) {
            calm = 0; lastDest = dest; jumpTo(dest);
          } else if (++calm >= 2 && pending.every(function (img) { return img.complete; })) {
            return;
          }
          again(120);
        }, wait);
      })(firstWait);
    };
    /* アドレスに #節 を付けて開いたとき（掲示板・ブックマークのリンク）も合わせ直す。
       再読み込み・戻る／進むで開いたときは、ブラウザが元の位置に戻すので触らない */
    var navEntry = window.performance && performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
    var navType = navEntry ? navEntry.type : '';
    if (location.hash.length > 1 && navType !== 'reload' && navType !== 'back_forward') {
      var hashTarget = null;
      try { hashTarget = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (err) { hashTarget = null; }
      if (hashTarget) { settleAt(hashTarget, 300); }
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
      settleAt(el, 150, top);
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
      lb.className = 'lightbox'; lb.hidden = true; lb.tabIndex = -1;
      /* 900px 以下は実寸で開き、箱ごと縦横にずらして読む（site.css）。そのときは箱にフォーカスを置き、矢印キーで動かせるようにする */
      var lbPan = window.matchMedia ? window.matchMedia('(max-width: 900px)') : null;
      lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', '画像を拡大表示');
      lb.innerHTML = '<button type="button" class="lb-close" aria-label="閉じる">×</button><img alt=""><figcaption></figcaption>';
      document.body.appendChild(lb);
      var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption'), lbClose = lb.querySelector('.lb-close');
      var opener = null;
      function openLb(img) {
        opener = img;
        lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt || '';
        var fig = img.closest ? img.closest('figure') : img.parentNode;
        var cap = fig ? fig.querySelector('figcaption') : null;
        lbCap.textContent = cap ? cap.textContent : (img.alt || '');
        lb.hidden = false; root.classList.add('lb-open');
        requestAnimationFrame(function () { lb.classList.add('is-open'); });
        (lbPan && lbPan.matches ? lb : lbClose).focus();
      }
      function closeLb() {
        lb.classList.remove('is-open'); root.classList.remove('lb-open');
        var after = function () { lb.hidden = true; if (opener) { opener.focus({ preventScroll: true }); } };
        if (reduce) { after(); } else { setTimeout(after, 260); }
      }
      shots.forEach(function (img) {
        var fig = img.closest ? img.closest('figure') : null;
        if (fig) {
          /* 「押すと拡大できる」ことを示す印（スマホでは縮んだスクショの文字が読めないため） */
          var hint = document.createElement('span');
          hint.className = 'zoom-hint'; hint.setAttribute('aria-hidden', 'true'); hint.textContent = '押すと拡大';
          fig.appendChild(hint);
          /* 図解（SVG）はスマホで縮めると文字が読めないので、横スクロールできる箱で包む（CSS 側で min-width を付ける） */
          if (fig.classList.contains('figure--diagram') && img.parentNode === fig) {
            var wrap = document.createElement('div'); wrap.className = 'figure__scroll';
            fig.insertBefore(wrap, img); wrap.appendChild(img);
          }
        }
        img.setAttribute('tabindex', '0'); img.setAttribute('role', 'button');
        img.setAttribute('aria-label', (img.alt || '画像') + '（押すと大きく表示）');
        img.addEventListener('click', function () { openLb(img); });
        img.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(img); } });
      });
      lb.addEventListener('click', function (e) { if (e.target !== lbCap) { closeLb(); } });
      document.addEventListener('keydown', function (e) {
        if (lb.hidden) { return; }
        if (e.key === 'Escape') { closeLb(); }
        /* 開いている間は背後へ抜けない。ずらして読む幅では、閉じるボタンと箱（矢印キーで動く）を行き来する */
        if (e.key === 'Tab') {
          e.preventDefault();
          (lbPan && lbPan.matches && document.activeElement === lbClose ? lb : lbClose).focus();
        }
      });
    }

    /* ---- 7) 指示の型：「コピー」ボタンで中身をクリップボードへ ---- */
    if (navigator.clipboard) {
      /* 押した結果を読み上げる場所（画面には出さない。ボタンの文字が変わるだけでは読み上げソフトに伝わらない） */
      var copyLive = document.createElement('p');
      copyLive.className = 'sr-only'; copyLive.setAttribute('role', 'status');
      document.body.appendChild(copyLive);
      var say = function (msg) {   /* 同じ文を続けて出しても読まれるように、一度空にしてから入れる */
        copyLive.textContent = '';
        setTimeout(function () { copyLive.textContent = msg; }, 60);
      };
      Array.prototype.forEach.call(document.querySelectorAll('.prompt'), function (pre) {
        var text = pre.textContent.trim();   /* ボタンを入れる前に控える（ボタンの文字を混ぜない） */
        /* ボタンの名前は型ごとに（例「指示①（モック）をコピー」。同じ名前が1ページに 13 個並ぶと区別できない） */
        var name = (pre.getAttribute('data-label') || '').split(/\s*―\s*/)[0] || '指示の型';
        var makeBtn = function (extra) {
          var btn = document.createElement('button');
          btn.type = 'button'; btn.className = 'copybtn' + (extra ? ' ' + extra : ''); btn.textContent = 'コピー';
          btn.setAttribute('aria-label', name + 'をコピー');
          btn.addEventListener('click', function () {
            navigator.clipboard.writeText(text).then(function () {
              btn.textContent = 'コピーしました'; btn.classList.add('is-done');
              say(name + 'をコピーしました');
              setTimeout(function () { btn.textContent = 'コピー'; btn.classList.remove('is-done'); }, 1800);
            }, function () {
              btn.textContent = 'コピーできませんでした';
              say('コピーできませんでした。文字を選んでコピーしてください');
              setTimeout(function () { btn.textContent = 'コピー'; }, 2600);
            });
          });
          pre.appendChild(btn);
        };
        makeBtn('');
        /* 1画面に収まらない長さの型は、読み終えた位置でも押せるように下にも置く */
        if (pre.offsetHeight > window.innerHeight * 0.9) { makeBtn('copybtn--bottom'); }
      });
    }

    /* ---- 7') 3列以上の表：各セルに列の見出しを data-label で写す。720px 以下では1行を1枚のカードに積み、
       各セルの上に列の名前を出す（site.css）。横スクロールでは左の1〜2列しか見えなかった ---- */
    Array.prototype.forEach.call(document.querySelectorAll('.lesson table.tbl'), function (t) {
      var heads = Array.prototype.map.call(t.querySelectorAll('thead th'), function (th) { return th.textContent.trim(); });
      if (heads.length < 3) { return; }
      Array.prototype.forEach.call(t.querySelectorAll('tbody tr'), function (tr) {
        Array.prototype.forEach.call(tr.children, function (c, i) { if (heads[i]) { c.setAttribute('data-label', heads[i]); } });
      });
    });

    /* 印刷・PDF に保存する前に、まだ読み込んでいない画像を読ませる（loading="lazy" のままだと空白で出る） */
    window.addEventListener('beforeprint', function () {
      Array.prototype.forEach.call(document.querySelectorAll('img[loading="lazy"]'), function (img) { img.loading = 'eager'; });
    });

    /* ---- 8) タブ（開催スケジュールの期の切り替えなど）：[data-tabs] の中の role=tab / role=tabpanel ---- */
    Array.prototype.forEach.call(document.querySelectorAll('[data-tabs]'), function (box) {
      var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
      if (!tabs.length) { return; }
      function select(tab, focus) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.tabIndex = on ? 0 : -1;
          var panel = document.getElementById(t.getAttribute('aria-controls'));
          if (panel) { panel.hidden = !on; }
        });
        if (focus) { tab.focus(); }
      }
      /* 選ばれていない期のパネルは JS で隠す（HTML の hidden は JS が動かないときに CSS で外す。site.css） */
      select(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0], false);
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { select(t, false); });
        /* 矢印キーで隣のタブへ（キーボード操作の標準的な動き） */
        t.addEventListener('keydown', function (e) {
          var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!d) { return; }
          e.preventDefault();
          select(tabs[(i + d + tabs.length) % tabs.length], true);
        });
      });
      /* #cohort-6 のようにパネルの id で開いたら、その期を選んだ状態で表示する */
      var target = location.hash && box.querySelector(location.hash);
      if (target && target.getAttribute('role') === 'tabpanel') {
        var owner = tabs.filter(function (t) { return t.getAttribute('aria-controls') === target.id; })[0];
        if (owner) { select(owner, false); }
      }
    });

    root.classList.add('is-ready');
  });
})();
