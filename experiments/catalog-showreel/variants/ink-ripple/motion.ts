// 時刻から値を引く道具。リールは t だけで全フレームが決まる純関数にするので、状態を持つ tween は使わない。

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** 区間 [a, b] での進み具合。区間の外では 0 か 1 に張り付く。 */
export const prog = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/** 区間の中だけ 1 を返す。場面の出し入れに使う。 */
export const within = (t: number, a: number, b: number) => t >= a && t < b;

export const outExpo = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
export const inExpo = (p: number) => (p <= 0 ? 0 : Math.pow(2, 10 * p - 10));
export const inOutExpo = (p: number) =>
  p <= 0
    ? 0
    : p >= 1
      ? 1
      : p < 0.5
        ? Math.pow(2, 20 * p - 10) / 2
        : (2 - Math.pow(2, -20 * p + 10)) / 2;
export const outCubic = (p: number) => 1 - (1 - p) ** 3;
export const inCubic = (p: number) => p ** 3;
export const inOutCubic = (p: number) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2);
export const outQuad = (p: number) => 1 - (1 - p) ** 2;
export const inQuad = (p: number) => p * p;
export const outBack = (p: number, s = 1.70158) => 1 + (s + 1) * (p - 1) ** 3 + s * (p - 1) ** 2;

/** CSS の cubic-bezier と同じ曲線。x から t をニュートン法で解き、y を返す。 */
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sx = (s: number) => ((ax * s + bx) * s + cx) * s;
  const sy = (s: number) => ((ay * s + by) * s + cy) * s;
  const dx = (s: number) => (3 * ax * s + 2 * bx) * s + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let s = x;
    for (let i = 0; i < 8; i++) {
      const d = dx(s);
      if (Math.abs(d) < 1e-6) break;
      s -= (sx(s) - x) / d;
    }
    // ニュートン法が外れたときだけ二分法で詰める。
    if (s < 0 || s > 1 || Math.abs(sx(s) - x) > 1e-4) {
      let lo = 0;
      let hi = 1;
      s = x;
      for (let i = 0; i < 24; i++) {
        if (sx(s) < x) lo = s;
        else hi = s;
        s = (lo + hi) / 2;
      }
    }
    return sy(s);
  };
}

/**
 * 減衰振動するばねの解析解。elapsed は開始からの秒数。0 から 1 へ行き過ぎて戻る。
 * zeta は減衰比（1 未満で行き過ぎる）、freq は 1 秒あたりの振動数。
 */
export function spring(elapsed: number, zeta = 0.45, freq = 2.2) {
  if (elapsed <= 0) return 0;
  const omega = 2 * Math.PI * freq;
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  const decay = Math.exp(-zeta * omega * elapsed);
  return 1 - decay * (Math.cos(wd * elapsed) + ((zeta * omega) / wd) * Math.sin(wd * elapsed));
}

/** 同じ入力に同じ値を返す疑似乱数。フレームを書き出しても再生と同じ絵になる。 */
export function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
