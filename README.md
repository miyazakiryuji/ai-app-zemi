# AIアプリ開発入門ゼミ（DMM 生成AI CAMP）受講生向けサイト

GitHub Pages で公開している、受講生向けの案内ページです。

- **公開URL：<https://miyazakiryuji.github.io/ai-app-zemi/>**
- 第1回 オリエンテーション：Home（<https://miyazakiryuji.github.io/ai-app-zemi/>。`lessons/lesson01/` は Home へ転送）
- 第2回 要件定義：<https://miyazakiryuji.github.io/ai-app-zemi/lessons/lesson02/>
- 第3回 モックを作る：<https://miyazakiryuji.github.io/ai-app-zemi/lessons/lesson03/>
- リポジトリ：<https://github.com/miyazakiryuji/ai-app-zemi>

- Home：ゼミの目的・進め方・全7回の流れ・修了要件・開催スケジュール・参加方法・困ったときの順番
- 各回のページ：その回のLIVE講義に合わせて順次公開します

編集元は教材リポジトリ側の `AIアプリ開発入門ゼミ/site/`。ここへコピーして push します。

## 期（5期・6期…）が増えたとき

開催日・時間・入室先は期ごとに違うので、Home の「開催スケジュールと参加方法」は期のタブで切り替える作りになっている
（`index.html` の `<div class="cohorts" data-tabs>`。タブの動きは `site.js` の「8) タブ」）。

1. `index.html` の `<!-- 6期 -->` の枠（`id="cohort-6"` のパネル）に、5期の枠をコピーして表（回・内容・開催日）と入室先（Google Meet）を入れる。
   タブのボタン（`id="tab-cohort-6"`）の `<small>準備中</small>` を開催期間に書き換える
2. 次の期（7期）は、パネルとタブを1組ずつ足す。`aria-controls` と `id` を対にする。最初に開いておく期は `aria-selected="true"`（他は `false` と `tabindex="-1"`）
3. 進め方・全7回の流れ・修了要件は期をまたいで同じ前提。期で違うものはこの節の中だけに書く（ヒーローや「この回」の帯に日付や曜日を書かない）
4. `#cohort-6` のようにパネルの id を付けた URL で開くと、その期が選ばれた状態で表示される（案内文に貼れる）

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

## 第2回ページのその後の部品（2026-09-06）

- 用語の箱：`<div class="term"><p class="term__title"><img src="../../assets/icons/icon-glossary.svg" alt="">用語</p><dl><dt>語</dt><dd>説明</dd></dl></div>`。
  初出の語は本文に（＝…）で足さず、その段落の直後にこの箱で説明する（講義資料の「📗 用語」と同じ役割。（ ）書きが多いと読みづらい）
- 説明カード：「項目｜内容｜なぜ」のような表は `<dl class="explain-list">`（1項目ずつ縦に読む）。行どうしを比較する表（3類型・開催スケジュール）だけ `table.tbl` のまま
- 表：`table.tbl` の見た目は Codex の提案で統一（見出しの下線・見える罫線・上揃え・列幅固定）。Home の開催スケジュールは `tbl--schedule`
- アイコン：`assets/icons/icon-*.svg`（Codex 生成・16個・線画・橙）。節見出しは `.section__head > .section__icon`、カードは `.card__icon` `.pitfall__icon`、注意書きは `.note__icon`、指示の型は `.prompt__icon`
- 図版の並び：`figures--2`（2列固定）、`figures--menu`（縦長1枚＋横長1枚）
- スクショの伏せ字は「ぼかし」ではなく薄いグレーの角丸で平らに塗る（ぼかしは壊れて見える）
- 余白・文字組みは `body.lesson` 配下で上書き（本文 16px／行間 1.7〜1.8／字間 0／8px 単位）。根拠は `10_products/_references/design/`

## 第3回ページ（2026-09-07）

- スクショの元は教材リポジトリ側 `カリキュラム/assets/shots/r3_*.png`（講師の環境が写る箇所は平らに塗ってある）。`assets/images/lesson03/` に置く。図解は `diagram_mock.svg`・`diagram_brushup.svg`（Codex 生成）
- アイコンを5個追加（Codex 生成・同じ線画）：`icon-mock`（モックとは）・`icon-browser`（ブラウザで開く）・`icon-check-screen`（見直す・成果物）・`icon-palette`（テイスト）・`icon-detail`（細部）
- Claude デスクトップアプリのスクショは、サイドバーを落としてチャット欄だけを切り出したもの（`r3_app_prompt*`）と、プレビュー欄まで含む全体（`r3_app_prompt1_done`・`r3_app_prompt2_done`）の2種類。切り出しは文字を読ませたい図、全体は「右の欄に画面が出る」を見せたい図
