import type { CSSProperties, ReactNode } from "react";
import { TokensCover, TypographyCover } from "../../../../experiments/card/shared/covers";
import { adoptedSchemes, catalog, svgsFor, worksInTopic } from "./collect";
import { CATALOG_COMPONENTS } from "./components";
import { ALL_GUIDELINES } from "./guidelines";
import type { ColorScheme, SchemeColor } from "./schemes";

// トップの流れる帯に並べるカード。中身は正本から読み、挿絵は新しく描かない。
// 判断は apps/catalog/README.md に残す。

export type GalleryKind = "color" | "icon" | "type" | "token" | "component" | "guideline";

export type GalleryTile = {
  id: string;
  kind: GalleryKind;
  title: string;
  /** 題名の下の 1 行。カバーが無いカードでは、枠の中に置く要約になる。 */
  description: string;
  /** 無ければ Card は要約を枠の中に置く。 */
  cover?: ReactNode;
};

export const GALLERY_KIND_LABEL: Record<GalleryKind, string> = {
  color: "Color",
  icon: "Icon",
  type: "Typography",
  token: "Token",
  component: "Component",
  guideline: "Guideline",
};

// 配色のカバーに使う役割。primary を大きく、secondary と tertiary を脇に、container を下の帯に置く。
const SCHEME_ROLES = ["primary", "on-primary", "secondary", "tertiary", "primary-container"];

function roleValue(colors: SchemeColor[], role: string): string {
  const color = colors.find((item) => item.cssName === `--color-${role}`);
  if (!color) throw new Error(`配色に ${role} が無い`);
  return color.value;
}

/** 配色ごとの値をカードの変数へ渡す。明暗の切り替えは catalog.css が行う。 */
function schemeStyle(scheme: ColorScheme): CSSProperties {
  const vars: Record<string, string> = {};
  for (const role of SCHEME_ROLES) {
    vars[`--light-${role}`] = roleValue(scheme.light, role);
    vars[`--dark-${role}`] = roleValue(scheme.dark, role);
  }
  return vars as CSSProperties;
}

function primaryName(scheme: ColorScheme): string {
  return scheme.light.find((item) => item.cssName === "--color-primary")?.name ?? "";
}

function SchemeCover({ scheme }: { scheme: ColorScheme }) {
  return (
    <div className="cover-scheme" style={schemeStyle(scheme)}>
      <span className="cover-scheme__primary">{primaryName(scheme)}</span>
      <span className="cover-scheme__secondary" />
      <span className="cover-scheme__tertiary" />
      <span className="cover-scheme__container" />
    </div>
  );
}

function IconCover({ svg }: { svg: string }) {
  return <div className="cover-icon" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function TypeScaleCover() {
  return (
    <div className="cover-scale">
      <span className="cover-scale__title">見出しの文字</span>
      <span className="cover-scale__heading">節の見出し</span>
      <span className="cover-scale__body">本文は読みやすい行間で組む。</span>
    </div>
  );
}

const RADII = ["--radius-xs", "--radius-sm", "--radius-md", "--radius-full"];

function RadiusCover() {
  return (
    <div className="cover-radius">
      {RADII.map((radius) => (
        <span key={radius} style={{ borderRadius: `var(${radius})` }} />
      ))}
    </div>
  );
}

export function MotionCover() {
  return (
    <div className="cover-motion">
      <span className="cover-motion__track">
        <span className="cover-motion__dot" />
      </span>
      <span className="cover-motion__label">easing-out</span>
    </div>
  );
}

function colorTiles(): GalleryTile[] {
  return adoptedSchemes().map((scheme) => ({
    id: `color-${scheme.id}`,
    kind: "color",
    title: `${scheme.id}（${scheme.label}）`,
    description: `primary は${primaryName(scheme)}`,
    cover: <SchemeCover scheme={scheme} />,
  }));
}

/** 採用 variant を持つアイコンの組だけを並べる。判断待ちの組は載せない。 */
function iconTiles(): GalleryTile[] {
  return worksInTopic("icons").flatMap((work) => {
    const variant = work.adopted[0];
    if (!variant) return [];
    return svgsFor(work.slug, variant).map((asset) => ({
      id: `icon-${work.slug}-${asset.name}`,
      kind: "icon" as const,
      title: asset.source.match(/<title>(.+?)<\/title>/)?.[1] ?? asset.name,
      description: `${asset.name}.svg`,
      cover: <IconCover svg={asset.source} />,
    }));
  });
}

function typeTiles(): GalleryTile[] {
  return worksInTopic("typography").flatMap((work) => [
    {
      id: `type-face-${work.slug}`,
      kind: "type" as const,
      title: "LINE Seed JP",
      description: "和文と欧文を 1 書体で組む",
      cover: <TypographyCover />,
    },
    {
      id: `type-scale-${work.slug}`,
      kind: "type" as const,
      title: "文字の役割",
      description: "見出しから本文までの大きさ",
      cover: <TypeScaleCover />,
    },
  ]);
}

function tokenTiles(): GalleryTile[] {
  return [
    {
      id: "token-space",
      kind: "token",
      title: "余白の階梯",
      description: "4px を基準にした間隔",
      cover: <TokensCover />,
    },
    {
      id: "token-radius",
      kind: "token",
      title: "角丸",
      description: "面と操作で使い分ける丸み",
      cover: <RadiusCover />,
    },
    {
      id: "token-motion",
      kind: "token",
      title: "動きの曲線",
      description: "状態と押下の長さと曲線",
      cover: <MotionCover />,
    },
  ];
}

function componentTiles(): GalleryTile[] {
  return CATALOG_COMPONENTS.map((component) => ({
    id: `component-${component.slug}`,
    kind: "component",
    title: component.title,
    description: catalog.experiments.find((item) => item.slug === component.slug)?.lead ?? "",
    cover: <component.Preview />,
  }));
}

function guidelineTiles(): GalleryTile[] {
  return ALL_GUIDELINES.map((guideline) => ({
    id: `guideline-${guideline.slug}`,
    kind: "guideline",
    title: guideline.title,
    description: guideline.summary,
  }));
}

/**
 * 種別ごとの列から 1 件ずつ順に取り、同じ種別が続かない並びにする。
 * 配色は件数が多いので、並びの先頭と途中に散らばる。
 */
export function interleave<T>(groups: T[][]): T[] {
  const queues = groups.map((group) => [...group]);
  const result: T[] = [];
  while (queues.some((queue) => queue.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next !== undefined) result.push(next);
    }
  }
  return result;
}

export function galleryTiles(): GalleryTile[] {
  return interleave([
    colorTiles(),
    typeTiles(),
    iconTiles(),
    guidelineTiles(),
    componentTiles(),
    tokenTiles(),
  ]);
}
