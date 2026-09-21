import type { CSSProperties, ReactNode } from "react";
import {
  ColorsCover,
  ComponentsCover,
  IconsCover,
  TokensCover,
  TypographyCover,
} from "../../card/shared/covers";
import { GUIDELINES, ICONS, SCHEMES, type Scheme, type SchemeRoles } from "./content";

// タイルは挿絵を新しく描かず、リポジトリの実物を縮小して置く。
// 3 案はこの並びと中身を共有し、並べ方と動きだけを変える。

export type TileKind = "color" | "icon" | "type" | "token" | "component" | "guideline";

/** 並べ方の目安。s は 1 枠、w は横 2 枠、l は縦横 2 枠。 */
export type TileSize = "s" | "w" | "l";

export type Tile = {
  id: string;
  kind: TileKind;
  size: TileSize;
  title: string;
  href: string;
  visual: ReactNode;
};

const KIND_LABEL: Record<TileKind, string> = {
  color: "Color",
  icon: "Icon",
  type: "Typography",
  token: "Token",
  component: "Component",
  guideline: "Guideline",
};

function schemeStyle(scheme: Scheme): CSSProperties {
  const vars: Record<string, string> = {};
  const set = (mode: "l" | "d", roles: SchemeRoles) => {
    for (const [role, value] of Object.entries(roles)) vars[`--${mode}-${role}`] = value;
  };
  set("l", scheme.light);
  set("d", scheme.dark);
  return vars as CSSProperties;
}

function SchemeVisual({ scheme }: { scheme: Scheme }) {
  return (
    <div className="gv-scheme" style={schemeStyle(scheme)}>
      <span className="gv-scheme__primary">
        <span className="gv-scheme__name">{scheme.primaryName}</span>
      </span>
      <span className="gv-scheme__secondary" />
      <span className="gv-scheme__tertiary" />
      <span className="gv-scheme__container" />
    </div>
  );
}

function IconVisual({ svg }: { svg: string }) {
  return <div className="gv-icon" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function TypeScaleVisual() {
  return (
    <div className="gv-scale">
      <span className="gv-scale__title">見出しの文字</span>
      <span className="gv-scale__heading">節の見出し</span>
      <span className="gv-scale__body">本文は読みやすい行間で組む。</span>
    </div>
  );
}

const RADII = ["--radius-xs", "--radius-sm", "--radius-md", "--radius-full"];

function RadiusVisual() {
  return (
    <div className="gv-radius">
      {RADII.map((radius) => (
        <span key={radius} style={{ borderRadius: `var(${radius})` }} />
      ))}
    </div>
  );
}

function MotionVisual() {
  return (
    <div className="gv-motion">
      <span className="gv-motion__track">
        <span className="gv-motion__dot" />
      </span>
      <span className="gv-motion__label">easing-out</span>
    </div>
  );
}

// Card は親のタイルがリンクを持つので、見本からリンクを外して構造だけを描く。
function CardVisual() {
  return (
    <div className="gv-card">
      <article className="card">
        <div className="card__frame">
          <div className="card__cover">
            <ColorsCover />
          </div>
        </div>
        <div className="card__text">
          <p className="card__title">Colors</p>
        </div>
      </article>
    </div>
  );
}

function GuidelineVisual({ summary }: { summary: string }) {
  return (
    <div className="gv-guideline">
      <p>{summary}</p>
    </div>
  );
}

function colorTiles(): Tile[] {
  return SCHEMES.map((scheme, index) => ({
    id: `color-${scheme.id}`,
    kind: "color",
    // 先頭の採用 2 案だけを大きくし、壁に主役を作る。
    size: index < 2 ? "l" : "s",
    title: `${scheme.id}（${scheme.kana}）`,
    href: `/foundations/colors/${scheme.id}`,
    visual: <SchemeVisual scheme={scheme} />,
  }));
}

function iconTiles(): Tile[] {
  const set: Tile = {
    id: "icon-set",
    kind: "icon",
    size: "w",
    title: "技術分類のアイコン",
    href: "/foundations/icons/class-tech-icons",
    visual: <IconsCover />,
  };
  const singles: Tile[] = ICONS.slice(0, 4).map((icon) => ({
    id: `icon-${icon.name}`,
    kind: "icon",
    size: "s",
    title: icon.title,
    href: "/foundations/icons/class-tech-icons",
    visual: <IconVisual svg={icon.svg} />,
  }));
  return [set, ...singles];
}

function typeTiles(): Tile[] {
  return [
    {
      id: "type-face",
      kind: "type",
      size: "l",
      title: "LINE Seed JP",
      href: "/foundations/typography/product-ui-typography",
      visual: <TypographyCover />,
    },
    {
      id: "type-scale",
      kind: "type",
      size: "w",
      title: "文字の役割",
      href: "/foundations/typography/product-ui-typography",
      visual: <TypeScaleVisual />,
    },
  ];
}

function tokenTiles(): Tile[] {
  return [
    {
      id: "token-space",
      kind: "token",
      size: "w",
      title: "余白の階梯",
      href: "/foundations/tokens",
      visual: <TokensCover />,
    },
    {
      id: "token-radius",
      kind: "token",
      size: "s",
      title: "角丸",
      href: "/foundations/tokens",
      visual: <RadiusVisual />,
    },
    {
      id: "token-motion",
      kind: "token",
      size: "s",
      title: "動きの曲線",
      href: "/foundations/tokens",
      visual: <MotionVisual />,
    },
  ];
}

function componentTiles(): Tile[] {
  return [
    {
      id: "component-button",
      kind: "component",
      size: "w",
      title: "Button",
      href: "/components/button",
      visual: <ComponentsCover />,
    },
    {
      id: "component-card",
      kind: "component",
      size: "s",
      title: "Card",
      href: "/components/card",
      visual: <CardVisual />,
    },
  ];
}

function guidelineTiles(): Tile[] {
  return GUIDELINES.map((guideline) => ({
    id: `guideline-${guideline.slug}`,
    kind: "guideline",
    size: "w",
    title: guideline.title,
    href: `/guidelines/${guideline.slug}`,
    visual: <GuidelineVisual summary={guideline.summary} />,
  }));
}

/**
 * 種別ごとの列から 1 件ずつ順に取り、同じ種別が続かない並びにする。
 * 配色は件数が多いので、並びの先頭と途中に散らばる。
 */
function interleave(groups: Tile[][]): Tile[] {
  const queues = groups.map((group) => [...group]);
  const result: Tile[] = [];
  while (queues.some((queue) => queue.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next) result.push(next);
    }
  }
  return result;
}

export const TILES: Tile[] = interleave([
  colorTiles(),
  typeTiles(),
  iconTiles(),
  guidelineTiles(),
  componentTiles(),
  tokenTiles(),
]);

/** トップから辿る入口。件数はタイルではなく正本の数を出す。 */
export const TOPIC_LINKS = [
  { label: "Colors", href: "/foundations/colors", count: SCHEMES.length },
  { label: "Typography", href: "/foundations/typography", count: 1 },
  { label: "Tokens", href: "/foundations/tokens", count: null },
  { label: "Components", href: "/components", count: null },
  { label: "Icons", href: "/foundations/icons", count: ICONS.length },
  { label: "Guidelines", href: "/guidelines", count: GUIDELINES.length },
];

/**
 * 1 枚のタイル。Card と同じく、題名のリンクの ::after をタイル全面へ広げて全体を押せるようにする。
 * 見本は Button などの操作要素を含むので、リンクの中に入れず、飾りとして aria-hidden と inert にする。
 */
export function TileView({ tile, style }: { tile: Tile; style?: CSSProperties }) {
  return (
    <article className={`gtile gtile--${tile.kind} gtile--${tile.size}`} style={style}>
      <div className="gtile__frame">
        <div className="gtile__visual" aria-hidden="true" inert>
          {tile.visual}
        </div>
        <p className="gtile__caption">
          <a className="gtile__link" href={tile.href}>
            {tile.title}
          </a>
          <span className="gtile__kind">{KIND_LABEL[tile.kind]}</span>
        </p>
      </div>
    </article>
  );
}
