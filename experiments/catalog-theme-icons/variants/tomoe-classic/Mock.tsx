import type { CSSProperties } from "react";
import { makePalette, schemes, type Mode } from "../../../color-schemes-material/shared/palettes";

type Icons = {
  scheme: string;
  appearanceLight: string;
  appearanceDark: string;
  appearanceSystem: string;
};

type ThemeCell = { schemeId: string; mode: Mode };

function scopeParts(svg: string, cellId: string): string {
  // 20 セルへ同じ SVG を展開するため、Mock 内だけ part-* ID にセル固有の接頭辞を付ける。
  // 配布用の正本と Catalog 転記の class 名は変更せず、ID 衝突回避の細工を Mock に閉じる。
  return svg.replaceAll('id="part-', `id="${cellId}-part-`);
}

function InlineIcon({ svg, cellId }: { svg: string; cellId: string }) {
  return (
    <span
      className="cti-icon"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: scopeParts(svg, cellId) }}
    />
  );
}

function paletteStyle(schemeId: string, mode: Mode): CSSProperties {
  const scheme = schemes.find((item) => item.id === schemeId);
  if (!scheme) throw new Error(`配色がない: ${schemeId}`);
  const palette = makePalette(scheme, mode);
  return {
    "--color-background": palette.background,
    "--color-primary": palette.primary,
    "--color-secondary": palette.secondary,
    "--color-tertiary": palette.tertiary,
    "--color-on-surface-variant": palette["on-surface-variant"],
    "--color-surface-container": palette["surface-container"],
    "--color-surface-variant": palette["surface-variant"],
    "--cat-surface": palette["surface-container"],
    "--cat-line": palette["surface-variant"],
    "--cat-text": palette["on-surface"],
  } as CSSProperties;
}

function SchemePick({
  icons,
  cellId,
  schemeId,
  mode,
}: {
  icons: Icons;
  cellId: string;
  schemeId: string;
  mode: Mode;
}) {
  return (
    <span className="theme__pick">
      <span className="theme__icon">
        <InlineIcon svg={icons.scheme} cellId={`${cellId}-scheme`} />
      </span>
      <span className="theme__label">配色</span>
      <span className="cti-sr-only">
        {schemeId} {mode}
      </span>
    </span>
  );
}

function AppearancePick({
  icons,
  asset,
  label,
  cellId,
}: {
  icons: Icons;
  asset: string;
  label: string;
  cellId: string;
}) {
  return (
    <span className="theme__pick">
      <span className="theme__icon">
        <InlineIcon svg={asset} cellId={`${cellId}-appearance`} />
      </span>
      <span className="theme__label">{label}</span>
    </span>
  );
}

export function Mock({ icons }: { icons: Icons }) {
  const cells: ThemeCell[] = schemes.flatMap((scheme) => [
    { schemeId: scheme.id, mode: "light" as const },
    { schemeId: scheme.id, mode: "dark" as const },
  ]);

  return (
    <main className="cti-mock">
      <section className="cti-grid" aria-label="10 配色の light / dark">
        {cells.map(({ schemeId, mode }, index) => {
          const cellId = `cti-cell-${index}`;
          return (
            <article
              key={`${schemeId}-${mode}`}
              className="cti-cell"
              style={paletteStyle(schemeId, mode)}
            >
              <div className="theme">
                <SchemePick icons={icons} cellId={cellId} schemeId={schemeId} mode={mode} />
                <AppearancePick
                  icons={icons}
                  asset={mode === "light" ? icons.appearanceLight : icons.appearanceDark}
                  label={mode}
                  cellId={cellId}
                />
              </div>
              <p className="cti-caption">
                {schemeId} / {mode}
              </p>
            </article>
          );
        })}
      </section>

      <section className="cti-appearance-row" aria-label="明暗の 3 状態">
        <p className="cti-heading">明暗の 3 状態</p>
        <div className="theme" style={paletteStyle("sumi", "light")}>
          <AppearancePick
            icons={icons}
            asset={icons.appearanceLight}
            label="light"
            cellId="cti-appearance-light"
          />
          <AppearancePick
            icons={icons}
            asset={icons.appearanceDark}
            label="dark"
            cellId="cti-appearance-dark"
          />
          <AppearancePick
            icons={icons}
            asset={icons.appearanceSystem}
            label="system"
            cellId="cti-appearance-system"
          />
        </div>
      </section>
    </main>
  );
}
