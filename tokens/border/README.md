# Border tokens

線の太さである。
正本は `border.tokens.json` とする。
`border.css` は生成物である。

## 採用範囲

- `border.width.thin` は 1px で、罫と枠に使う。
- `border.width.thick` は 2px で、強調の線と focus ring に使う。

semantic は置かない。

線の色と種類は token にしない。色は配色の役割から引く。

判断は [階梯の ADR](../../docs/decisions/2026-09-21-token-scale-foundation.md) に残す。

## 生成

```bash
just tokens-build
just tokens-check
```
