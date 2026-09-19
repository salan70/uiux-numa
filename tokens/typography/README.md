# Typography tokens

日本語プロダクト UI の最小 Typography foundation である。
正本は `typography.tokens.json` とする。
`typography.css` は生成物である。

## 採用範囲

書体は LINE Seed JP v20260828 の Regular と Bold を使う。
本文、UI、見出しに必要な 400 と 700 だけを配布する。
Thin と ExtraBold は、2 つ以上の共通用途がないため含めない。

family は 1 個、size は 4 個とする。
weight は 2 個、line-height は 3 個とする。
合計は 10 個である。
semantic token は次の 6 個とする。

- title
- heading
- body
- ui
- control
- caption

合計は 6 個である。

新しい primitive は、複数の semantic token が参照するときだけ追加する。
新しい semantic token は、既存 token で表せない場合だけ検討する。
追加には 2 個以上の利用例を必要とする。
特定コンポーネントだけの値は token にしない。

## 使用規則

- `title` は画面ごとに 1 つだけ使う。
- `heading` は主要セクションの開始に使う。
- `body` は複数行で読む説明に使う。
- `ui` は入力値、一覧、ナビゲーションに使う。
- `control` はボタン、項目名、選択状態に使う。
- `caption` は日時や補足などの二次情報に限る。
- 複数行の本文は `40rem` を fallback とし、対応環境では `40ic` を上限にする。
- 文字を固定高の箱へ閉じ込めない。
- 省略が必要な場合は、完全な内容へ到達できる手段を用意する。

## 生成

```bash
just tokens-build
just tokens-check
```

`tokens-build` は canonical JSON から CSS 変数を生成する。
`tokens-check` は token の構造、参照、生成差分を検査する。

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
利用側は Regular と Bold を preload してよい。
実行基盤では、必要な variant の読込時に取得する。
