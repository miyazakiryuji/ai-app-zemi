# AIアプリ開発入門ゼミ（DMM 生成AI CAMP）受講生向けサイト

GitHub Pages で公開している、受講生向けの案内ページです。

- **公開URL：<https://miyazakiryuji.github.io/ai-app-zemi/>**
- 第1回 オリエンテーション：Home（<https://miyazakiryuji.github.io/ai-app-zemi/>。`lessons/lesson01/` は Home へ転送）
- 第2回 要件定義：<https://miyazakiryuji.github.io/ai-app-zemi/lessons/lesson02/>
- 第3回 モックを作る：<https://miyazakiryuji.github.io/ai-app-zemi/lessons/lesson03/>
- 第4回 画面側を作る：<https://miyazakiryuji.github.io/ai-app-zemi/lessons/lesson04/>
- 第5回 API 連携とデータの持ち方：<https://miyazakiryuji.github.io/ai-app-zemi/lessons/lesson05/>
- 第6回 テスト：<https://miyazakiryuji.github.io/ai-app-zemi/lessons/lesson06/>
- 第7回 デバッグと卒業制作：<https://miyazakiryuji.github.io/ai-app-zemi/lessons/lesson07/>
- リポジトリ：<https://github.com/miyazakiryuji/ai-app-zemi>

- Home：ゼミの目的・進め方・全7回の流れ・修了要件・開催スケジュール・参加方法・困ったときの順番
- 各回のページ：その回の LIVE 講義に合わせて順次公開します

編集元は教材リポジトリ側の `AIアプリ開発入門ゼミ/site/`（このフォルダが公開リポジトリの git チェックアウト）。Boarding Pass も同じ HTML を取り込んでいる（`boarding-pass/tools/build-curriculum.mjs` の `ai-app-lessons`）ので、**フォルダ構成・ファイル名・画像のパスと名前は変えない**。

## 見た目の型（2026-10 に載せ替え）

ClaudeCode マスターゼミ「各回の資料」（`../../ClaudeCodeゼミ/各回の資料/template.html`）と同じ型。CSS は `assets/lesson.css` の1本だけ。

- `assets/lesson.css`：マスターゼミの `各回の資料/assets/lesson.css` の写し＋末尾の「入門ゼミ追加」の節（入門ゼミにしか無い部品）。**上の部品の見た目は変えない。** マスターゼミ側の CSS が変わったら、「入門ゼミ追加」の節より上を写し直す
- `assets/site.js`：指示の型（`pre.prompt`）にコピーボタンを付けるだけ。JS が動かなくても中身は全部読める。図版の拡大は `a.zoom`（画像そのものを開くリンク）で JS を使わない
- `assets/figs/`：各回の「この回の地図」と Home の「全7回の流れ」の図解（Codex の画像生成で描き、cwebp で webp に）。画風は `../../ClaudeCodeゼミ/各回の資料/_work/STYLE.md`
- `assets/penguins/`：ペンギン先生。マスターゼミと同じ画像
- `assets/images/`：各回のスクリーンショットと旧デザインで描いた SVG の図解（置き場と名前はそのまま。教材の撮影台帳がファイル名で追っている）
- `<style>`・`style=""`・外部フォント・外部画像は使わない

### ページの並び（どの回も同じ）

`header.hero`（kicker「AIアプリ開発入門ゼミ ｜ 第N回」・題・lead・chips・ペンギン）→ `ol.course-band.band-3`（決める／作る／仕上げる。この回の段に `is-here`）→ `.howto`（この回でやること／できたかの確認）→ `.goal` → `.box.box-point`（この回の前に用意しておくもの）→ `nav.toc` → `#map`（この回の地図の図と道順）→ 本文（`section.ep` を `.ep-head` の帯で区切る。節の番号は `.ep-no`）→ `#deliverables` → `#pitfalls`（`.box.box-trouble`）→ `#glossary` → `#guides`（Boarding Pass の演習ボタン `https://quiz-gpassport.vercel.app/s/AIA0N`）→ `footer.footer`（前後の回へのリンク）

### 入門ゼミ追加の部品（lesson.css 末尾）

- 用語の囲み：`<div class="box box-term"><span class="box-title">📗 用語</span><dl><dt>語</dt><dd>説明</dd></dl></div>`
- 補足（色の付かない囲み）：`.box.box-note`
- 手順：`<ol class="steps"><li><p class="step-title">見出し</p><p>本文</p></li></ol>`
- 項目｜内容｜なぜ のカード：`.explain > .explain-item > .explain-term / .explain-value / .explain-why`
- リンクでないカード：`.cards > div.card`（`.card-no`・`.card-title`・`.card-desc`）
- 節の中の小さな目次：`nav.toc-mini`
- 期ごとの開催スケジュール：`details.cohort`（下の「期が増えたとき」）
- 講師紹介：`.instructor`・`.facts`・`details.more`
- 前後の回：`nav.pager`

### 書き方の決まり（`../CLAUDE.md` 2章）

比喩を使わない／「なぜ：」は `<br><span class="why">なぜ：</span>` で行の頭から／各回のページに日付・時刻・期を書かない（期タブの中だけ）／金額を断定しない／アンケート欄を貼らない／ASCII のファイル名。

## 期（5期・6期…）が増えたとき

開催日・時間・入室先は期ごとに違うので、Home の「開催スケジュールと参加方法」は期ごとの `<details class="cohort">` で切り替える（JS は使わない）。

1. `index.html` の `id="cohort-6"` の `<details>` に、5期の `<details>` をコピーして表（回・内容・開催日）と入室先（Google Meet）を入れる。`<summary>` の `<small>準備中</small>` を開催期間に書き換える
2. 次の期（7期）は `<details class="cohort" id="cohort-7">` を1つ足す
3. 最初に開いておく期にだけ `open` を付ける（ほかは外す）
4. 進め方・全7回の流れ・修了要件は期をまたいで同じ前提。期で違うものはこの節の中だけに書く（ヒーローや各回のページに日付や曜日を書かない）

## ページを増やすとき

`lessons/lessonNN/index.html` を、いちばん近い回のページをコピーして作る。`<head>` は次の2行だけ。

```html
<link rel="stylesheet" href="../../assets/lesson.css">
<script src="../../assets/site.js" defer></script>
```

地図の図は `assets/figs/lNN_map.webp`。スクリーンショットは `assets/images/lessonNN/`（講師の環境が写る箇所は薄いグレーの角丸で平らに塗る。ぼかしは使わない）。撮り直したら教材リポジトリ側の `_共通/教材保守/` で `scan.py` → `stamp.py`。

## 回の番号の付け替え（2026-10-04）

第4回に「画面側を作る」を新しく入れ、API 連携の回を `lessons/lesson04/` → `lesson05/`、テストの回を `lessons/lesson05/` → `lesson06/` へ移した。**画像の置き場と名前は変えていない**。`assets/images/lesson04/`（`r4_*`）は第5回（API）のページ、`assets/images/lesson05/`（`r5_*`）は第6回（テスト）のページが使っている。新しい第4回の画像は `assets/images/lesson04-front/`。
