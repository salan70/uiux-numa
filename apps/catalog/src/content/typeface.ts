// 書体の素性（名前、版、ウェイト、配布元、ライセンス）の正本は token の README である。
// 画面へ書き写すと、書体を入れ替えたときに 2 か所を直すことになる。
import typographyReadme from "../../../../tokens/typography/README.md?raw";

/**
 * 書体の名前。正本は tokens/typography/README.md の採用範囲である。
 * 読めなかったときは出さない。README の書き方が変わっても画面は壊れない。
 */
export function typefaceName(): string | undefined {
  return typographyReadme.match(/書体は\s*(.+?)\s*の\s*.+?\s*を使う。/)?.[1];
}
