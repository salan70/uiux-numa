// 原本（variants/<id>/source/*.svg）を、共通の骨格から書き出す。
// 骨格は round-soft の値に載せる: 24 viewBox、線幅 1.5、丸い端点、線の中心 3.75..20.25（外形 3..21）、0.75 格子。
// すべての案で、キーキャップ型の枠の中へ骨格を縮めて置く。案ごとに変えるのは枠の形だけにする。
//   keycap-tile     : 角丸の正方形（基準）
//   keycap-squircle : 超楕円。角丸の正方形と 45° の点を揃え、角の曲率だけをなめらかにする
//   keycap-taper    : 超楕円の天面を上へ向かって細くする（キーを正面から見た台形）
//   keycap-lip      : 超楕円の下に、短い縁を 1 本添える（キーの手前の縁）
// round 1〜2 の round-line と pop-duo、round 3 の skirt・dish・shadow は、利用者の判断で削除した。
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

/**
 * asset の定義。title は読み上げの名前。parts は骨格の線画。
 * tile は、枠の中に置く形。骨格が囲い（輪、三角、盾、紙、キー）を持つ asset だけが持ち、囲いを外した記号にする。
 */
const ASSETS = {
  // 入口: キー割り当て。キーキャップを上から見た形。上へ寄せた皿で「押す面」を示す。
  keymap: {
    title: "キー割り当て",
    parts: { cap: rect(3.75, 3.75, 16.5, 16.5, 3.75), dish: rect(7.5, 6.75, 9, 7.5, 1.5) },
    // 枠がすでにキーキャップなので、中は刻印の A にする。
    // 横棒は y=14.25。脚の x は 6 + 6 × 6/16.5 = 8.18 → 格子 8.25（右は 15.75）。
    tile: {
      legend: poly([
        [6, 20.25],
        [12, 3.75],
        [18, 20.25],
      ]),
      bar: line(8.25, 14.25, 15.75, 14.25),
    },
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
    // 枠の中では盾が囲いになるので、確認の印が付いた 2 行の一覧にする。
    // check（保存済み）と区別するため、行の線を添える。
    tile: {
      "check-a": poly([
        [3.75, 7.5],
        [6, 9.75],
        [9.75, 5.25],
      ]),
      "row-a": line(13.5, 7.5, 20.25, 7.5),
      "check-b": poly([
        [3.75, 16.5],
        [6, 18.75],
        [9.75, 14.25],
      ]),
      "row-b": line(13.5, 16.5, 20.25, 16.5),
    },
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
    // 枠の中では紙が囲いになるので、上の開いた受け皿へ入る矢印にする（.vil の読込と書出）。
    tile: {
      tray: poly([
        [3.75, 14.25],
        [3.75, 20.25],
        [20.25, 20.25],
        [20.25, 14.25],
      ]),
      shaft: line(12, 3.75, 12, 15),
      head: poly([
        [7.5, 10.5],
        [12, 15],
        [16.5, 10.5],
      ]),
    },
  },
  // 診断: error。輪と ×。盤面のバッジの × と対応させる。
  error: {
    title: "エラー",
    parts: {
      ring: circle(12, 12, 8.25),
      "stroke-a": line(9, 9, 15, 15),
      "stroke-b": line(15, 9, 9, 15),
    },
    // 枠の中は小文字の err。× にすると close と同じ形になるので、文字で区別する（round 3、利用者の案）。
    // 文字は縮めると字間が線幅に食われるので、枠の中の座標で直接描く（tileRaw、round 4）。
    // x-height 7.5（y 8.25..15.75）。縦線は 16px で画素に載る x=11.25、15.75（0.75 + 1.5n）。
    // e は幅 3.75（中心 x 7.5、半径 1.875 × 3.75）。r の肩は 45° の斜線にして、16px でも r の向きを残す（round 4 の比較）。
    tileRaw: {
      e: path("M5.625 12H9.375A1.875 3.75 0 1 0 8.625 14.625"),
      "r-a": path("M11.25 15.75V8.25M11.25 10.5 13.5 8.25"),
      "r-b": path("M15.75 15.75V8.25M15.75 10.5 18 8.25"),
    },
  },
  // 診断: warning。三角と !。形でも error、info と区別する。
  warning: {
    title: "警告",
    parts: {
      triangle: path("M12 3.75 20.25 19.5H3.75Z"),
      stem: line(12, 9.75, 12, 13.5),
      dot: dot(12, 16.5),
    },
    // 枠の中は ! だけ。棒と点の隙間は 5.25（縮めた後に 3.5 で、線幅 1.5 以上）。
    tile: { stem: line(12, 3.75, 12, 14.25), dot: dot(12, 19.5) },
  },
  // 診断: information。輪と i（round-soft の detail と同じ座標）。
  info: {
    title: "情報",
    parts: { ring: circle(12, 12, 8.25), dot: dot(12, 7.5), stem: line(12, 11.25, 12, 16.5) },
    // 枠の中は i だけ。warning の ! を上下に反転した配置にして、2 つを対にする。
    tile: { dot: dot(12, 4.5), stem: line(12, 9.75, 12, 20.25) },
  },
  // 保存中。4 分の 3 の輪（回して使う）。
  saving: {
    title: "保存中",
    parts: { arc: arc(12, 12, 8.25, -90, 180) },
    // 枠の中では輪が囲いになり、回すと枠ごと回る。止まった 3 つの点（進行中の印）にする。
    tile: { "dot-a": dot(5.25, 12), "dot-b": dot(12, 12), "dot-c": dot(18.75, 12) },
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
  },
  // パネルを閉じる。×。
  close: {
    title: "閉じる",
    parts: { "stroke-a": line(6, 6, 18, 18), "stroke-b": line(18, 6, 6, 18) },
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
  },
  // encoder の右回し。4 分の 3 の弧と、上で右を向く頭。
  "rotate-cw": {
    title: "右回し",
    parts: {
      arc: path("M18.75 13.5A6.75 6.75 0 1 1 12 6.75"),
      // 頭の深さは 2.25（線幅 × 1.5）。round 1 の深さ 3 は、弧の曲がりと重なって 16px で鉤に見えた。
      head: poly([
        [9.75, 4.5],
        [12, 6.75],
        [9.75, 9],
      ]),
    },
  },
  // encoder の左回し。rotate-cw を x=12 で鏡映した対。
  "rotate-ccw": {
    title: "左回し",
    parts: {
      arc: path("M5.25 13.5A6.75 6.75 0 1 0 12 6.75"),
      head: poly([
        [14.25, 4.5],
        [12, 6.75],
        [14.25, 9],
      ]),
    },
  },
  // 移動（layer を開く、参照元へ移る）。
  // round-soft の arrow-next は画素に揃えるため軸を y=11.25 へ下げたが、語の隣と枠の中では上に浮いて見えた。
  // 軸を対称軸 y=12 に戻し、頭の深さを 5.25 に詰める（頭の高さ 10.5）。
  "arrow-right": {
    title: "移動する",
    parts: {
      shaft: line(3.75, 12, 20.25, 12),
      head: poly([
        [15, 6.75],
        [20.25, 12],
        [15, 17.25],
      ]),
    },
  },
};

/* ---------- 描画 ---------- */

const fmt = (n) => String(Math.round(n * 1000) / 1000);

/** (12,12) を中心とした骨格を、s 倍して中心 (cx,cy) へ移す。 */
function scaled(el, s, cx, cy) {
  const f = ([x, y]) => [cx + (x - 12) * s, cy + (y - 12) * s];
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
      return { ...el, d: scalePath(el.d, s, cx, cy) };
  }
  return el;
}

/** path の座標を縮めて移す。弧の半径は s 倍し、旗はそのまま残す。 */
function scalePath(d, s, cx, cy) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+/g);
  let out = "";
  let cmd = "";
  let i = 0;
  const num = () => Number(tokens[i++]);
  const X = (x, rel) => (rel ? x * s : cx + (x - 12) * s);
  const Y = (y, rel) => (rel ? y * s : cy + (y - 12) * s);
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
      out += `${cmd}${fmt(X(num(), rel))} `;
    } else if (C === "V") {
      out += `${cmd}${fmt(Y(num(), rel))} `;
    } else if (C === "A") {
      const rx = num() * s;
      const ry = num() * s;
      const rot = num();
      const large = num();
      const sweep = num();
      const x = X(num(), rel);
      const y = Y(num(), rel);
      out += `${cmd}${fmt(rx)} ${fmt(ry)} ${rot} ${large} ${sweep} ${fmt(x)} ${fmt(y)} `;
    } else {
      const pairs = C === "C" ? 3 : C === "S" || C === "Q" ? 2 : 1;
      out += cmd;
      for (let k = 0; k < pairs; k++) {
        const x = X(num(), rel);
        const y = Y(num(), rel);
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

/**
 * 超楕円 |x/a|^n + |y/b|^n = 1 を折れ線で描く（96 分割）。
 * taper は天面を細くする割合。上端で幅が (1 - taper) 倍になり、下端で 1 倍になるよう、y に比例して縮める。
 */
function superellipse(cx, cy, a, b, n, taper = 0) {
  const points = [];
  for (let k = 0; k < 96; k++) {
    const t = (k / 96) * 2 * Math.PI;
    const c = Math.cos(t);
    const sn = Math.sin(t);
    const x = a * Math.sign(c) * Math.abs(c) ** (2 / n);
    const y = b * Math.sign(sn) * Math.abs(sn) ** (2 / n);
    const scale = 1 - taper * ((b - y) / (2 * b));
    points.push(`${fmt(cx + x * scale)} ${fmt(cy + y)}`);
  }
  return path(`M${points.join("L")}Z`);
}

/**
 * 超楕円の指数。基準の角丸（半幅 8.25、角丸 3.75）と、45° の点を一致させる。
 * 角丸の 45° の点は 4.5 + 3.75/√2 = 7.152。超楕円では 8.25 × 2^(-1/n)。
 * 両者を等しくすると n = ln 2 / ln(8.25 / 7.152) ≈ 4.85。
 */
const N = Math.LN2 / Math.log(8.25 / (4.5 + 3.75 / Math.SQRT2));
/** 天面と底の幅の比 φ^(-1/4) ≈ 0.886。キーの天面が底より細い（正面から見た台形）ことを、わずかに示す。 */
const PHI = (1 + Math.sqrt(5)) / 2;
const TAPER = 1 - PHI ** -0.25;

/**
 * キーキャップ型の枠。案ごとに、枠の線と、中の記号を置く場所（中心と縮小率）を持つ。
 * 縮小率は、記号の外形 18 × s に線幅 1.5 を足した大きさが、天面の内側に隙間 1.5 を残して収まるように決める（ICON-08）。
 */
const FRAMES = {
  // 角丸の正方形。外形 3..21、角丸 3.75（線の中心）。記号は 18 → 12、内縁 4.5..19.5 との隙間は 1.5。
  "keycap-tile": {
    parts: { tile: rect(3.75, 3.75, 16.5, 16.5, 3.75) },
    cx: 12,
    cy: 12,
    s: 2 / 3,
  },
  // 超楕円（n ≈ 4.85）。外形と 45° の点は基準と同じで、角の曲率がなめらかにつながる。
  "keycap-squircle": {
    parts: { tile: superellipse(12, 12, 8.25, 8.25, N) },
    cx: 12,
    cy: 12,
    s: 2 / 3,
  },
  // 超楕円の上端を φ^(-1/4) 倍に細くする。上の角が内へ寄るぶん、記号を 18 → 11.25（s=5/8）にして角の隙間を保つ。
  "keycap-taper": {
    parts: { tile: superellipse(12, 12, 8.25, 8.25, N, TAPER) },
    cx: 12,
    cy: 12.375,
    s: 5 / 8,
  },
  // 超楕円の天面（高さ 15、y 3.75..18.75）の下に、手前の縁を 1 本添える。
  // 縁の長さは天面の幅 16.5 ÷ φ = 10.2 → 格子 10.5（x 6.75..17.25）、y=20.25。記号は天面の内側 13.5 に合わせて 18 → 10.5（s=7/12）。
  "keycap-lip": {
    parts: {
      tile: superellipse(12, 11.25, 8.25, 7.5, N),
      lip: line(6.75, 20.25, 17.25, 20.25),
    },
    cx: 12,
    cy: 11.25,
    s: 7 / 12,
  },
};

// 枠の中に囲いを重ねない。囲いを持つ asset は、囲いを外した tile の形を使う（round 2）。
const VARIANTS = Object.fromEntries(
  Object.entries(FRAMES).map(([id, frame]) => [
    id,
    (name, a) => [
      ...Object.entries(frame.parts).map(([role, el]) => stroke(name, `frame-${role}`, el)),
      ...Object.entries(a.tile ?? a.parts)
        .filter(() => !a.tileRaw)
        .map(([role, el]) => stroke(name, role, scaled(el, frame.s, frame.cx, frame.cy))),
      // tileRaw は枠の中の座標で描いた形。縮めずに、枠の中心へ移すだけにする。
      ...Object.entries(a.tileRaw ?? {}).map(([role, el]) =>
        stroke(name, role, scaled(el, 1, frame.cx, frame.cy)),
      ),
    ],
  ]),
);

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
