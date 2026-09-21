# implementation レビュー: 入力フォームの inline validation

- 観点: implementation
- 対象: on-blur、on-submit、realtime、hybrid
- 入力: README、evaluation.md、variants/、previews/、platforms/web/src/App.tsx、docs/evaluation/axes.md、docs/evaluation/review.md、docs/experiment-format.md
- 担当した軸: maintainability
- 検証: platforms/web で `tsc --noEmit` を実行した。hybrid の追記時に `pnpm check` で再実行した。4 variant とも型エラーはない。開発サーバーは起動していない。

## 判定

| 軸              | on-blur                                                                                                                              | on-submit                                                                                                                     | realtime                                                                                                                                              | hybrid                                                                                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| maintainability | 良い: 項目定義の配列、純粋な検証関数、3 つの state に責務が分かれる。特殊な API は `flushSync` の 1 か所だけで、理由がコメントにある | 許容: 構造は追えるが、要約リンクの挙動が実行基盤の hash 選択に依存する。`submission.count` の役割がコメントの説明と一致しない | 許容: エラーを state に持たず描画時に導出する点は良い。一方で項目定義が 7 つの定数に分散し、live region の文言の組み立てが 3 つのハンドラーに重複する | 許容: 項目定義と純粋な検証関数を送信と blur で共有し、要約と文言を同じ errors から導出する。一方で要約リンクは on-submit と同じく実行基盤の hash 選択に依存する。`submitCount` が blur 検証の開始とフォーカス移動の 2 役を持つ |

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

### hybrid

- 項目定義を 1 つの配列にまとめる（hybrid/index.tsx 19-23 行）。配列は `autoComplete` も持つ（15 行）。
- 検証は 2 つの純粋関数に分ける。`validateField` は 1 項目を検証する（34-56 行）。
- `validateAll` は FIELDS の順に全項目を検証する（59-66 行）。
- blur は `validateField` を呼ぶ（106 行）。送信は `validateAll` を呼ぶ（120 行）。規則の定義は 1 か所に閉じ、単体テストしやすい。
- state は 4 つある（69-74 行）。values、errors、submitCount、succeeded である。
- 入力中は values だけ、blur では errors だけを更新する（98-116 行）。送信は errors と submitCount を更新する（126-127 行）。成功時は succeeded だけを更新する（123 行）。
- 要約と各項目の文言は、同じ errors から描画時に導出する（147 行、180 行）。
- blur で要約と文言が同時に更新され、片方だけ古くなる経路がない。on-submit の導出を保ち、errors の更新経路に blur を足した形である。
- `submitCount` は 2 つの役割を持つ。blur 検証の開始条件と、要約へのフォーカスの契機である（105 行、85-89 行）。
- 2 つの役割はコメントに書かれる（71-72 行）。
- effect の依存は数値の `submitCount` である（89 行）。同じエラーで再送信しても値が増え、effect が再実行される。
- 回数で持つ理由のコメントは、実際の役割と一致する（72 行）。on-submit で観察したコメントとの不一致はない。
- フォーカス移動は 2 つの useEffect で行う（85-96 行）。要約と完了文への移動は、どちらも描画後の DOM を必要とする。
- `flushSync` を使わず、`react-dom` も import しない（1-2 行）。
- 完了文は ref と `tabIndex={-1}` を持つ（77 行、140 行）。描画後に effect でフォーカスを受ける（92-96 行）。
- 暗黙の連鎖が 1 つある。入力欄で Enter を押して送信すると、effect が要約へフォーカスを移す（87 行）。
- その際に入力欄の blur が起き、同じ項目を再検証する（103-116 行）。結果は `validateAll` と同じで、再描画が 1 回増えるだけである。
- 要約リンクは `preventDefault` で hash 遷移を止める（130-135 行）。on-submit と同じ実装である。
- 理由は実行基盤の hash による variant 選択である（131 行）。実行基盤の該当箇所は platforms/web/src/App.tsx 29-32 行である。
- コメントは Enter キーでも click が発火する点を補う（132 行）。
- 検証規則は Brief の Constraints を満たす（34-56 行）。
- email は trim 後に空と `@` を確かめる（37-39 行）。password は trim せず、理由をコメントに書く（43-44 行）。
- 表示名は trim で未入力を判定し、長さはコードポイント単位で数える（51-53 行）。
- 一方で表示名の長さは trim 前の値で数え、その理由はコメントにない（53 行）。on-blur と同じ暗黙の扱いである。
- 有効と無効の判定は、3 項目とも on-blur と一致する。エラー文言は on-submit と同一で、空白だけの入力に出す文言も一致する。
- コメントは「検証規則は全 variant で共通」と書く（33 行）。実際は表示名の判定が on-submit、realtime と異なる。
- 例: 絵文字 20 個の表示名は hybrid で有効になる。on-submit と realtime では無効になる。
- 例: 20 文字の表示名の末尾に空白を足す。hybrid で無効、on-submit で有効になる。
- hybrid は規則を 1 つに決めて明示したが、既存 3 variant は変えていない。4 variant 間の不一致は残る。
- 項目を増やすには 4 か所を変える（19-23 行、31 行、34-56 行、78-82 行）。
- 型で漏れを検出できるのは INITIAL_VALUES と inputRefs だけである。FIELDS と validateField の switch は、漏れても型エラーにならない。
- この 2 点は、同じ形の型を一時ファイルに写して tsc で確かめた。on-blur も同じ構造である。
- 追加の npm 依存はない。import は react の hooks と型、styles.css だけである（1-2 行）。
- id は `fiv-hybrid` の接頭辞で作り、他 variant と衝突しない（26-29 行）。コードは variants/hybrid/ 内で完結する。
- 要約と `focusField` は on-submit とほぼ同じコードである（130-176 行）。共有コードを作らない制約により、同じ実装の複製が 1 つ増えた。
- hybrid/styles.css は 103 行である。共通の規則は on-blur と値まで一致する（3-13 行、40-96 行）。
- on-blur にない規則は要約と `:focus` である（16-37 行、99-103 行）。値は on-blur に揃える（18-19 行、101 行）。
- 枠線は 1px、角丸は 0.25rem、フォーカスリングは 2px の #0b57d0 である。
- on-submit の要約と値が異なる（on-submit/styles.css 18-42 行）。
- transition と animation は使わない。方針は冒頭のコメントにある（1 行）。

## 論点

- 検証規則が variant 間で一致しない。README の Constraints は「検証規則は全 variant で同じにする」と定める。
  - 空白だけの入力の扱いが 3 通りある。on-blur は全項目を trim する。on-submit は email と表示名だけ trim する。realtime は trim しない。
  - 表示名の文字数の数え方が異なる。on-blur と hybrid はコードポイントで数える。on-submit と realtime は UTF-16 単位で数える。
  - 例: 絵文字 20 個の表示名は on-blur と hybrid だけ有効になる。空白 3 文字の表示名は realtime だけ有効になる。
  - hybrid では解消していない。hybrid は空白の扱いを on-submit に、文字数の数え方を on-blur に合わせた。
  - hybrid の選択はコメントで明示される。該当は hybrid/index.tsx 43 行と 52 行である。
  - 比較の前提として規則を揃えるか、差を記録して許容するかを判断する。揃える場合は、空白と文字数の単位を Brief に書き足すかも決める。
- 「描画してからフォーカスを移す」問題を 3 variant が別の手段で解く。
  - on-blur は `flushSync` を使う。on-submit は useEffect を使う。realtime は描画前に focus し、live region で補う。
  - hybrid は on-submit と同じ useEffect を使う。完了文へのフォーカスにも同じ手段を使う（hybrid/index.tsx 85-96 行）。
  - 実プロジェクトへ持ち込むときの標準の書き方を決める。
  - realtime のフォーカス直後の読み上げは accessibility 観点で確認する。
- 共有コードを作らない制約により、レイアウト CSS が 4 回複製され、既にずれている。
  - 入力枠の色は #767676 と #79747e に分かれる。フォーカス色は 3 種ある。送信ボタンの色は #1c1b1f と #1a73e8 に分かれる。
  - 無効時の枠の太さは 1px と 2px に分かれる。角丸は 0.25rem、4px、0.375rem の 3 通りある。文言のサイズは 16px と 0.875rem に分かれる。
  - hybrid は on-blur の値を写し、新しい値を加えていない。
  - 一方で要約の見た目は on-submit と異なる。枠線とリンクの太さ、見出しのサイズ、フォーカスリングである。
  - README が固定する項目は、realtime の成功色を除き 4 variant とも守る。
  - 未指定の項目まで揃えるかは designer 観点の判断になる。
- realtime の成功表示に成功色 #1b6b3a が付かない。Constraints からの逸脱として記録するか、修正して preview を撮り直すかを決める。
- realtime だけ transition、animation、hover を持つ。README の「見た目は共通」に motion を含めるかを決める。
- on-submit と hybrid だけ `autoComplete` を持つ。フォーム属性の差を比較に含めるかを決める。
- on-submit と hybrid の要約リンクは `preventDefault` する。実行基盤の hash 選択を避けるためである。
  - 実プロジェクトでは hash 遷移を許すか、button にするかを決める。
  - 実行基盤側で variant 内の hash 遷移を許容する設計も選択肢になる。
- 成功時の `<p role="status">` は 4 variant とも新規にマウントされる。live region は事前に DOM に存在しないと読み上げられない場合がある。accessibility 観点で確認する。
  - hybrid で解消: 完了文へフォーカスを移し、読み上げが live region に依存しない。該当は hybrid/index.tsx 92-96 行と 140 行である。
  - hybrid はフォーカスと `role="status"` を併用する。二重の読み上げの有無は accessibility 観点で確認する。
- `flushSync` は React が多用を推奨しない API である。実プロジェクトの規約によっては on-blur の判定が変わる。
- hybrid では最初の送信後、blur で要約と文言の行が増減する。該当は hybrid/index.tsx 107-115 行と 152-205 行である。
  - 送信ボタンや要約リンクを押すと、mousedown で入力欄の blur が起きる。
  - mouseup の前に要素の位置がずれ、クリックが外れる経路がコードから読める。
  - 最後のエラーを解消すると要約ごと消えるため、ずれが最も大きい。
  - on-blur も blur で文言が増減するが、ずれは文言 1 行分である。
  - 担当外の軸のため判定しない。interaction / motion 観点で実操作を確認する。
- hybrid は blur で要約の件数と文言を更新するが、live region を持たない。
  - 該当は hybrid/index.tsx 153-162 行と 201-205 行である。
  - 変化が支援技術に伝わるかは accessibility 観点で確認する。
