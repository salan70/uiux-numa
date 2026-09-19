# 日本語プロダクト UI の Typography 評価

## 結論

`line-seed-minimal` を採用する。
6 role と 2 weight でモック内の情報階層を表現できる。

## 比較

| 観点         | `current-system`             | `line-seed-direct`             | `line-seed-minimal`              |
| ------------ | ---------------------------- | ------------------------------ | -------------------------------- |
| 書体の再現性 | OS の system font に依存する | LINE Seed JP で固定できる      | LINE Seed JP で固定できる        |
| ウェイト     | 400 / 600 / 700              | 600 に対応する実ファイルがない | 400 / 700 と実ファイルが一致する |
| 階層         | 個別値で成立する             | 個別値を引き継ぐ               | 6 role で説明できる              |
| token 数     | なし                         | なし                           | primitive 10、semantic 6         |
| 再利用       | 値と意図を移せない           | 書体以外の意図を移せない       | role と意図を一緒に移せる        |

## Accessibility

- 390px で横方向のページスクロールを発生させない。
- 200% の文字拡大で内容と操作を失わない。
- WCAG 1.4.12 の 4 種類の spacing を上書きしても切断しない。
- caption は補助情報だけに使い、操作に必要な文を置かない。
- 省略表示を使わず、長いメールアドレスとラベルを折り返せる。

## Implementation

- canonical JSON は DTCG の typography composite を使う。
- CSS は生成し、正本との手動二重管理を避ける。
- `font-synthesis-weight: none` で合成ウェイトを使わない。
- font file は同梱し、実行時 CDN に依存しない。
