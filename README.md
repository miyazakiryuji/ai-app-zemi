# AIアプリ開発入門ゼミ（DMM 生成AI CAMP）受講生向けサイト

GitHub Pages で公開している、受講生向けの案内ページです。

- **公開URL：<https://miyazakiryuji.github.io/ai-app-zemi/>**
- 第1回 オリエンテーション：Home（<https://miyazakiryuji.github.io/ai-app-zemi/>。`lessons/lesson01/` は Home へ転送）
- 第2回 要件定義：<https://miyazakiryuji.github.io/ai-app-zemi/lessons/lesson02/>
- リポジトリ：<https://github.com/miyazakiryuji/ai-app-zemi>

- Home：ゼミの目的・進め方・全7回の流れ・修了要件・開催スケジュール・参加方法・困ったときの順番
- 各回のページ：その回のLIVE講義に合わせて順次公開します

編集元は教材リポジトリ側の `AIアプリ開発入門ゼミ/site/`。ここへコピーして push します。

## ページを増やすとき

新しい回のページ（`lessons/lessonNN/index.html`）は、`<head>` に次の3行を入れると Home と同じ見た目と動きになります。

```html
<link rel="stylesheet" href="../../assets/site.css">
<script>document.documentElement.classList.add("js");</script>
<script src="../../assets/site.js" defer></script>
```

- `assets/site.js`：スクロールに合わせてカードや見出しを順に出す／固定ヘッダの影と読み進みバー／
  メニューのいま見ている節の強調／「上へ戻る」ボタン／図版（`.figure img`）の拡大表示／指示の型（`.prompt`）のコピーボタン。対象の部品は `site.js` 先頭の `REVEAL` と
  `site.css` 末尾の「動き」の節で同じ一覧を持っているので、部品を足すときは両方に足す
- JS が無効でも中身は全部見える。OS の「視差効果を減らす」が有効なときは動かさない

## 各回ページの部品（第2回で追加）

- 図版：`<figure class="figure"><img …><figcaption>…</figcaption></figure>`。2枚並べるときは `<div class="figures">` で包む。押すと拡大
- 指示の型：`<pre class="prompt">…</pre>`（（ ）を差し替える型）／`prompt prompt--plain`（そのまま貼る型）。コピーボタンが自動で付く
- 注意書き：`.note`（黄）／`.note note--key`（橙＝大事）／`.note note--warn`（赤＝注意）。`<img class="note__mascot">` でペンギン先生を右に添えられる
- 流れ図：`.flow > .flow__step`、つまずき：`.pitfalls > .pitfall`、本文の小見出し：`<h3 class="sub">`
- スクショの元は教材リポジトリ側 `カリキュラム/assets/shots/r2_*.png`（講師の環境が写る箇所はぼかし済み）。`assets/images/lesson02/` に置く
