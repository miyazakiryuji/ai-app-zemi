/* AIアプリ開発入門ゼミ 受講生向けサイト — 動き
   残しているのは「指示の型（pre.prompt）のコピーボタン」だけ。
   JS が動かなくても中身は全部読める（ボタンが出ないだけ）。
   図版の拡大は a.zoom（画像そのものを開くリンク）で JS を使わない。 */
(function () {
  if (!document.querySelectorAll || !navigator.clipboard) { return; }
  function ready(fn) { if (document.readyState !== 'loading') { fn(); } else { document.addEventListener('DOMContentLoaded', fn); } }
  ready(function () {
    var live = document.createElement('div');
    live.className = 'sr-only'; live.setAttribute('aria-live', 'polite');
    document.body.appendChild(live);
    Array.prototype.forEach.call(document.querySelectorAll('pre.prompt'), function (pre) {
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'copy-btn'; btn.textContent = 'コピー';
      btn.setAttribute('aria-label', '指示の文章をコピー');
      var original = pre.textContent;   /* ボタンを入れる前の文章を取っておく */
      btn.addEventListener('click', function () {
        navigator.clipboard.writeText(original).then(function () {
          btn.textContent = 'コピーしました';
          live.textContent = ''; setTimeout(function () { live.textContent = '指示の文章をコピーしました'; }, 60);
          setTimeout(function () { btn.textContent = 'コピー'; }, 1600);
        }, function () {
          btn.textContent = 'コピーできませんでした';
          setTimeout(function () { btn.textContent = 'コピー'; }, 1600);
        });
      });
      pre.classList.add('has-copy');
      pre.insertBefore(btn, pre.firstChild);
    });
  });
})();
