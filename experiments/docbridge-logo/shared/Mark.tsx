// 配布用 SVG を inline に展開する。root に width / height がないので CSS で大きさを与える。
// 同じ asset を 1 画面に何度も置くので、part-* の id は class へ書き換える。
// Catalog 本体（apps/catalog/src/components/icons.tsx）と同じ扱いである。
export function Mark({ svg, className }: { svg: string; className: string }) {
  return (
    <span
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg.replaceAll('id="part-', 'class="part-') }}
    />
  );
}
