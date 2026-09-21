# 余白、角丸、線の太さを token の階梯にする

- 状態: Accepted
- 日付: 2026-09-21
- 参照: [Catalog ホスト](2026-09-19-catalog-host.md)、[Catalog をデザインシステムサイトにする](2026-09-19-catalog-design-system-site.md)、[topic-first](2026-09-20-catalog-topic-first.md)、[soft-component-kit](2026-09-19-soft-component-kit.md)、[Typography foundation](2026-09-19-typography-foundation.md)
- 対象: `tokens/space/`、`tokens/radius/`、`tokens/border/`、`apps/catalog/src/catalog.css`

## 背景

`tokens/` は typography 16 個と space 2 個だけを持っていた。
余白、角丸、線の太さは `apps/catalog/src/catalog.css` の `--cat-*` と直書きに散っていた。
gap の直書きは 43 件、`1px solid` は 27 件あった。

[Catalog ホストの ADR](2026-09-19-catalog-host.md) は「役割名があり、利用面が 2 つあるなら追加する」と定めた。
この規則で radius と spacing の token 化を 4 回却下している。
公開 Catalog は 1 面と数えるため、値が揃っていても正本へ上がらなかった。

利用者が 2026-09-21 に token の拡充を指示した。
候補は spacing、角丸、padding、size、shadow、グラデーションだった。
利用者は規則の書き換えから始めるよう指示した。

## 決定

### 取り込み規則を改める

[Catalog ホストの ADR](2026-09-19-catalog-host.md) の「token の取り込み規則」を次へ置き換える。

1. 既存 token で表せるなら、それを使う。
2. primitive の階梯は、公開 Catalog に実利用がある値だけを追加する。
3. semantic token は、役割名があるときだけ追加する。
4. 将来用の段は作らない。

「利用面が 2 つ」の条件は外す。
`experiments/` は比較軸を保つため、この token を当てない。

### 追加する家族

| 家族     | primitive | semantic | 正本                               |
| -------- | --------- | -------- | ---------------------------------- |
| `space`  | 階梯      | 2 個     | `tokens/space/space.tokens.json`   |
| `radius` | 3 個      | 3 個     | `tokens/radius/radius.tokens.json` |
| `border` | 2 個      | なし     | `tokens/border/border.tokens.json` |

個数と値の正本は各家族の README と JSON である。

### spacing

4px グリッドの数値 index で名付ける。`space.100` が 4px である。
階梯は `catalog.css` の実測値をそのまま採る。
`space.page-inline` と `space.section` は primitive への参照に変える。生成される値は変わらない。

4px グリッドの根拠は技術的なものである。
1 倍、1.5 倍、2 倍、3 倍の表示密度で端数が出ない。
知覚心理学の根拠ではない。

実測の階梯は比 1.33〜1.5 の緩い等比になっており、大きい値ほど刻みが粗い。
これは Weber–Fechner の法則からの外挿としては妥当である。
ただし余白の弁別閾を測った実証は見つからなかった。

### 角丸

| primitive   | 値       | semantic         | 用途                 |
| ----------- | -------- | ---------------- | -------------------- |
| `radius.xs` | 0.125rem | `radius.mark`    | 帯、印、コード片     |
| `radius.sm` | 0.375rem | `radius.control` | ボタン、入力欄       |
| `radius.md` | 0.625rem | `radius.surface` | 操作部品を内包する面 |

`radius.sm` は現行 Catalog の値を維持する。
隣の段との差は 4px で、`space.100` と一致させる。

親子の角丸は減算式で決める。

> 内半径 = 外半径 − (線の太さ + padding)

角丸は四半円である。
親子の弧が同心になる条件がこの式になり、直線部でも角でも隙間が一定になる。
幾何学的に導出できる規則はこれだけである。
Apple は iOS 26 の `ConcentricRectangle` で同じ式を使う。
CSS 仕様も border の内側半径を同じ減算で求め、負の値を 0 に丸める。

減算式は、子が親の padding box に辺ごと接する場合だけ使う。
親の中で浮いている部品には使わず、階梯の値をそのまま当てる。
区別しないと「面 10px − padding 16px」が 0 になる。

段の差を spacing token に合わせたので、減算の結果はまた radius token に着地する。
追加する段も、隣との差が spacing token になる値に限る。

実行時の `calc` は入れ子の補正だけに使う。
専用の token は作らない。

### 線の太さ

`border.width.thin` は 1px、`border.width.thick` は 2px とする。
`catalog.css` の線は 1px と 2px だけだった。
2px は WCAG 2.2 の Focus Appearance が基準にする太さでもある。
2 個の値が役割と 1 対 1 なので、semantic は置かない。

## 根拠の強さ

確認できた事実は次である。

- 曲線の輪郭は鋭角より好まれやすい（Bar & Neta 2006）。効果の実体は鋭角への忌避に近い（Bertamini ら 2015）。個人差も大きい（Cotter ら 2017）。
- Apple は固定の半径の一覧を公開していない。iOS 26 は capsule と concentric corner を推す。
- Atlassian、Polaris、Primer、Tailwind の階梯は小さい側が 2 / 4 / 6px に集まる。Primer の既定は 6px である。

俗説として退けた主張は次である。

- 「角丸は目に優しい」「認知負荷を下げる」: 査読研究の裏付けを確認できない。
- 「角丸のボタンはクリック率が上がる」: 対照実験が見つからない。
- 「黄金比は美しい」: Fechner の実験の追試（Höge 1997、McManus & Weatherby 1997、Russell 2000）は選好を支持しない。Markowsky 1992 は美術と美学への適用の多くを誤りと整理した。
- 「Apple のロゴは黄金比で作られた」: 事後のこじつけであり、Apple の設計根拠は確認されていない。

特定の半径の値が優れるという根拠はない。
階梯は一貫性と実装の問題として決めた。

## 却下した案

- グラデーション: 公開 Catalog で使用 0 件である。利用者が見送りを判断した。
- shadow: 公開 Catalog で使用 0 件である。popup と drawer の影は局所変数のままにする。
- `radius.full` と 14px 以上の段: Catalog に利用箇所がない。`radius.full` の却下は [radius.full の ADR](2026-09-21-radius-full.md) が置き換えた。
- `corner-shape: squircle`: 6〜12px では円弧との差がほぼ見えない。対応は Chromium 系だけである。
- 半径を高さの比率で決める: 親子を同じ比率にすると角の隙間が不均一になり、減算式と両立しない。相似に見えるという主張に実証はない。
- 黄金比の階梯: 選好の実証がない。φ は 4px グリッドに乗らず、丸め誤差を常に生む。
- フィボナッチ数列の階梯: 3、13、21 が 4px グリッドに乗らない。
- 基準の半径 1 個から `calc` で階梯を導出する（shadcn/ui の方式）: 基準を変えると小さい側が 0 に潰れる。レビューの対象が値ではなく式になる。Catalog は半径の種類が少なく、見合わない。
- spacing の t-shirt 命名: 10 段を `xs`〜`4xl` で表すと順序が読めない。Polaris と Atlassian も数値 index を使う。
- padding と size の独立した家族: padding は space を参照すれば足りる。最小ターゲット `2.5rem` は Catalog だけの値である。
- `experiments/` への適用: 過去の Experiment の見た目が変わり、比較の記録が壊れる。
- 家族ごとに生成スクリプトを複製する: 3 家族とも dimension だけを持ち、処理が同じである。

## 影響

- [Catalog ホストの ADR](2026-09-19-catalog-host.md) の「token の取り込み規則」と「Catalog に残す値」の角丸を置き換える。
- [デザインシステムサイトの ADR](2026-09-19-catalog-design-system-site.md) の「Spacing、Radius、Elevation の token は新設しない」のうち、Spacing と Radius を置き換える。Elevation は据え置く。
- [topic-first の ADR](2026-09-20-catalog-topic-first.md) の「token にしない」値のうち、角丸 `0.375rem` を置き換える。ほかの値は据え置く。
- [soft-component-kit の ADR](2026-09-19-soft-component-kit.md) は変えない。variant の角丸は variant の局所変数のままである。
- `scripts/build-space-tokens.mjs` を `scripts/build-dimension-tokens.mjs` へ改め、3 家族を 1 本で生成する。
- Catalog の Tokens 画面は、参照を持つ token を semantic と表示する。

## 出典

- [Apple: ConcentricRectangle](https://developer.apple.com/documentation/swiftui/concentricrectangle)
- [Cloud Four: The Math Behind Nesting Rounded Corners](https://cloudfour.com/thinks/the-math-behind-nesting-rounded-corners/)
- [MDN: border-radius](https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius)
- [MDN: corner-shape](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/corner-shape)
- [shadcn/ui: Theming](https://ui.shadcn.com/docs/theming)
- [Atlassian Design: Radius](https://atlassian.design/foundations/radius)
- [Shopify Polaris: Border tokens](https://polaris.shopify.com/tokens/border)
- [GitHub Primer: Size primitives](https://primer.style/foundations/primitives/size)
- [W3C: Understanding Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- [Designsystems.com: Space, grids, and layouts](https://www.designsystems.com/space-grids-and-layouts/)
- [Bar & Neta 2006](https://journals.sagepub.com/doi/abs/10.1111/j.1467-9280.2006.01759.x)
- [Bertamini ら 2015](https://www.bertamini.org/lab/Publications/BertaminiPalumboGheorghesGalatsidas2015.pdf)
- [Cotter ら 2017](https://doi.org/10.1177/2041669517693023)
- [Höge 1997](https://journals.sagepub.com/doi/10.2190/UHTQ-CFVD-CAU2-WY1C)
- [McManus & Weatherby 1997](https://journals.sagepub.com/doi/10.2190/WWCR-VWHV-2Y2W-91EE)
- [Russell 2000](https://doi.org/10.1068/p3037)
- [Markowsky 1992](https://www.goldennumber.net/wp-content/uploads/George-Markowsky-Golden-Ratio-Misconceptions-MAA.pdf)
- [Fast Company: Debunking the Myth of Apple's Golden Ratio](https://www.fastcompany.com/1672682/debunking-the-myth-of-apple-s-golden-ratio)
