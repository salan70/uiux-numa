# implementation レビュー: 入力フォームの inline validation

- 観点: implementation
- 対象: on-blur、on-submit、realtime
- 入力: README、evaluation.md、variants/、previews/、platforms/web/src/App.tsx、docs/evaluation/axes.md、docs/evaluation/review.md、docs/experiment-format.md
- 担当した軸: maintainability
- 検証: platforms/web で `tsc --noEmit` を実行した。3 variant とも型エラーはない。開発サーバーは起動していない。

## 判定

| 軸              | on-blur                                                                                                                              | on-submit                                                                                                                     | realtime                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| maintainability | 良い: 項目定義の配列、純粋な検証関数、3 つの state に責務が分かれる。特殊な API は `flushSync` の 1 か所だけで、理由がコメントにある | 許容: 構造は追えるが、要約リンクの挙動が実行基盤の hash 選択に依存する。`submission.count` の役割がコメントの説明と一致しない | 許容: エラーを state に持たず描画時に導出する点は良い。一方で項目定義が 7 つの定数に分散し、live region の文言の組み立てが 3 つのハンドラーに重複する |

## 観察

### on-blur

- 項目定義を 1 つの配列にまとめる（on-blur/index.tsx 19-23 行）。配列は順序、ラベル、type を持つ。描画と検証の順序もこの配列に従う（75-78 行、103 行）。
- `validateField` は引数だけに依存する純粋関数で、単体テストしやすい（28-49 行）。
- state は values、errors、submitted の 3 つである（52-54 行）。useEffect と useMemo を使わない。
- 送信時は `flushSync` でエラー文言を描画してからフォーカスを移す（2 行、81-83 行）。
- `flushSync` は React の escape hatch である。使用は 1 か所に閉じ、理由がコメントにある（81 行）。
- 追加の import は `react-dom` の `flushSync` だけである（2 行）。npm 依存は増えていない。
- id は描画内のテンプレート文字列で作り、参照は同じスコープに閉じる（104-105 行）。
- 空白だけの入力は `trim` で未入力とみなす（30 行）。
- 一方で password の長さと表示名の文字数は trim 前の値で数える（38 行、46 行）。末尾の空白の扱いが暗黙になる。
- 表示名の文字数はコードポイント単位で数え、他の 2 variant と異なる（46 行）。
- 項目を 1 つ増やすには 4 か所を変える。fields、initialValues、validateField、inputRefs である（19-23 行、25 行、28-49 行、55-59 行）。
- styles.css は 68 行である。レイアウト規則は他 variant と重複する（on-blur/styles.css 3-62 行）。

### on-submit

- id の生成を 2 つの関数に集約する（on-submit/index.tsx 24-28 行）。`inputId` と `errorId` である。要約リンクの href と input の id を同じ関数から作る（133 行、153 行）。
- `validate` はフォーム全体の値を受け取る純粋関数で、単体テストしやすい（33-60 行）。
- 要約へのフォーカス移動は useEffect で描画後に行う（79-84 行）。`flushSync` は使わない。
- コメントは `submission.count` の理由を再送信時のフォーカス復帰と説明する（65 行）。
- `setSubmission` は毎回新しいオブジェクトを作る（94 行）。そのため count がなくても effect は再実行される（80-84 行）。
- count の実際の役割は初回描画の除外だけで、コメントの説明と一致しない（81 行）。
- 要約リンクは `href="#..."` を持つ（133 行）。クリック時は `preventDefault` で hash 遷移を止める（97-101 行）。
- 理由は実行基盤が hash で variant を選ぶためである（platforms/web/src/App.tsx 29-32 行）。実プロジェクトでは不要な判断になる。
- 唯一 `autoComplete` を持つ（14 行、19-21 行、156 行）。
- email と表示名は `trim` 後に検証する（36 行、52 行）。password は trim しない（43 行）。
- 表示名の長さは trim 後の値を UTF-16 単位で数える（55 行）。
- 項目を 1 つ増やすには 4 か所を変える。FIELDS、INITIAL_VALUES、validate、inputRefs である（18-22 行、30 行、33-60 行、73-77 行）。
- styles.css は 100 行である。フォームは grid で組む（on-submit/styles.css 10-13 行）。他の 2 variant は flex column で、同じ見た目を別の手段で実装する。

### realtime

- エラーは state に持たない（realtime/index.tsx 132-134 行）。touched と values から描画時に導出する。状態の二重管理がない。
- 項目のメタ情報は 4 つの定数に分かれる（8-45 行）。FIELD_ORDER、LABELS、INPUT_TYPES、VALIDATORS である。
- 初期値も 3 つの定数に分かれる（50-52 行）。INITIAL_VALUES、UNTOUCHED、ALL_TOUCHED である。
- 項目の追加は inputRefs を含む 8 か所に及ぶ（8-52 行、66-70 行）。`Record<FieldName, ...>` 型が漏れを検出するため、影響は型検査で追える。
- live region の通知文は「ラベル: 文言」の形にする。この組み立てが 3 つのハンドラーに重複する（86 行、93 行、112 行）。
- 送信時は `setTouched` の反映前に `focus()` を呼ぶ（100 行、108 行）。フォーカス時点では `aria-describedby` が未設定である。
- その穴を live region への通知で補う（109-115 行）。フォーカスの順序と通知が暗黙に依存し合う。
- `announce` は同じ文言の連続通知を ref で抑止する（65 行、73-77 行）。React の state 更新の bail-out と役割が重なる。
- 文言の `<p>` に `key={message}` を与える（153-159 行）。切り替え時に要素を作り直し、アニメーションを再生する。意図はコメントにあるが、表示の都合で DOM を作り直す。
- `useRef` をオブジェクトリテラルの中で 3 回呼ぶ（66-70 行）。hooks の順序は固定で問題ないが、他の variant の書き方と異なる。
- 検証で `trim` を使わず、空白だけの表示名が有効になる（41-42 行）。
- 成功画面の `<p role="status">` にクラスがない（121 行）。styles.css に成功色の規則もない。preview realtime-success.png では文言が黒で表示される。他の 2 variant の preview では緑で表示される。
- styles.css は 116 行である。transition、animation、hover、reduced-motion を持つ（realtime/styles.css 34 行、50 行、77-79 行、95-116 行）。他の 2 variant にない動きを追加する。
- 文言のサイズは 0.875rem である（realtime/styles.css 49 行）。他の 2 variant は 16px のままである。

## 論点

- 検証規則が variant 間で一致しない。README の Constraints は「検証規則は全 variant で同じにする」と定める。
  - 空白だけの入力の扱いが 3 通りある。on-blur は全項目を trim する。on-submit は email と表示名だけ trim する。realtime は trim しない。
  - 表示名の文字数の数え方が異なる。on-blur はコードポイント、他の 2 variant は UTF-16 単位で数える。
  - 例: 絵文字 20 個の表示名は on-blur だけ有効になる。空白 3 文字の表示名は realtime だけ有効になる。
  - 比較の前提として規則を揃えるか、差を記録して許容するかを判断する。
- 「描画してからフォーカスを移す」問題を 3 variant が別の手段で解く。
  - on-blur は `flushSync` を使う。on-submit は useEffect を使う。realtime は描画前に focus し、live region で補う。
  - 実プロジェクトへ持ち込むときの標準の書き方を決める。
  - realtime のフォーカス直後の読み上げは accessibility 観点で確認する。
- 共有コードを作らない制約により、レイアウト CSS が 3 回複製され、既にずれている。
  - 入力枠の色は #767676 と #79747e に分かれる。フォーカス色は 3 種ある。送信ボタンの色は #1c1b1f と #1a73e8 に分かれる。
  - 無効時の枠の太さは 1px と 2px に分かれる。角丸は 0.25rem、4px、0.375rem の 3 通りある。文言のサイズは 16px と 0.875rem に分かれる。
  - README が固定する項目は、realtime の成功色を除き 3 variant とも守る。
  - 未指定の項目まで揃えるかは designer 観点の判断になる。
- realtime の成功表示に成功色 #1b6b3a が付かない。Constraints からの逸脱として記録するか、修正して preview を撮り直すかを決める。
- realtime だけ transition、animation、hover を持つ。README の「見た目は共通」に motion を含めるかを決める。
- on-submit だけ `autoComplete` を持つ。フォーム属性の差を比較に含めるかを決める。
- on-submit の要約リンクは実行基盤の hash 選択を避けるため `preventDefault` する。
  - 実プロジェクトでは hash 遷移を許すか、button にするかを決める。
  - 実行基盤側で variant 内の hash 遷移を許容する設計も選択肢になる。
- 成功時の `<p role="status">` は 3 variant とも新規にマウントされる。live region は事前に DOM に存在しないと読み上げられない場合がある。accessibility 観点で確認する。
- `flushSync` は React が多用を推奨しない API である。実プロジェクトの規約によっては on-blur の判定が変わる。
