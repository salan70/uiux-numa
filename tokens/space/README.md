# Space tokens

余白の階梯と、ページの余白の役割である。
正本は `space.tokens.json` とする。
`space.css` は生成物である。

## 採用範囲

primitive は 4px グリッドの階梯で、`space.100` が 4px を表す。

| token        | 値       | px  |
| ------------ | -------- | --- |
| `space.50`   | 0.125rem | 2   |
| `space.100`  | 0.25rem  | 4   |
| `space.150`  | 0.375rem | 6   |
| `space.200`  | 0.5rem   | 8   |
| `space.300`  | 0.75rem  | 12  |
| `space.400`  | 1rem     | 16  |
| `space.500`  | 1.25rem  | 20  |
| `space.600`  | 1.5rem   | 24  |
| `space.1000` | 2.5rem   | 40  |
| `space.2000` | 5rem     | 80  |

- `space.page-inline`: ページ左右の余白。`space.600` を参照する。
- `space.section`: 主要セクションの開始までの縦の間隔。`space.1000` を参照する。

## 追加の規則

- primitive は公開 Catalog に実利用がある値だけを 4px グリッド上に追加する。2px と 6px は細部の補正用である。
- semantic は役割名があるときだけ追加する。
- padding は独立の token にせず、この階梯を参照する。

判断は [階梯の ADR](../../docs/decisions/2026-09-21-token-scale-foundation.md) に残す。

## 生成

```bash
just tokens-build
just tokens-check
```
