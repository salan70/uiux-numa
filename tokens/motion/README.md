# Motion tokens

状態変化の時間と曲線である。
正本は `motion.tokens.json` とする。
`motion.css` は生成物である。

## 採用範囲

| primitive         | 値                               | semantic         | 用途                       |
| ----------------- | -------------------------------- | ---------------- | -------------------------- |
| `duration.120`    | 120ms                            | `duration.state` | 色、面、線で示す状態変化   |
| `duration.160`    | 160ms                            | `duration.press` | hover と押下で部品が動く間 |
| `easing.standard` | cubic-bezier(0.25, 0.1, 0.25, 1) |                  | 状態変化の既定。`ease`     |
| `easing.out`      | cubic-bezier(0, 0, 0.58, 1)      |                  | 動き出しの曲線。`ease-out` |

合計は 6 個である。
CSS では時間に semantic を使う。曲線は 2 個が用途と 1 対 1 なので semantic を置かない。

## 使用規則

- 色、面、線の変化は `duration.state` と `easing.standard` で書く。
- 位置と大きさが動く変化は `duration.press` と `easing.out` で書く。
- `prefers-reduced-motion` では移動を止める。token の値は変えず、部品側で時間を 0 にするか `transform` を外す。
- spinner の回転のような周期は状態変化の時間ではないので、token にしない。

## 追加の規則

- 公開 Catalog に実利用がある値だけを追加する。
- 値が近い段(140ms など)は足さず、既存の段へ寄せる。

判断と根拠は [寸法と動きの ADR](../../docs/decisions/2026-09-21-size-and-motion-tokens.md) に残す。

## 生成

```bash
just tokens-build
just tokens-check
```
