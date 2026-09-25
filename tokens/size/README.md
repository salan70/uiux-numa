# Size tokens

操作部品の高さ、最小幅、最小ターゲットである。
正本は `size.tokens.json` とする。
`size.css` は生成物である。

## 採用範囲

| token                       | 値     | px  | 用途                         |
| --------------------------- | ------ | --- | ---------------------------- |
| `size.control-height.sm`    | 2rem   | 32  | 操作部品の高さ。小           |
| `size.control-height.md`    | 2.5rem | 40  | 操作部品の高さ。既定         |
| `size.control-height.lg`    | 3rem   | 48  | 操作部品の高さ。大           |
| `size.control-min-width.sm` | 4.5rem | 72  | 操作部品の最小幅。小         |
| `size.control-min-width.md` | 6rem   | 96  | 操作部品の最小幅。既定       |
| `size.control-min-width.lg` | 7.5rem | 120 | 操作部品の最小幅。大         |
| `size.target-min`           | 1.5rem | 24  | ポインタで押す対象の最小の辺 |

primitive と semantic を分けない。

## 使用規則

- 高さは `min-height` に当てる。上下の padding で高さを作らない。
- 左右の余白は space token から引く。size には padding を持たせない。
- 文字だけのボタンなど面を持たない操作部品にも `size.target-min` を当てる。
- Catalog の `--cat-tap` は `size.control-height.md` を参照する。

## 追加の規則

- 公開 Catalog に実利用がある値だけを追加する。
- 部品ごとの寸法は作らない。複数の操作部品で共有できる役割だけを置く。

判断と根拠は [寸法と動きの ADR](../../docs/decisions/2026-09-21-size-and-motion-tokens.md) に残す。

## 生成

```bash
just tokens-build
just tokens-check
```
