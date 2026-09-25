# アイコン

UI アイコンの項目。共通の造形は `skills/crafting-svg/references/foundations.md` にある。
数値はシステムごとに異なる。1 組の中で 1 つの値に統一することが本質である。

- `ICON-01` ラベルを常時表示する: hover で出すラベルは不可。ラベルなしで通じるのは home、print、検索など少数。
- `ICON-02` 形が分かることと意味が分かることを分ける: 比喩は既知の対応（封筒 = メール）を使う。5 秒で思いつかない比喩はアイコン化を諦めてテキストにする。
- `ICON-03` 正面か真横から、細部を削って描く: 遠近、立体、傾きを使わない。
- `ICON-04` グリッドと padding を 1 つ選ぶ: Material 1 は 24 に live area 20、IBM は 32 に padding 2、Octicons は 16 と 24、Lucide と Feather は 24（Lucide は safe zone 1）、Atlassian と Phosphor は 16。
- `ICON-05` 線幅を 1 組で統一する: Material 1 は 2（24）、IBM は 2（32）、Lucide は 2（24）、Octicons は 1.5（16 と 24 で共通）、Atlassian は 1.5（16）。Material 1 は複雑な形でのみ 1.5 を許す。
- `ICON-06` keyline で見かけの大きさを揃える: Material 1 の値は正方形 18、円 20、長方形 20×16。円と正方形の基準アイコンと並べて描画し、明暗の量が揃うまで拡縮する。
- `ICON-07` 端点と角を 1 種類に統一する: root で linecap と linejoin を一括指定し、path 個別の上書きを消す。Material 1、IBM、Atlassian は角張った端点、Octicons と Lucide は丸い端点。
- `ICON-08` 隙間の最小値を守る: Lucide は 2px（2px の円が入るかで検査）、Octicons は修飾要素の周囲 1.5px、Polaris は 1px 未満を不可とする。隙間に基準径の円を置いて重なりを確かめる。
- `ICON-09` 座標をピクセルに整列する: 外縁をピクセル境界に合わせ、1.5px の線は片側だけ整列させる。光学補正の例外は 0.25px 刻み。整列の解き方は `SVG-01`。
- `ICON-10` 塗りは状態に限る: 既定は線、塗りは選択などの状態にだけ使う。塗り版は線版と見かけの重さを揃える。
- `ICON-11` サイズごとに版を用意する: 24px 版を縮めると線幅と隙間が最小値を割る。16px 版は内部の細部を落とす。IBM は 16/20/24/32 で線幅 1/1.25/1.5/2。
