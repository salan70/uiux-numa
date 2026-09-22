// 配布用 SVG の最適化設定。`just svg-optimize` が --config で読む。
// preset-default を基にし、部分編集と利用画面での inline 展開に必要な情報だけを守る。
export default {
  multipass: true,
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          // part-* は部分編集の単位。利用画面の CSS からも参照するため残す。
          // minify を止めるのは、複数の SVG を同じ HTML に inline したとき短縮 ID（a、b…）が衝突するため。
          cleanupIds: { minify: false, preservePrefixes: ["part-"] },
          // 既定は role="img" を消す。支援技術向けの role と title は配布用でも残す。
          removeUnknownsAndDefaults: { keepRoleAttr: true },
          // 零長の subpath は「無用」と見なされて path ごと消える。
          // 丸い端点で打つ点（`M x y h0`）はこの形でしか描けず、塗り要素を足さない条件（ICON-10）を満たす唯一の手段である。
          // 消さずに `z` へ畳ませる。閉じた path の末尾に `Z` が 1 バイト増えるが、形は変わらない。
          convertPathData: { removeUseless: false },
        },
      },
    },
  ],
};
