// 3 案の原本（variants/<id>/source/*.svg）を、共通の骨格から書き出す。
// 骨格は round-soft の値に載せる: 24 viewBox、線幅 1.5、丸い端点、線の中心 3.75..20.25（外形 3..21）、0.75 格子。
// 案ごとに変えるのは 1 軸だけにする。
//   round-line  : 骨格だけ（基準）
//   pop-duo     : 骨格の下に色の面を 1 つ敷く（part-<asset>-accent）。意味は輪郭が担う
//   keycap-tile : キーキャップ型の枠の中へ、骨格を縮めて置く
// 実行: node experiments/cornix-ui-icons/shared/build-icons.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const here = new URL("../", import.meta.url).pathname;

/** 要素の定義。座標は 24 格子の値。 */
const line = (x1, y1, x2, y2) => ({
  t: "line",
  p: [
    [x1, y1],
    [x2, y2],
  ],
});
const poly = (points, closed = false) => ({ t: "poly", p: points, closed });
const circle = (cx, cy, r) => ({ t: "circle", c: [cx, cy], r });
const rect = (x, y, w, h, rx) => ({ t: "rect", x, y, w, h, rx });
const dot = (x, y) => ({ t: "dot", p: [[x, y]] });
/** 円弧。中心、半径、始点と終点の角度（度、時計回りが正、0° は右）。 */
const arc = (cx, cy, r, from, to) => ({ t: "arc", c: [cx, cy], r, from, to });
const path = (d) => ({ t: "path", d });

/** 面のない asset に敷く色の面。外形いっぱいの円（round-soft の輪と同じ r=8.25）。 */
const DISC = circle(12, 12, 8.25);

/**
 * asset の定義。title は読み上げの名前。parts は線画、accent は pop-duo で色を敷く閉じた面。
 * 面を持つ asset は、その面をそのまま accent にする（新しい形を足さない）。
 */
const ASSETS = {
  // 入口: キー割り当て。キーキャップを上から見た形。上へ寄せた皿で「押す面」を示す。
  keymap: {
    title: "キー割り当て",
    parts: { cap: rect(3.75, 3.75, 16.5, 16.5, 3.75), dish: rect(7.5, 6.75, 9, 7.5, 1.5) },
    accent: rect(7.5, 6.75, 9, 7.5, 1.5),
  },
  // 入口: 全体マップ。layer を重ねた形（菱形 1 枚と、その下の 2 段）。
  overview: {
    title: "全体マップ",
    parts: {
      top: poly(
        [
          [12, 3.75],
          [20.25, 7.5],
          [12, 11.25],
          [3.75, 7.5],
        ],
        true,
      ),
      mid: poly([
        [3.75, 12],
        [12, 15.75],
        [20.25, 12],
      ]),
      low: poly([
        [3.75, 16.5],
        [12, 20.25],
        [20.25, 16.5],
      ]),
    },
    accent: poly(
      [
        [12, 3.75],
        [20.25, 7.5],
        [12, 11.25],
        [3.75, 7.5],
      ],
      true,
    ),
  },
  // 入口: 動作定義。2 本のスライダー（Tap Dance、Combo、Settings の値を調整する）。
  behaviors: {
    title: "動作定義",
    parts: {
      "top-a": line(3.75, 7.5, 6.75, 7.5),
      "top-knob": circle(9, 7.5, 2.25),
      "top-b": line(11.25, 7.5, 20.25, 7.5),
      "low-a": line(3.75, 16.5, 12.75, 16.5),
      "low-knob": circle(15, 16.5, 2.25),
      "low-b": line(17.25, 16.5, 20.25, 16.5),
    },
    accent: path(
      "M9 5.25a2.25 2.25 0 1 0 0 4.5a2.25 2.25 0 1 0 0-4.5zM15 14.25a2.25 2.25 0 1 0 0 4.5a2.25 2.25 0 1 0 0-4.5z",
    ),
  },
  // 入口: 検証。盾と確認の印。
  validation: {
    title: "検証",
    parts: {
      shield: path(
        "M12 3.75 19.5 6.75V11.25C19.5 15.75 16.5 18.75 12 20.25 7.5 18.75 4.5 15.75 4.5 11.25V6.75Z",
      ),
      check: poly([
        [8.25, 12],
        [11.25, 15],
        [15.75, 9.75],
      ]),
    },
    accent: path(
      "M12 3.75 19.5 6.75V11.25C19.5 15.75 16.5 18.75 12 20.25 7.5 18.75 4.5 15.75 4.5 11.25V6.75Z",
    ),
  },
  // 入口: 実機と適用。上りと下りの矢印（実機から読む、実機へ書く）。
  device: {
    title: "実機と適用",
    parts: {
      "up-shaft": line(8.25, 20.25, 8.25, 3.75),
      "up-head": poly([
        [4.5, 7.5],
        [8.25, 3.75],
        [12, 7.5],
      ]),
      "down-shaft": line(15.75, 3.75, 15.75, 20.25),
      "down-head": poly([
        [12, 16.5],
        [15.75, 20.25],
        [19.5, 16.5],
      ]),
    },
    accent: DISC,
  },
  // 入口: ファイル。角を折った紙と 2 本の行。
  files: {
    title: "ファイル",
    parts: {
      page: path("M6 3.75H13.5L18 8.25V20.25H6Z"),
      fold: poly([
        [13.5, 3.75],
        [13.5, 8.25],
        [18, 8.25],
      ]),
      "row-a": line(8.25, 12.75, 15.75, 12.75),
      "row-b": line(8.25, 16.5, 13.5, 16.5),
    },
    accent: path("M6 3.75H13.5L18 8.25V20.25H6Z"),
  },
  // 診断: error。輪と ×。盤面のバッジの × と対応させる。
  error: {
    title: "エラー",
    parts: {
      ring: circle(12, 12, 8.25),
      "stroke-a": line(9, 9, 15, 15),
      "stroke-b": line(15, 9, 9, 15),
    },
    accent: circle(12, 12, 8.25),
  },
  // 診断: warning。三角と !。形でも error、info と区別する。
  warning: {
    title: "警告",
    parts: {
      triangle: path("M12 3.75 20.25 19.5H3.75Z"),
      stem: line(12, 9.75, 12, 13.5),
      dot: dot(12, 16.5),
    },
    accent: path("M12 3.75 20.25 19.5H3.75Z"),
  },
  // 診断: information。輪と i（round-soft の detail と同じ座標）。
  info: {
    title: "情報",
    parts: { ring: circle(12, 12, 8.25), dot: dot(12, 7.5), stem: line(12, 11.25, 12, 16.5) },
    accent: circle(12, 12, 8.25),
  },
  // 保存中。4 分の 3 の輪（回して使う）。
  saving: {
    title: "保存中",
    parts: { arc: arc(12, 12, 8.25, -90, 180) },
    accent: DISC,
  },
  // 保存済みと完了。確認の印。
  check: {
    title: "完了",
    parts: {
      mark: poly([
        [4.5, 12.75],
        [9.75, 18],
        [19.5, 6.75],
      ]),
    },
    accent: DISC,
  },
  // パネルを閉じる。×。
  close: {
    title: "閉じる",
    parts: { "stroke-a": line(6, 6, 18, 18), "stroke-b": line(18, 6, 6, 18) },
    accent: DISC,
  },
  // パネルを全画面にする。外へ向かう 2 つの角の矢印。
  expand: {
    title: "全画面で表示",
    parts: {
      "tr-head": poly([
        [13.5, 3.75],
        [20.25, 3.75],
        [20.25, 10.5],
      ]),
      "tr-shaft": line(20.25, 3.75, 14.25, 9.75),
      "bl-head": poly([
        [10.5, 20.25],
        [3.75, 20.25],
        [3.75, 13.5],
      ]),
      "bl-shaft": line(3.75, 20.25, 9.75, 14.25),
    },
    accent: DISC,
  },
  // パネルを元の大きさに戻す。内へ向かう 2 つの角の矢印（expand の対）。
  collapse: {
    title: "元の大きさに戻す",
    parts: {
      "tr-head": poly([
        [14.25, 4.5],
        [14.25, 9.75],
        [19.5, 9.75],
      ]),
      "tr-shaft": line(14.25, 9.75, 20.25, 3.75),
      "bl-head": poly([
        [9.75, 19.5],
        [9.75, 14.25],
        [4.5, 14.25],
      ]),
      "bl-shaft": line(9.75, 14.25, 3.75, 20.25),
    },
    accent: DISC,
  },
  // encoder の右回し。4 分の 3 の弧と、上で右を向く頭。
  "rotate-cw": {
    title: "右回し",
    parts: {
      arc: path("M18.75 13.5A6.75 6.75 0 1 1 12 6.75"),
      head: poly([
        [9, 3.75],
        [12, 6.75],
        [9, 9.75],
      ]),
    },
    accent: circle(12, 13.5, 6.75),
  },
  // encoder の左回し。rotate-cw を x=12 で鏡映した対。
  "rotate-ccw": {
    title: "左回し",
    parts: {
      arc: path("M5.25 13.5A6.75 6.75 0 1 0 12 6.75"),
      head: poly([
        [15, 3.75],
        [12, 6.75],
        [15, 9.75],
      ]),
    },
    accent: circle(12, 13.5, 6.75),
  },
  // 移動（layer を開く、参照元へ移る）。round-soft の arrow-next と同じ座標。
  "arrow-right": {
    title: "移動する",
    parts: {
      shaft: line(3.75, 11.25, 20.25, 11.25),
      head: poly([
        [14.25, 5.25],
        [20.25, 11.25],
        [14.25, 17.25],
      ]),
    },
    accent: DISC,
  },
};

/* ---------- 描画 ---------- */

const fmt = (n) => String(Math.round(n * 1000) / 1000);

/** 中心 (12,12) の周りに s 倍する。keycap-tile だけが使う。 */
function scaled(el, s) {
  if (s === 1) return el;
  const f = ([x, y]) => [12 + (x - 12) * s, 12 + (y - 12) * s];
  switch (el.t) {
    case "line":
    case "poly":
    case "dot":
      return { ...el, p: el.p.map(f) };
    case "circle":
    case "arc":
      return { ...el, c: f(el.c), r: el.r * s };
    case "rect": {
      const [x, y] = f([el.x, el.y]);
      return { ...el, x, y, w: el.w * s, h: el.h * s, rx: el.rx * s };
    }
    case "path":
      // path の座標を一括で縮める。数値の組を (x,y) として扱い、弧の半径・旗は ARC の書式で扱う。
      return { ...el, d: scalePath(el.d, s) };
  }
  return el;
}

function scalePath(d, s) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+/g);
  let out = "";
  let cmd = "";
  let i = 0;
  const num = () => Number(tokens[i++]);
  const P = (x, y, rel) => (rel ? [x * s, y * s] : [12 + (x - 12) * s, 12 + (y - 12) * s]);
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    // M の後に続く座標の組は、暗黙の L（m なら l）として扱う（SVG の path の文法）。
    else if (cmd === "M") cmd = "L";
    else if (cmd === "m") cmd = "l";
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    if (C === "Z") {
      out += cmd;
      continue;
    }
    if (C === "H") {
      const x = num();
      out += `${cmd}${fmt(rel ? x * s : 12 + (x - 12) * s)} `;
    } else if (C === "V") {
      const y = num();
      out += `${cmd}${fmt(rel ? y * s : 12 + (y - 12) * s)} `;
    } else if (C === "A") {
      const rx = num() * s,
        ry = num() * s,
        rot = num(),
        large = num(),
        sweep = num();
      const [x, y] = P(num(), num(), rel);
      out += `${cmd}${fmt(rx)} ${fmt(ry)} ${rot} ${large} ${sweep} ${fmt(x)} ${fmt(y)} `;
    } else {
      const pairs = C === "C" ? 3 : C === "S" || C === "Q" ? 2 : 1;
      out += cmd;
      for (let k = 0; k < pairs; k++) {
        const [x, y] = P(num(), num(), rel);
        out += `${fmt(x)} ${fmt(y)} `;
      }
    }
  }
  return out.trim();
}

function attrs(el) {
  switch (el.t) {
    case "line":
      return [
        "path",
        `d="M${fmt(el.p[0][0])} ${fmt(el.p[0][1])} ${fmt(el.p[1][0])} ${fmt(el.p[1][1])}"`,
      ];
    case "dot":
      return ["path", `d="M${fmt(el.p[0][0])} ${fmt(el.p[0][1])}h0"`];
    case "poly":
      return [
        el.closed ? "polygon" : "polyline",
        `points="${el.p.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(" ")}"`,
      ];
    case "circle":
      return ["circle", `cx="${fmt(el.c[0])}" cy="${fmt(el.c[1])}" r="${fmt(el.r)}"`];
    case "rect":
      return [
        "rect",
        `x="${fmt(el.x)}" y="${fmt(el.y)}" width="${fmt(el.w)}" height="${fmt(el.h)}" rx="${fmt(el.rx)}"`,
      ];
    case "arc": {
      const pt = (deg) => [
        el.c[0] + el.r * Math.cos((deg * Math.PI) / 180),
        el.c[1] + el.r * Math.sin((deg * Math.PI) / 180),
      ];
      const [x1, y1] = pt(el.from);
      const [x2, y2] = pt(el.to);
      const large = Math.abs(el.to - el.from) > 180 ? 1 : 0;
      return [
        "path",
        `d="M${fmt(x1)} ${fmt(y1)}A${fmt(el.r)} ${fmt(el.r)} 0 ${large} 1 ${fmt(x2)} ${fmt(y2)}"`,
      ];
    }
    case "path":
      return ["path", `d="${el.d}"`];
  }
}

const stroke = (asset, role, el) => {
  const [tag, a] = attrs(el);
  return `  <${tag} id="part-${asset}-${role}" ${a} fill="none" stroke="currentColor"/>`;
};

/** キーキャップ型の枠。外形 3..21、角丸は 18 の 1/4（4.5 → 線の中心で 3.75）。 */
const TILE = rect(3.75, 3.75, 16.5, 16.5, 3.75);
/**
 * 枠の内側（線の内縁 4.5..19.5 の 15）へ収めるための縮小率。骨格の外形 18 → 12。
 * 内側の隙間は上下左右 1.5 で、線幅と同じ最小値（ICON-08）。10.5 にした round 1 は 16px で記号が潰れた。
 */
const TILE_SCALE = 12 / 18;

const VARIANTS = {
  "round-line": (name, a) => Object.entries(a.parts).map(([role, el]) => stroke(name, role, el)),
  "pop-duo": (name, a) => {
    const [tag, at] = attrs(a.accent);
    // 色は利用画面の CSS が #part-*-accent へ与える。原本では currentColor の薄い面にして、シートで形を確かめられるようにする。
    return [
      `  <${tag} id="part-${name}-accent" ${at} fill="currentColor" fill-opacity="0.22" stroke="none"/>`,
      ...Object.entries(a.parts).map(([role, el]) => stroke(name, role, el)),
    ];
  },
  "keycap-tile": (name, a) => [
    stroke(name, "tile", TILE),
    ...Object.entries(a.parts).map(([role, el]) => stroke(name, role, scaled(el, TILE_SCALE))),
  ],
};

for (const [variant, render] of Object.entries(VARIANTS)) {
  const dir = `${here}variants/${variant}/source/`;
  mkdirSync(dir, { recursive: true });
  for (const [name, a] of Object.entries(ASSETS)) {
    const body = render(name, a).join("\n");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">\n  <title>${a.title}</title>\n${body}\n</svg>\n`;
    writeFileSync(`${dir}${name}.svg`, svg);
  }
}
console.log(
  `wrote ${Object.keys(ASSETS).length} assets × ${Object.keys(VARIANTS).length} variants`,
);
