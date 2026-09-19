# Space tokens

ページ左右の余白と、主要セクションの間隔である。
正本は `space.tokens.json` とする。
`space.css` は生成物である。

## 採用範囲

- `space.page-inline` はページ左右の余白である。
- `space.section` は主要セクションの開始までの縦の間隔である。
- 合計は 2 個である。

新しい token は、役割名があり利用面が 2 つあるときだけ追加する。
判断は [Catalog ホストの ADR](../../docs/decisions/2026-09-19-catalog-host.md) に残す。

## 生成

```bash
just tokens-build
just tokens-check
```
