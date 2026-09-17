# designer レビュー: 入力フォームの inline validation

- 観点: designer
- 対象: on-blur、on-submit、realtime、hybrid
- 入力: README、variants/、previews/、docs/evaluation/axes.md
- 担当した軸: visual hierarchy、consistency

## 判定

| 軸               | on-blur                                                                             | on-submit                                                                                     | realtime                                                                                    | hybrid                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| visual hierarchy | 良い: ラベル、入力欄、エラー文の順に視線が移り、競合する要素がない                  | 許容: 要約が最初に目に入るが、赤枠と青枠の二重枠と青い送信ボタンが視線を分散させる            | 許容: 文言が小さく従属は明確だが、成功文と誤り文が同じ大きさと位置に並び、色だけで区別する  | 良い: 要約、エラーの項目、送信ボタンの順に視線が移る。送信ボタンが黒で、要約と競合する色がない |
| consistency      | 良い: Constraints をすべて満たし、他 variant との差は入力欄の枠色とフォーカス色のみ | 課題あり: 送信ボタンが青で他 variant の黒と異なり、無効時の枠線幅も 2px で他 variant と異なる | 課題あり: 完了文が黒の通常字で成功色の制約から外れ、文言サイズも 14px で他 variant と異なる | 良い: Constraints をすべて満たす。入力欄、送信ボタン、完了文の値は on-blur と同じである        |

## 観察

### on-blur

- 初期状態はラベル、入力欄、送信ボタンの順に並ぶ（on-blur-initial.png）。視線の順序が入力の流れと一致する。
- エラー状態は赤 1px の枠線と赤の文言だけで示す（on-blur-error.png）。競合する要素がない（styles.css:36-43）。
- エラー文はラベルと同じ 16px の通常字である（styles.css:40-43）。色だけでラベルより従属に見せる。
- 赤 1px の枠線は細い（on-blur-error.png）。文言がなければ気づきにくい。
- 完了画面は成功色の太字を margin 0 で先頭に置く（styles.css:64-68）。on-submit と同じ見た目になる（on-blur-success.png）。
- 最大幅 24rem、1 列、項目間 1rem を満たす（styles.css:3-13）。system-ui 16px も満たす（styles.css:5）。
- エラー色、成功色、可視フォーカスの制約も満たす（styles.css:36-43、58-68）。
- 入力欄の枠色 #767676 は他 variant と異なる（styles.css:32）。他 variant は #79747e である。preview では判別できない。
- フォーカス色 #0b57d0 は他 variant と異なる（styles.css:58-62）。幅は 2px である。preview には写らない。

### on-submit

- 初期状態のレイアウトは on-blur と同じである（on-submit-initial.png）。
- 送信ボタンは青 #1a73e8 で、他 variant の黒と異なる（styles.css:81）。
- README の Scope は色を共通にすると定める（README.md:38）。主要素の色の違いは比較を乱す。
- エラー状態は要約が先頭に入る（on-submit-error.png）。見出し 1.125rem の太字が最初に視線を集める（styles.css:28-33）。
- 要約は赤 2px の枠にフォーカスの青 3px の枠が重なる（styles.css:16-26）。二重枠が重く見える（on-submit-error.png）。
- フォーカス色と送信ボタンの色が同じ青である（styles.css:24、81）。画面の上下に同じ色の強い要素が並ぶ（on-submit-error.png）。
- 同じ文言が要約と項目直下に 2 回出る（index.tsx:133-135、167-169）。要約は太字下線、項目直下は通常字である。従属関係は分かるが、赤の面積が増える（on-submit-error.png）。
- 無効時の入力欄は枠線が 2px になる（styles.css:64-67）。他 variant の 1px より太い（on-submit-error.png）。枠線幅の変化で入力欄の高さが 2px 変わる。
- 要約の挿入で項目が約 135px 下へ移動する。on-submit-initial.png と on-submit-error.png を比べた。
- 完了画面は成功色の太字である（styles.css:88-92）。on-blur と同じ見た目になる（on-submit-success.png）。
- 角丸 4px は on-blur の 0.25rem と同じである（styles.css:61）。入力欄の枠色 #79747e は realtime と同じである（styles.css:60）。
- 最大幅 24rem、1 列、項目間 1rem を満たす（styles.css:3-13）。system-ui 16px も満たす（styles.css:5-6）。
- エラー色、成功色、可視フォーカスの制約も満たす（styles.css:64-72、88-100）。

### realtime

- 初期状態は on-blur と同じ構成である（realtime-initial.png）。送信ボタンも黒である（styles.css:65-75）。
- 検証後の文言は 0.875rem である（styles.css:47-51）。ラベルと入力欄より小さく、従属が明確（realtime-error.png）。
- 成功文と誤り文は同じ大きさ、太さ、位置に並ぶ（realtime-error.png）。区別は色と ✓ だけである（styles.css:53-63）。
- 読み順で最初に色が付く要素は email の成功文である（realtime-error.png）。直す対象より先に目に入る。
- 文言サイズ 14px は他 variant の 16px と異なる（styles.css:49）。Constraints の system-ui 16px からも外れる（README.md:47）。
- 完了文はクラスがなく、黒の通常字である（index.tsx:121）。既定の margin の分だけ下がって表示される（realtime-success.png）。
- 同じ variant 内で成功の表現が揺れる。項目の成功は緑で、完了は黒である（styles.css:57-59、index.tsx:121）。
- 角丸 0.375rem は他 variant より大きい（styles.css:33、73）。他 variant は 0.25rem である。preview では入力欄の角がわずかに丸い。
- ✓ はフォント依存の文字である（index.tsx:162-164）。環境により形と太さが変わる。
- 送信ボタンに hover 色がある（styles.css:77-79）。他 variant にはない。
- フォーカス色 #005fcc は他 variant と異なる（styles.css:41-45）。preview には写らない。
- 最大幅 24rem、1 列、項目間 1rem を満たす（styles.css:3-19）。エラー色と可視フォーカスも満たす（styles.css:37-45、53-55）。

### hybrid

- 評価後の追加案である（README.md:67）。既存 3 variant の判定は、hybrid との比較でも変えていない。
- 初期状態は on-blur と同じ見た目である（hybrid-initial.png、on-blur-initial.png）。送信ボタンも黒である（styles.css:71-81）。
- エラー状態は要約が先頭に入る（hybrid-error.png）。見出しは 1rem の太字で、ラベルと同じ大きさである（styles.css:22-27）。要約は大きさではなく、枠と赤で際立つ。
- 要約は赤 1px の枠にフォーカスの青 2px のリングが重なる（styles.css:16-20、99-103）。フォーカス時の入力欄と同じ重さである。on-submit の 2px と 3px より軽い（hybrid-error.png、on-submit-error.png）。
- 送信ボタンは黒で、画面内の青はフォーカスリングだけである（styles.css:77、94）。要約と送信ボタンが視線を奪い合わない（hybrid-error.png）。
- 要約のリンクは通常字に下線である（styles.css:34-37）。on-submit の太字と異なる。項目直下の文言との違いは下線だけになる（hybrid-error.png）。
- 同じ文言が要約と項目直下に 2 回出る（index.tsx:171、203）。on-submit と同じく赤の面積が増える。
- 無効時の入力欄は枠色だけが変わり、幅は 1px のままである（styles.css:61-63）。入力欄の高さは変わらない。
- 要約の挿入で項目が約 130px 下へ移動する。hybrid-initial.png と hybrid-error.png を比べた。
- 送信後の blur で要約の件数が変わり、全項目が解消すると要約が消える（index.tsx:103-116、152）。操作中に項目が上下に動く。preview には写らない。
- 完了画面は成功色の太字で、フォーカスリングが付く（index.tsx:140、styles.css:84-88、99-103）。リングは幅 24rem の枠として写る（hybrid-success.png）。他 variant の完了画面にはない（on-blur-success.png）。
- 入力欄の枠色 #767676 とフォーカス色 #0b57d0 は on-blur と同じである（styles.css:57、94）。on-blur の観察にある他 variant との差は、on-submit と realtime との差になる。
- 要約の枠線 1px と角丸 0.25rem は入力欄と同じである（styles.css:18-19、57-58）。画面内で枠の表現が揃う。
- 最大幅 24rem、1 列、項目間 1rem を満たす（styles.css:3-13）。system-ui 16px も満たす（styles.css:5）。
- エラー色、成功色、可視フォーカスの制約も満たす（styles.css:18-37、61-68、84-103）。
- transition と animation はない（styles.css:1）。

## 論点

- Constraints は送信ボタンの色、角丸、枠色、フォーカス色、文言サイズを定めていない。揃える対象に加えるか、今回は許容するかを決める。hybrid は on-blur の値に揃えた。要約の枠線幅、見出しの大きさ、リンクの太さも on-submit と hybrid で異なる。共通仕様にするなら、これらも対象に加える。
- realtime の完了文が未スタイルなのは意図か見落としか。意図なら成功色の制約を見直す。
- フォームに見出しがなく、画面の目的が視覚的に示されない。hybrid にもない（index.tsx:151-213）。4 variant 共通のため判定には含めなかった。Brief に見出しを加えるかを決める。
- on-submit の要約の二重枠を避けるか。hybrid で解消。枠線を 1px、リングを 2px にし、フォーカス時の入力欄と同じ重さになった（hybrid-error.png）。on-submit を直すなら同じ値にする。
- realtime の成功文を誤り文より軽く見せるか。色を薄くする、✓ だけにするなどの案がある。feedback quality と合わせて判断する。
- realtime の成功と誤りの区別は色と ✓ に依存する。色覚の条件での判別は accessibility の担当。
- 完了文のフォーカスリングを出すか。hybrid では幅 24rem の枠として写り、操作できない文言が入力欄のように見える（hybrid-success.png）。出すなら余白と幅を整える。判断は accessibility と合わせて行う。
- on-submit の無効時の枠線幅の変化は hybrid で解消。無効時も 1px のままである（styles.css:61-63）。
- 次の 3 点は interaction / motion の担当である。on-submit と hybrid の要約によるレイアウト移動。hybrid の blur 再検証による要約の伸縮。realtime の文言アニメーション。見た目の共通化に含めるかを決める。
