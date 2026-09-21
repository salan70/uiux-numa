import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { Card, type CardProps } from "../../card/shared/Card";
import {
  ColorsCover,
  ComponentsCover,
  IconsCover,
  TokensCover,
  TypographyCover,
} from "../../card/shared/covers";
import { GUIDELINES, ICONS, SCHEMES, type Scheme, type SchemeRoles } from "./content";

// タイルは採用済みの Card で描き、カバーには挿絵を新しく描かずリポジトリの実物を縮小して置く。
// 3 案はこの並びと中身を共有し、並べ方と動きだけを変える。
// Card は 16:9 の枠と 3 行分の文字で高さが決まるので、大きさの差は並べる側が幅で付ける。

type CardLinkProps = ComponentProps<NonNullable<CardProps["linkAs"]>>;

export type TileKind = "color" | "icon" | "type" | "token" | "component" | "guideline";

export type Tile = {
  id: string;
  kind: TileKind;
  title: string;
  href: string;
  /** 題名の下の 1 行。カバーが無いカードでは、枠の中に置く要約になる。 */
  description: string;
  /** 無ければ Card は要約を枠の中に置く。 */
  cover?: ReactNode;
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

// Card の見本は Card そのもの。カバーは飾りとして inert になるので、中のリンクには届かない。
function CardVisual() {
  return (
    <div className="gv-card">
      <Card
        href="/foundations/colors"
        title="Colors"
        meta="Color"
        description="役割ごとに決めた色の組。"
        cover={<ColorsCover />}
      />
    </div>
  );
}

function colorTiles(): Tile[] {
  return SCHEMES.map((scheme) => ({
    id: `color-${scheme.id}`,
    kind: "color",
    title: `${scheme.id}（${scheme.kana}）`,
    href: `/foundations/colors/${scheme.id}`,
    description: `primary は${scheme.primaryName}`,
    cover: <SchemeVisual scheme={scheme} />,
  }));
}

function iconTiles(): Tile[] {
  const set: Tile = {
    id: "icon-set",
    kind: "icon",
    title: "技術分類のアイコン",
    href: "/foundations/icons/class-tech-icons",
    description: `線と角丸で揃えた ${ICONS.length} 個の組`,
    cover: <IconsCover />,
  };
  const singles: Tile[] = ICONS.slice(0, 4).map((icon) => ({
    id: `icon-${icon.name}`,
    kind: "icon",
    title: icon.title,
    href: "/foundations/icons/class-tech-icons",
    description: `${icon.name}.svg`,
    cover: <IconVisual svg={icon.svg} />,
  }));
  return [set, ...singles];
}

function typeTiles(): Tile[] {
  return [
    {
      id: "type-face",
      kind: "type",
      title: "LINE Seed JP",
      href: "/foundations/typography/product-ui-typography",
      description: "和文と欧文を 1 書体で組む",
      cover: <TypographyCover />,
    },
    {
      id: "type-scale",
      kind: "type",
      title: "文字の役割",
      href: "/foundations/typography/product-ui-typography",
      description: "見出しから本文までの大きさ",
      cover: <TypeScaleVisual />,
    },
  ];
}

function tokenTiles(): Tile[] {
  return [
    {
      id: "token-space",
      kind: "token",
      title: "余白の階梯",
      href: "/foundations/tokens",
      description: "4px を基準にした間隔",
      cover: <TokensCover />,
    },
    {
      id: "token-radius",
      kind: "token",
      title: "角丸",
      href: "/foundations/tokens",
      description: "面と操作で使い分ける丸み",
      cover: <RadiusVisual />,
    },
    {
      id: "token-motion",
      kind: "token",
      title: "動きの曲線",
      href: "/foundations/tokens",
      description: "状態と押下の長さと曲線",
      cover: <MotionVisual />,
    },
  ];
}

function componentTiles(): Tile[] {
  return [
    {
      id: "component-button",
      kind: "component",
      title: "Button",
      href: "/components/button",
      description: "操作の役割と状態を同じ形で伝える",
      cover: <ComponentsCover />,
    },
    {
      id: "component-card",
      kind: "component",
      title: "Card",
      href: "/components/card",
      description: "一覧の 1 件を全体で押せる面にする",
      cover: <CardVisual />,
    },
  ];
}

function guidelineTiles(): Tile[] {
  return GUIDELINES.map((guideline) => ({
    id: `guideline-${guideline.slug}`,
    kind: "guideline",
    title: guideline.title,
    href: `/guidelines/${guideline.slug}`,
    description: guideline.summary,
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
 * 流れる帯の複製に置くリンク。読み上げは複製の群ごと aria-hidden で隠し、Tab でも辿らせない。
 * inert にすると hover も押下も届かなくなり、帯の半分が押せない面になるので使わない。
 */
function DecorativeLink({ href, className, children }: CardLinkProps) {
  return (
    <a className={className} href={href} tabIndex={-1}>
      {children}
    </a>
  );
}

/** 1 枚のタイル。採用済みの Card に、種別を補足として渡す。 */
export function TileView({
  tile,
  decorative = false,
  style,
}: {
  tile: Tile;
  /** 読み上げと Tab から外した複製として描く。 */
  decorative?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div className={`gtile gtile--${tile.kind}`} style={style}>
      <Card
        href={tile.href}
        title={tile.title}
        meta={KIND_LABEL[tile.kind]}
        description={tile.description}
        cover={tile.cover}
        linkAs={decorative ? DecorativeLink : undefined}
      />
    </div>
  );
}
