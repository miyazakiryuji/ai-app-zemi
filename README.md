# AIアプリ開発入門ゼミ（DMM 生成AI CAMP）受講生向けサイト

GitHub Pages で公開している、受講生向けの案内ページです。

- **公開URL：<https://miyazakiryuji.github.io/ai-app-zemi/>**
- 第1回 オリエンテーション：<https://miyazakiryuji.github.io/ai-app-zemi/lessons/lesson01/>
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
  メニューのいま見ている節の強調／「上へ戻る」ボタン。対象の部品は `site.js` 先頭の `REVEAL` と
  `site.css` 末尾の「動き」の節で同じ一覧を持っているので、部品を足すときは両方に足す
- JS が無効でも中身は全部見える。OS の「視差効果を減らす」が有効なときは動かさない
