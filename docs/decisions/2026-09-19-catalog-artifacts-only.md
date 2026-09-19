# Catalog を成果物の見本帳へ絞り込む

- 状態: Accepted
- 日付: 2026-09-19
- 参照: [UI/UX 沼の構成と公開先](2026-09-19-uiux-rd-catalog.md)、[Catalog の公開手順](../catalog-publishing.md)、[Experiment の記録形式](../experiment-format.md)

## 背景

公開 Catalog は Experiment、原則、Skill の抜粋と Typography token のコピー欄を中心に構成していた。
配色 14 案と SVG 69 点は専用ページがなく、preview PNG と iframe の中でしか確認できなかった。
Catalog の役割を、実際に作った成果物を比較する見本帳へ絞り込む。

掲載方針の決定は [Catalog を公開デザインシステムサイトにする ADR](2026-09-19-catalog-design-system-site.md) に置き換えた。

## 決定

- ナビゲーションは Colors、Typography、Icons、Graphics、Components の 5 種別で切る。
- 全 variant を同列に掲載し、採用と却下の区別を表示しない。
- Experiment 単位の本文、原則、Skill のページを持たない。
- ルートには 5 種別の抜粋を 1 帯ずつ置く。
- Colors は 14 配色の role ごとの色面と和名を light / dark で並べる。
- Typography は semantic 6 role、primitive 10 個、playground、3 variant の live 表示を持つ。
- Icons と Graphics は `experiments/*/variants/*/dist/*.svg` を inline 展開して表示する。
- Components は Experiment ごとの live iframe を表示する。
- Experiment の分類は `domains` を先頭から見て最初に一致する規則で決める。
- 対応する domain がない Experiment は build を失敗させる。
- README の Variants 表にある variant が実装にない場合は build を失敗させる。
- preview PNG は Catalog の収集対象から外すが、`experiments/*/previews/` に残す。
- サイトの配色は `scheme` の選択、localStorage、`sumi` の順で決める。
- 色の値は解析済みの scheme から `--color-*` として適用する。
- テーマは既存の `data-theme` の解決結果で light / dark を選ぶ。
- 旧 URL は redirect せず NotFound を表示する。

## 理由

成果物の種別で分けると、同じ種類の案を横断して見比べられる。
全 variant を並べると、Catalog が採用判断を再解釈せず、実装資産の全体を示せる。
判断の経緯は Experiment と ADR に残し、Catalog の画面から分離する。
配色と SVG を専用ページへ出すと、見本の存在と比較軸が画面上で明確になる。
解析済みの値をサイトへ適用すると、Experiment の CSS セレクタと Catalog 本体のテーマが混ざらない。

## 却下した案

- Experiment 単位の Catalog を維持する案: 同じ種別の成果物を横断して比較できず、配色と SVG が埋もれるため却下した。
- 採用案だけを掲載する案: Catalog が判断結果だけを再掲し、却下案を含む成果物の見本帳にならないため却下した。
- PNG サムネイルを維持する案: 画像の撮影状態に依存し、SVG と live 表示の実体を直接確認できないため却下した。
- Catalog 独自のパレットを残す案: 選択した scheme の値と画面の表示が分かれ、配色の比較にならないため却下した。
- 原則と Skill を種別として残す案: 成果物の種別ではなく判断履歴と制作手順を掲載することになり、役割が広がるため却下した。

## 影響

Catalog の主な URL は `/`、`/colors`、`/typography`、`/icons`、`/graphics`、`/components` になる。
live variant の確認には `/preview/:experiment/:v` を引き続き使う。
Catalog のテストは token 16、配色 14、SVG 69、live variant 41 と種別割り当てを検査する。
公開後の画面確認では、配色の保持、テーマの切り替え、SVG グリッド、iframe の variant と表示幅を確認する。
