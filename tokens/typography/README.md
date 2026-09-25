# Typography tokens

日本語プロダクト UI の最小 Typography foundation である。
正本は `typography.tokens.json` とする。
`typography.css` は生成物である。

## 採用範囲

書体は LINE Seed JP v20260828 の Regular (400) と Bold (700) だけを配布する。
semantic token は `title`、`heading`、`body`、`ui`、`control`、`caption` の 6 個である。

- 新しい primitive は複数の semantic token が参照するときだけ追加する。
- 新しい semantic token は既存 token で表せず、利用例が 2 個以上あるときだけ追加する。
- 特定コンポーネントだけの値は token にしない。

## 使用規則

- `title` は画面ごとに 1 つだけ使う。
- `heading` は主要セクションの開始に使う。
- `body` は複数行で読む説明に使う。
- `ui` は入力値、一覧、ナビゲーションに使う。
- `control` はボタン、項目名、選択状態に使う。
- `caption` は日時や補足などの二次情報に限る。
- 複数行の本文は `40rem` を fallback とし、対応環境では `40ic` を上限にする。
  節の見出しや罫が桁いっぱいに引かれている面では、本文も桁の幅に従わせ、上限を重ねない。1 行の字数を実測して記録する（[ADR](../../docs/decisions/2026-09-21-measure-cap-follows-the-column.md)）。
- 文字を固定高の箱へ閉じ込めない。
- 省略する場合は完全な内容へ到達できる手段を用意する。

## 生成

```bash
just tokens-build
just tokens-check
```

## Font

- 配布元: <https://github.com/line/seed/releases/tag/v20260828>
- release asset: `seed-v20260828.zip`
- license: SIL Open Font License 1.1
- copyright: LY Corporation

| file                       | SHA-256                                                            |
| -------------------------- | ------------------------------------------------------------------ |
| `seed-v20260828.zip`       | `58dee0e2b140c3b3d4769b34059fa7150aee7d3c8326358bd87c0879ef98a5b7` |
| `LINESeedJP-Regular.woff2` | `f091a95d2bdbc7a3a9bab67b70f9ba0582b864b05d29756f8e26fa5b5b4aab55` |
| `LINESeedJP-Bold.woff2`    | `d9e9a3c01a7f818e398e9ec8bb57f8525c4be8e18b51ec2e341b4a733adeae20` |

font file は実行時 CDN から取得しない。
