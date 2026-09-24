# Guideline

個人開発のプロダクト群に共通する UI/UX の指針を、主題ごとに `docs/guidelines/<slug>.md` に書く。
Catalog が build 時に読み、書式が崩れていれば build が落ちる。
雛形は [templates/guideline.md](templates/guideline.md)、見本は [states-and-feedback.md](guidelines/states-and-feedback.md) である。

## frontmatter

```yaml
---
title: <英語の文書名>
summary: <1〜2 文の要約>
status: draft
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

- `title` は Catalog の表示名で英語にする。本文は日本語で書く。
- `status` は `draft` か `adopted`。人間が内容を確認したら `adopted` にし、判断者、判断日、理由を commit message に書く。
- `created` と `updated` は機械検査の対象外なので、更新時に手で直す。

## 本文

`## 目的` → `## コア` → `## Tips` の 3 節だけを、この順で置く。

| 節   | 書くこと                                                    |
| ---- | ----------------------------------------------------------- |
| 目的 | その主題で目指す状態。2〜3 文                               |
| コア | 主題の思想。3〜5 件。並び順は文書内で衝突したときの優先順位 |
| Tips | 具体的な場面の規則。8 件までを目安にする                    |

### コア

`###` の見出しと本文 1〜3 文で書く。
見出しは短い名詞句か短文にする。Tips がこの見出しで引く。
本文は目指す状態を 1 文で書き、実際に衝突する判断があるときだけ「A より B を優先する」を 1 文足す。
主題のすべての場面に当てはまる数値は本文に書いてよい。
箇条書き、具体例、出典は書かない。書きたくなったら Tips へ送る。

### Tips

`###` の見出し、`意図と根拠:` の段、`- key: value` の並びで書く。
`foundation` を先、`module` を後に並べる。

```markdown
### 内容が変わる場所は領域を先に確保する

意図と根拠: 文字数の増減やエラー文の出し入れで寸法が変わると、次の押し先がずれる。

- 適用: foundation
- コア: 操作の途中で押し先を動かさない
- 良い例: エラー文の行を `min-height` で予約する。
- 悪い例: エラー文の要素ごと取り除き、下の送信ボタンをせり上がらせる。
- 例外: 予約した高さを超える長文。切り落とさず伸ばす。
- 実験: [form-inline-validation](https://github.com/salan70/uiux-numa/blob/<commit>/experiments/form-inline-validation/README.md)
```

| 項目          | 必須 | 内容                                                                                        |
| ------------- | ---- | ------------------------------------------------------------------------------------------- |
| 見出し        | 必須 | 規則の内容を行動で示す                                                                      |
| `意図と根拠:` | 必須 | なぜ必要かを 1〜2 文。コアの思想は繰り返さない。行頭に `-` を付けない                       |
| `- 適用:`     | 必須 | `foundation`（共通の土台。外すなら理由を残す）か `module`（重視する場合に選ぶ）             |
| `- コア:`     | 必須 | 関連するコアの見出しと完全一致。複数あれば行を繰り返す                                      |
| `- 良い例:`   | 必須 | 推奨する表現や実装                                                                          |
| `- 悪い例:`   | 必須 | 避けるべき表現や実装                                                                        |
| `- 例外:`     | 任意 | 規則が効かない場面                                                                          |
| `- 実験:`     | 任意 | 出どころへの Markdown リンク 1 つ。Experiment、原則候補、ADR、削除済みなら commit permalink |
| `- 出典:`     | 任意 | 外部文献や WCAG 達成基準への Markdown リンク 1 つ                                           |

値の中で使える記法は `` `code` ``、`[text](url)`、`**強調**` の 3 つだけである。
相対リンクは `docs/guidelines/` を起点に GitHub の blob URL へ送る。

## 機械検査

解析器は `apps/catalog/src/content/guidelines.ts` にある。
`nix develop -c just catalog-test` で解析器の単体テスト、`just catalog-build` で全文書の検証を行う。
落ちる条件は、frontmatter の欠落、3 節以外の H2、コアか Tips が 0 件、Tips の必須項目の欠落、表に無い項目、`コア` の不一致、`実験` と `出典` がリンクでないこと、である。

## 文書を足す手順

1. 雛形を `docs/guidelines/<slug>.md` へ複製し、コアを先に決めてから Tips を書く。
2. `apps/catalog/src/content/guidelines.ts` の `GUIDELINE_ORDER` へ slug を足す。落としても build は通り、一覧の末尾へ並ぶ。
3. [docs/guidelines/README.md](guidelines/README.md) の一覧へ行を足す。
4. `just catalog-test` と `just lint` を通す。
