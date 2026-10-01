// variant `pixel-12`: 12 × 12 の升目を塗るドット絵のアイコン。
// 原本は shared/build-icons.mjs が升目の文字列から書き出す。配布用は just svg-optimize の出力。
// 利用画面のモックは、製品の design system の部品（押せる面、札、数字パッド、空の状態）に置いた形にする。
const files = import.meta.glob<string>("./dist/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});
const icons = Object.fromEntries(
  Object.entries(files).map(([path, svg]) => [path.replace(/^\.\/dist\/|\.svg$/g, ""), svg]),
);

const ink = "#1F1F1F";
const key = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 48,
  height: 48,
  boxSizing: "border-box" as const,
  border: `3px solid ${ink}`,
  borderRadius: 12,
  boxShadow: `5px 5px 0 ${ink}`,
  background: "#FEFEFE",
  color: ink,
};

function Icon({ name, size }: { name: string; size: number }) {
  return (
    <span
      style={{ display: "inline-block", width: size, height: size, lineHeight: 0 }}
      // 配布用の SVG をそのまま展開する。
      dangerouslySetInnerHTML={{ __html: icons[name].replace("<svg ", `<svg width="${size}" height="${size}" `) }}
    />
  );
}

export default function Variant() {
  return (
    <div style={{ background: "#F8F9F9", padding: 24, display: "grid", gap: 32, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ flex: 1, fontWeight: 700 }}>年間試合数</span>
        <span style={key}>
          <Icon name="minus" size={24} />
        </span>
        <span style={{ fontSize: 32, fontWeight: 700, width: 72, textAlign: "center" }}>143</span>
        <span style={key}>
          <Icon name="plus" size={24} />
        </span>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {["打者", "投手"].map((label, i) => (
          <span
            key={label}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              height: 48,
              padding: "0 12px",
              border: `2px solid ${ink}`,
              borderRadius: 6,
              background: i === 0 ? "#D4E0F7" : "#FEFEFE",
              fontWeight: 700,
            }}
          >
            {label}
            {i === 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  padding: 2,
                  borderRadius: 999,
                  border: `2px solid ${ink}`,
                  background: "#4078E0",
                  color: "#120D09",
                  lineHeight: 0,
                }}
              >
                <Icon name="check" size={12} />
              </span>
            )}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 13 }}>
        {["000", "0"].map((d) => (
          <span key={d} style={{ ...key, width: 96, fontSize: 20, fontWeight: 700 }}>
            {d}
          </span>
        ))}
        <span style={{ ...key, width: 96 }}>
          <Icon name="backspace" size={24} />
        </span>
      </div>
      <div style={{ textAlign: "center", color: "#785F02" }}>
        <Icon name="ball" size={48} />
        <p style={{ color: ink }}>まだ選手がいません。最初の選手を作りましょう。</p>
      </div>
    </div>
  );
}
