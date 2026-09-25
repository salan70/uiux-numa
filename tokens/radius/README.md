# Radius tokens

角丸の階梯と役割である。
正本は `radius.tokens.json` とする。
`radius.css` は生成物である。

## 採用範囲

| primitive     | 値       | px   | semantic         | 用途                       |
| ------------- | -------- | ---- | ---------------- | -------------------------- |
| `radius.xs`   | 0.125rem | 2    | `radius.mark`    | 帯、印、コード片           |
| `radius.sm`   | 0.375rem | 6    | `radius.control` | ボタン、入力欄             |
| `radius.md`   | 0.625rem | 10   | `radius.surface` | 操作部品を内包する面       |
| `radius.full` | 9999px   | 9999 | `radius.pill`    | 端を半円にするボタン、chip |

CSS では semantic を使う。

## 使用規則

親子の角丸は減算式で決める。

> 内半径 = 外半径 − (線の太さ + padding)

- 減算式は、子が親の padding box に辺ごと接する場合だけ使う。
- 親の中で浮いている部品には使わず、semantic の値をそのまま当てる。
- 結果が負になる場合は `max(0px, calc(...))` で 0 に丸める。
- 入れ子の補正は CSS の `calc` で書く。専用の token は作らない。

```css
border-radius: max(0px, calc(var(--radius-surface) - var(--border-width-thin) - var(--space-100)));
```

## `radius.full`

`radius.full` は「端を半円にする」形の指定であり、階梯の外にある。

- `50%` は使わない。
- 減算式の対象にしない。内側の子にも `radius.pill` をそのまま当てる。
- ボタンの既定は `radius.control` で、`radius.pill` は部品が明示して選ぶ。

## 追加の規則

- 追加する段は、隣の段との差が space token になる値に限る。
- 公開 Catalog に実利用がある値だけを追加する。
- 半径を高さの比率や黄金比で決めない。

判断と根拠は [階梯の ADR](../../docs/decisions/2026-09-21-token-scale-foundation.md) に残す。

## 生成

```bash
just tokens-build
just tokens-check
```
