# accessibility レビュー: 入力フォームの inline validation

- 観点: accessibility
- 対象: on-blur、on-submit、realtime、hybrid
- 入力: README、variants/、previews/、docs/evaluation/axes.md
- 担当した軸: accessibility

## 判定

| 軸            | on-blur                                                                                                                                                        | on-submit                                                                                                                                                    | realtime                                                                                                                       | hybrid                                                                                                                                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| accessibility | 許容: `aria-invalid` と `aria-describedby` は正しいが、blur 時のエラーに live region がなく、スクリーンリーダーには送信まで伝わらない。`autoComplete` がない。 | 良い: 送信時に要約へフォーカスを移し、リンクからキーボードで各項目へ移動できる。aria 属性と `autoComplete` が揃う。成功時のフォーカス喪失は 3 variant 共通。 | 許容: 常設の live region で blur 時と入力中の変化が伝わる。ただし送信時のフォーカス移動が描画より先で、`autoComplete` がない。 | 許容: 送信時の要約へのフォーカス移動、リンクからの移動、`autoComplete`、完了文へのフォーカス移動が揃う。ただし送信後の blur 再検証に live region がなく、文言の更新と要約の消失は項目に戻るか再送信まで伝わらない。 |

## 観察

### on-blur

- index.tsx と styles.css は variants/on-blur/ を指す。
- label と input を `htmlFor` と `id` で関連付ける（index.tsx 109-116 行）。
- エラー時だけ `aria-invalid` と `aria-describedby` を付ける（index.tsx 121-122 行）。
- 参照先の `<p>` はエラー時に同時に描画する（index.tsx 126-130 行）。
- blur で出るエラーに live region がない（index.tsx 126-130 行）。
- 離脱直後はフォーカスが次の項目にあるため、スクリーンリーダーにはエラーの出現が伝わらない。
- 項目に戻るか送信するまで、エラーがあることが分からない。
- 送信時は `flushSync` でエラーを先に描画する（index.tsx 82 行）。
- その後に最初の無効な項目へフォーカスを移す（index.tsx 83 行）。
- フォーカス時に label、無効状態、エラー文言が読まれる。
- 成功時はフォームごと差し替える（index.tsx 90-98 行）。
- 内容つきの `role="status"` を新規に挿入する。
- 送信ボタンが消えるため、フォーカスは body に落ちる。
- 内容を持ったまま挿入した live region の読み上げは環境依存で、実機確認が要る。
- `autoComplete` がない（index.tsx 112-125 行）。
- WCAG 1.3.5 の入力目的の特定を満たさない。on-submit との違い。
- `required` と `aria-required` がない（index.tsx 112-125 行）。
- 必須であることはエラーまで伝わらない。3 variant 共通。
- エラーは赤い枠線と文言の両方で示す（on-blur-error.png）。色だけに依存しない。
- エラー文言 #b3261e は白地で 6.54:1（styles.css 40-43 行）。
- 成功文言 #1b6b3a も白地で 6.54:1（styles.css 64-68 行）。
- フォーカスリング #0b57d0 は白地で 6.39:1（styles.css 58-62 行）。
- 入力枠 #767676 は白地で 4.54:1（styles.css 32 行）。
- 文字は AA の 4.5:1、非テキストは 3:1 を満たす。
- フォーカスリングは `:focus-visible` で出す（styles.css 58-62 行）。
- 太さ 2px、offset 2px で、リングは常に白地と接する。
- 動きがなく、reduced motion の対応は不要。

### on-submit

- index.tsx と styles.css は variants/on-submit/ を指す。
- label と input を `htmlFor` と `id` で関連付ける（index.tsx 146-153 行）。
- `autoComplete` を 3 項目すべてに付ける（index.tsx 19-21 行、156 行）。
- 値は email、new-password、nickname で、WCAG 1.3.5 を満たす。
- 3 variant で唯一である。
- 送信時にエラー要約を描画する（index.tsx 119-140 行）。
- `useEffect` で描画後に要約へフォーカスを移す（index.tsx 80-84 行）。
- 要約は `tabIndex={-1}` と `aria-labelledby` を持つ（index.tsx 121-126 行）。
- 名前つきの region として扱われる。
- フォーカス時に「入力内容に 2 件の問題があります」が読まれる。
- `role="alert"` は使わない（index.tsx 120 行）。
- リストの各文言は、フォーカス後に矢印キーで読む。
- 要約に着いた時点でリストまで自動で読まれるかは、実機確認が要る。
- 再送信のたびに `count` を増やす（index.tsx 64-69 行、94 行）。
- 同じエラーでも要約へフォーカスが戻る。
- 要約の各項目は `<a href="#id">` のリンクにしている（index.tsx 133 行）。
- Enter で click が発火し、対象の input にフォーカスが移る（index.tsx 97-101 行）。
- 既定の hash 遷移は止めている。キーボードだけで操作できる。
- 各項目には `aria-invalid` と `aria-describedby` を付ける（index.tsx 163-170 行）。
- エラーは送信時にだけ更新する（index.tsx 64 行、94 行）。
- 修正後も再送信まで `aria-invalid="true"` と要約が残る。
- スクリーンリーダーには、修正済みの項目が無効のまま読まれる。
- 成功時の構造は on-blur と同じ（index.tsx 103-111 行）。
- フォーカスは body に落ちる。
- 要約のフォーカスリングは `:focus` で出す（styles.css 23-26 行）。
- 3px の #1a73e8 で、プログラムでの移動でも出る（on-submit-error.png）。
- #1a73e8 は白地で 4.51:1（styles.css 24 行、81 行、98 行）。
- 送信ボタンの白文字は AA の 4.5:1 をわずかに上回る。
- フォーカスリングは非テキストの 3:1 を満たす。
- 入力枠 #79747e は白地で 4.55:1（styles.css 60 行）。
- エラー時の入力枠は 2px になる（styles.css 64-67 行）。
- 要約は 2px の枠、見出し、文言で示す。色だけに依存しない。
- 動きがなく、reduced motion の対応は不要。

### realtime

- index.tsx と styles.css は variants/realtime/ を指す。
- label と input を `htmlFor` と `id` で関連付ける（index.tsx 137-142 行）。
- `autoComplete` がない（index.tsx 140-151 行）。on-blur と同じ。
- 通知用の live region をフォーム内に常設する（index.tsx 176-178 行）。
- `role="status"` と `aria-live="polite"` を持ち、視覚的に隠す（styles.css 82-93 行）。
- 最初から DOM にあるため、内容の変化が通知される。
- 最初の blur で「ラベル: 文言」を通知する（index.tsx 89-94 行）。
- 次の項目にフォーカスが移っても、polite でエラーの出現が伝わる。on-blur との違い。
- 入力中は文言が変わった時だけ通知する（index.tsx 83-86 行）。
- 同じ文言の連続通知は抑止する（index.tsx 72-77 行）。
- 1 項目の修正で通知は数回に収まる。
- 実際の頻度と typing echo との重なりは、実機確認が要る。
- 送信時は `setTouched` の直後に `focus()` を呼ぶ（index.tsx 100 行、108 行）。
- React 19 では state 更新がハンドラ終了後に反映される。
- 未検証の項目へ移った時点では `aria-invalid` と `aria-describedby` がない。
- on-blur の `flushSync` に相当する処理がない。
- 未検証の項目の文言は live region にまとめて流す（index.tsx 109-115 行）。
- 情報は届くが、フォーカスした項目の読み上げとは分かれる。
- 送信時の通知はフォーカスした項目の文言も含む（index.tsx 108-115 行）。
- 同じ文言が 2 回読まれうる。
- 成功文言の ✓ は `aria-hidden="true"` にする（index.tsx 161-165 行）。
- 文言「問題ありません」があるため、色と記号だけに依存しない。
- 色覚多様性でも、赤と緑を文言と記号で区別できる（realtime-error.png）。
- 成功時の構造は on-blur と同じ（index.tsx 118-124 行）。
- フォーカスは body に落ちる。
- `prefers-reduced-motion: reduce` に対応する（styles.css 107-116 行）。
- transition と animation を無効にする。
- 動きは 150ms の fade と border-color の変化だけである。
- reduced motion でも意味が保たれる。
- 文言は 0.875rem で表示する（styles.css 47-51 行）。
- #b3261e と #1b6b3a は白地で 6.54:1（styles.css 53-59 行）。
- フォーカスリング #005fcc は白地で 5.98:1（styles.css 41-45 行）。
- 入力枠 #79747e は白地で 4.55:1（styles.css 32 行）。
- 成功画面の `<p role="status">` にはクラスがない（index.tsx 121 行）。
- 既定色 #1c1b1f で、コントラストは 17.13:1（realtime-success.png）。

### hybrid

- index.tsx と styles.css は variants/hybrid/ を指す。
- 3 variant の評価後に追加した案で、既存 3 variant の判定は変えていない。
- on-submit の判定にある「3 variant 共通」は hybrid を含まない。
- label と input を `htmlFor` と `id` で関連付ける（index.tsx 183-190 行）。
- `autoComplete` を 3 項目すべてに付ける（index.tsx 19-22 行、193 行）。
- 値は email、new-password、nickname で、on-submit と同じ。
- WCAG 1.3.5 の入力目的の特定を満たす。
- 送信時にエラー要約を描画する（index.tsx 152-177 行）。
- `useEffect` で描画後に要約へフォーカスを移す（index.tsx 85-89 行）。
- 依存は `submitCount` で、blur の再検証ではフォーカスを動かさない（index.tsx 84 行、127 行）。
- 要約は `tabIndex={-1}` と `aria-labelledby` を持つ（index.tsx 154-159 行）。
- 名前つきの region として扱われ、フォーカス時に「入力内容に 2 件の問題があります」が読まれる。
- `role="alert"` は使わない（index.tsx 153 行）。
- 要約に着いた時点でリストまで読まれるかは、on-submit と同じく実機確認が要る。
- 再送信のたびに `submitCount` を増やす（index.tsx 73 行、127 行）。
- 同じエラーでも要約へフォーカスが戻る。
- 要約の各項目は `<a href="#id">` のリンクにしている（index.tsx 166-172 行）。
- Enter で click が発火し、対象の input にフォーカスが移る（index.tsx 130-135 行）。
- 既定の hash 遷移は止めている。キーボードだけで操作できる。
- 各項目には `aria-invalid` と `aria-describedby` をエラー時だけ付ける（index.tsx 198-199 行）。
- 参照先の `<p>` はエラー時に同時に描画する（index.tsx 201-205 行）。
- blur でエラーが消えると、属性と `<p>` を同時に外す（index.tsx 107-115 行）。
- 参照先のない `aria-describedby` は残らない。
- 修正した項目に戻ると無効とは読まれない。on-submit との違い。
- 送信後の blur で再検証し、文言と要約を更新する（index.tsx 103-116 行）。
- この更新に live region がない（index.tsx 152-177 行、201-205 行）。
- blur 直後はフォーカスが次の項目にあり、消えた文言も新しい文言も読まれない。
- 要約の件数の変化も読まれない（index.tsx 160-162 行）。
- 要約が 0 件で消えるときも通知がない（index.tsx 152 行）。
- 解消は項目に戻るか、再送信して要約か完了文を得るまで伝わらない。
- 仮説の「修正の即時確認」は、スクリーンリーダーでは成り立たない。
- on-blur の blur 時の課題と同じ構造で、hybrid では副次的な経路に当たる。
- 送信時に伝わる情報は on-submit と同じで、blur 後の aria 属性は on-submit より正確である。
- 視覚では blur の更新が見えるのに支援技術には伝わらないため、良いではなく許容にした。
- 要約はフォーカス可能なリンクを含み、blur で消えうる（index.tsx 152 行、166-172 行）。
- 最後に残ったエラーがメールアドレスのとき、修正して Shift+Tab すると要約が消える経路がコードから読める。
- 移動先のリンクが消え、フォーカスが body に落ちる可能性がある。実機確認が要る。
- 他の項目からの Shift+Tab は前の input に移るため、この経路はメールアドレスだけである。
- 成功時は完了文に `tabIndex={-1}` を付ける（index.tsx 140-142 行）。
- `useEffect` で描画後に完了文へフォーカスを移す（index.tsx 92-96 行）。
- フォーカスは body に落ちない。他の 3 variant との違い。
- フォーカス時に「登録が完了しました」が読まれる。
- 完了文は `role="status"` も持つ（index.tsx 140 行）。
- 内容つきで挿入した live region の通知とフォーカスの読み上げが重なり、2 回読まれうる。実機確認が要る。
- 完了文のフォーカスリングは `:focus` で出し、プログラムでの移動でも出る（styles.css 99-103 行、hybrid-success.png）。
- `required` と `aria-required` がない（index.tsx 186-200 行）。
- 必須であることはエラーまで伝わらない。4 variant 共通。
- エラーは赤い枠線と文言の両方で示す（hybrid-error.png）。色だけに依存しない。
- 要約は 1px の枠、見出し、下線つきのリンクで示す（styles.css 16-37 行）。色だけに依存しない。
- エラー文言と要約の #b3261e は白地で 6.54:1（styles.css 18 行、26 行、35 行、67 行）。
- 成功文言 #1b6b3a は白地で 6.54:1（styles.css 86 行）。
- フォーカスリング #0b57d0 は白地で 6.39:1（styles.css 94 行、101 行）。
- 入力枠 #767676 は白地で 4.54:1（styles.css 57 行）。
- 送信ボタンの白文字は #1c1b1f 上で 17.13:1（styles.css 76-77 行）。
- 文字は AA の 4.5:1、非テキストは 3:1 を満たす。
- 入力欄、送信ボタン、要約リンクのフォーカスリングは `:focus-visible` で出す（styles.css 91-96 行）。
- 要約のリングは `:focus` で出す（styles.css 99-103 行、hybrid-error.png）。
- 太さ 2px、offset 2px で、on-blur と同じ。
- transition と animation を使わない（styles.css 1 行）。reduced motion の対応は不要。

## 論点

- 成功時のフォーカス: hybrid で解消。完了文に `tabIndex={-1}` を付け、描画後にフォーカスを移す。他の 3 variant はフォームを差し替え、フォーカスが body に落ちたまま。hybrid の方式を共通の設計判断にするかを決めたい。
- 実機確認: VoiceOver + Safari と NVDA + Chrome で確かめたい。対象は成功文言の読み上げ、on-submit と hybrid の要約フォーカス時の読み上げ範囲、realtime の通知頻度。hybrid では完了文の 2 回読みと、要約が消えるときのフォーカス喪失も加える。
- `autoComplete`: on-submit と hybrid が付けている。WCAG 1.3.5 に関わるため、Constraints の共通要件にするかを決めたい。共通にしないと、判定に variant の軸以外の差が混じる。
- 必須の明示: 4 variant とも必須であることはエラーまで伝わらない。全項目必須ならフォーム冒頭で伝える案もある。UX writing の観点にもまたがる。
- on-blur の仮説「必要な時に指摘できる」は、スクリーンリーダーでは送信時まで成り立たない。Target はスクリーンリーダーを含む。on-blur を採用するなら、blur 時の通知を加えるかを決めたい。
- hybrid の仮説「修正の即時確認」は、スクリーンリーダーでは項目に戻るか再送信するまで成り立たない。blur 時の更新を polite な live region で通知するかを決めたい。realtime の常設 live region が参考になる。通知を加えれば、要約の消失と件数の変化も伝えられる。
- hybrid の要約は blur で消えうる。最後に残ったエラーがメールアドレスのとき、Shift+Tab でフォーカスが body に落ちる経路がある。実機で再現すれば、再送信まで要約を残すか、消える前にフォーカスを退避するかを決めたい。
- 担当外: 送信ボタンの色が on-submit だけ #1a73e8 で、他は #1c1b1f。realtime の成功画面は他と違い緑でも太字でもなく、文言は 14px。hybrid の要約は枠 1px とリング 2px の #0b57d0 で、on-submit の枠 2px とリング 3px の #1a73e8 と異なる。見た目は共通の制約なので、designer の観点で確認したい。
- 担当外: on-submit は修正後も再送信まで要約と `aria-invalid` が残る。feedback quality の観点で扱う。hybrid は blur で更新するため、この点は hybrid で解消。
- 担当外: hybrid で要約リンクを押すとき、直前の input の blur で要約が消えると click が届かない可能性がある。interaction / motion の観点で扱う。
