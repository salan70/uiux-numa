# 動きの出発レシピ

上流 `RECIPES.md` を、本リポジトリ向けに写した。
数値と曲線は出発点である。Brief と既存トークンを優先する。
`motion.dev` や Base UI の変数が無ければ、同等の CSS / WAAPI で書く。
新規 npm 依存は Brief が禁じていれば入れない。

曲線の局所値は Skill 本体の `--ease-out`、`--ease-in-out` を使う。

## ボタンの押下

```css
.button {
  transition: transform 160ms var(--ease-out);
}

.button:active {
  transform: scale(0.97);
}
```

`:active` はタッチの押下にも効く。
`:hover` の動きは別途ポインタ条件で囲む。

## ドロップダウン、ポップオーバー

トリガーから生える面は、原点をトリガー側にする。

```css
.popover {
  transform-origin: var(--transform-origin, top center);
  transition:
    opacity 200ms var(--ease-out),
    transform 200ms var(--ease-out);
}

.popover[data-closed] {
  opacity: 0;
  transform: scale(0.95);
}
```

`--transform-origin` が無ければ、開き元に合わせて具体値を書く。

## ツールチップ

同じ形で時間を短くする。
1 つ開いたあとの隣は、遅延と動きを 0 にしてよい。

## モーダル

中央配置なら原点は中央でよい。
背景の透明度も同じ時間で動かす。

## ドロワー

```css
.drawer {
  transform: translateY(0);
  transition: transform 500ms cubic-bezier(0.32, 0.72, 0, 1);
}

.drawer[data-closed] {
  transform: translateY(100%);
}
```

500ms は出発点である。日常的な操作なら短くする候補を残す。

## トースト / 完了の入場

```css
.toast {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 400ms ease,
    transform 400ms ease;

  @starting-style {
    opacity: 0;
    transform: translateY(100%);
  }
}
```

登録完了のように稀なら、400ms と `ease` を候補にしてよい。
連続で積む場合は transition を優先し、中断を確認する。

## アコーディオン

`height` は layout を伴う例外である。短くする。
`auto` へ直接動かさず、測った高さへ動かす。
性能は未計測なら断定しない。

## グループの stagger

項目間隔の出発点は 30–80ms である。
操作を stagger の終了まで待たせない。
毎日見る一覧には使わない。

## 長押し確認

決める相は遅く直線、応答は速く `ease-out` を出発点にする。
`clip-path` は許可された第 4 の属性として使ってよい。

## 交差フェードが割れないとき

状態が二重に見えるときだけ、短い `blur(2px)` を候補にする。
20px を超えるぼかしは高いコストになりやすい。未計測なら断定しない。

## ライブラリ無しの制御

```js
element.animate([{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }], {
  duration: 1000,
  fill: "forwards",
  easing: "cubic-bezier(0.77, 0, 0.175, 1)",
});
```
