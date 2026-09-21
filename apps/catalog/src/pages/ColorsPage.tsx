import { useEffect, useRef, useState } from "react";
import { Button } from "../../../../experiments/button/shared/Button";
import { ArrowIcon, DetailIcon } from "../components/icons";
import { Link } from "../components/Link";
import { TopicScreen } from "../components/TopicScreen";
import { useCopy } from "../components/useCopy";
import { useMode } from "../components/useMode";
import { adoptedSchemes } from "../content/collect";
import {
  contrastRatioFromCss,
  formatRatio,
  passesWcag,
  ROLE_CONTRAST,
  ROLE_GROUPS,
} from "../content/contrast";
import {
  bandInk,
  cardColors,
  codeInk,
  colorLabel,
  colorOf,
  hexOf,
  heroWeight,
  HERO_ROWS,
  labelInk,
  mergeRoles,
  type Mode,
} from "../content/palette";
import type { ColorScheme } from "../content/schemes";
import { replaceLocation } from "../router";
import { readSchemeChoice } from "../theme";
import { NotFoundPage } from "./NotFoundPage";

/** ポップアップで確かめる組み合わせ。閾値と相手の役割は ROLE_CONTRAST が正本。 */
const DIALOG_PAIRS = [
  "on-surface",
  "on-surface-variant",
  "on-primary",
  "primary-text",
  "outline",
  "focus",
];

/**
 * 配色の一覧。coolors のパレットカードを参考にする。
 * 明暗の切替は題字の選択に一本化した。
 * 配色トピックだけに切替を置くと、同じ操作が画面の 2 か所にあり、
 * どちらがカタログ自身の見え方を変えるのか読めない。
 */
export function ColorsPage({ openScheme }: { openScheme: string | null }) {
  const mode = useMode();
  const { copied, copy } = useCopy();
  const shown = adoptedSchemes();
  const open = shown.find((item) => item.id === openScheme);

  // ページ内で開いたのか、URL を直接開いたのかで閉じたあとの戻り先を変える。
  const openedHere = useRef(false);
  const previous = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    // 初回は undefined なので直リンク扱いになる。一覧から押したときだけ true になる。
    if (previous.current === null && openScheme !== null) openedHere.current = true;
    previous.current = openScheme;
  }, [openScheme]);

  // 採用していない配色の URL は開けない。
  if (openScheme !== null && !open) return <NotFoundPage />;

  const close = () => {
    if (openedHere.current) {
      openedHere.current = false;
      window.history.back();
      return;
    }
    replaceLocation("/foundations/colors");
  };

  return (
    <TopicScreen id="colors">
      <div className="topic-body">
        <Feature mode={mode} shown={shown} copy={copy} />

        <div className="palette-browse">
          <ul className="palettes">
            {shown.map((scheme) => (
              <li className="palette" key={scheme.id}>
                <ul className="bands">
                  {cardColors(scheme, mode).map((band) => (
                    <li className="band" key={band.value} style={{ background: band.value }}>
                      <button
                        type="button"
                        className="band__hit"
                        style={{ color: bandInk(scheme, mode, band) }}
                        onClick={() => copy(hexOf(band.value))}
                      >
                        <span className="band__info">
                          <span className="band__hex">{hexOf(band.value)}</span>
                          <span className="band__role">{band.roles.join(" / ")}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="palette__head">
                  <p className="palette__name">
                    <span className="palette__label" style={{ color: labelInk(scheme, mode) }}>
                      {scheme.label}
                    </span>
                    <code style={{ color: codeInk(scheme, mode) }}>{scheme.id}</code>
                  </p>
                  {/* リンクにすると、中クリックと新規タブが効き、深いリンクの存在も画面から読める。 */}
                  <Link
                    href={`/foundations/colors/${scheme.id}`}
                    className="palette__more"
                    id={`scheme-more-${scheme.id}`}
                    aria-haspopup="dialog"
                    aria-label={`${scheme.label} の役割をすべて見る`}
                  >
                    <DetailIcon />
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          <p className="copied" role="status">
            {copied ? `${copied} をコピーした。` : ""}
          </p>
        </div>

        <SchemeDialog scheme={open} mode={mode} copy={copy} onClose={close} />
      </div>
    </TopicScreen>
  );
}

/**
 * 1 配色を全幅で見せる帯。前後のボタンで送る。
 * カードの展開とは連動させない。連動させると、画面外の帯が変わって変化が見えない。
 */
function Feature({
  mode,
  shown,
  copy,
}: {
  mode: Mode;
  shown: ColorScheme[];
  copy: (value: string) => void;
}) {
  // 最初は、いまカタログに当てている配色を見せる。
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      shown.findIndex((item) => item.id === readSchemeChoice()),
    ),
  );
  const scheme = shown[index] ?? shown[0];
  const at = (step: number) => (index + step + shown.length) % shown.length;
  const move = (step: number) => setIndex(at(step));
  const prev = shown[at(-1)];
  const next = shown[at(1)];

  return (
    <section className="feature" aria-labelledby="feature-name">
      <div className="feature__bands">
        {HERO_ROWS.map((roles, row) => (
          <ul className="feature__row" key={row}>
            {mergeRoles(scheme, mode, roles).map((band) => (
              <li
                className="feature__band"
                key={band.value}
                style={{ background: band.value, flexGrow: heroWeight(band) }}
              >
                <button
                  type="button"
                  className="feature__hit"
                  style={{ color: bandInk(scheme, mode, band) }}
                  onClick={() => copy(hexOf(band.value))}
                >
                  <span className="feature__hex">{hexOf(band.value)}</span>
                  <span className="feature__role">{band.roles.join(" / ")}</span>
                  <span className="feature__jp">{band.name}</span>
                </button>
              </li>
            ))}
          </ul>
        ))}
      </div>
      <div className="feature__head">
        <p className="feature__name" id="feature-name">
          <span className="feature__label" style={{ color: labelInk(scheme, mode) }}>
            {scheme.label}
          </span>
          <code style={{ color: codeInk(scheme, mode) }}>{scheme.id}</code>
        </p>
        {/* 送り先が何かを、方向ではなく配色の名前で示す。 */}
        <p className="feature__nav">
          <Button
            appearance="secondary"
            className="feature__step"
            aria-label={`前の配色 ${prev.label}`}
            leadingIcon={<ArrowIcon direction="prev" />}
            onClick={() => move(-1)}
          >
            <span className="feature__step-name">{prev.label}</span>
          </Button>
          {/* 桁数を揃える。1 / 10 と 10 / 10 で幅が変わると、両隣のボタンが動く。 */}
          <span className="feature__count">
            {String(index + 1).padStart(String(shown.length).length, "0")} / {shown.length}
          </span>
          <Button
            appearance="secondary"
            className="feature__step"
            aria-label={`次の配色 ${next.label}`}
            trailingIcon={<ArrowIcon direction="next" />}
            onClick={() => move(1)}
          >
            <span className="feature__step-name">{next.label}</span>
          </Button>
        </p>
      </div>
    </section>
  );
}

/**
 * 詳細のポップアップ。
 * <dialog> の showModal に任せると、Esc、背景の不活性化、focus の閉じ込めが既定で付く。
 * 自前で作ると、この 3 つを再実装することになる。
 * 開いているかどうかは URL が決める。pushState、popstate、直リンクが同じ経路に乗る。
 */
function SchemeDialog({
  scheme,
  mode,
  copy,
  onClose,
}: {
  scheme: ColorScheme | undefined;
  mode: Mode;
  copy: (value: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const lastId = useRef<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (scheme && !dialog.open) {
      lastId.current = scheme.id;
      dialog.showModal();
    }
    if (!scheme && dialog.open) dialog.close();
    // 閉じたあとの focus は、開く前に押したリンクへ戻す。
    // 直リンクで入った場合はそのリンクが無いので、画面の見出しへ移す。
    if (!scheme && lastId.current) {
      const back = document.getElementById(`scheme-more-${lastId.current}`);
      (back ?? document.querySelector<HTMLElement>("[data-screen-heading]"))?.focus();
      lastId.current = null;
    }
  }, [scheme]);

  return (
    <dialog
      className="sheet-dialog"
      ref={ref}
      aria-labelledby="dialog-name"
      onClose={onClose}
      // 背景を押しても閉じる。dialog 自身が背景の当たり判定になる。
      onClick={(event) => {
        if (event.target === ref.current) ref.current?.close();
      }}
    >
      {scheme && (
        <div className="sheet-dialog__body">
          <div className="sheet-dialog__head">
            <p className="sheet-dialog__name" id="dialog-name">
              <span className="sheet-dialog__label" style={{ color: labelInk(scheme, mode) }}>
                {scheme.label}
              </span>
              <code style={{ color: codeInk(scheme, mode) }}>{scheme.id}</code>
            </p>
            <Button appearance="secondary" autoFocus onClick={() => ref.current?.close()}>
              閉じる
            </Button>
          </div>
          <SchemeDetail scheme={scheme} mode={mode} copy={copy} />
        </div>
      )}
    </dialog>
  );
}

/** ポップアップの中身。24 役割すべてと、主要な組み合わせのコントラスト。 */
function SchemeDetail({
  scheme,
  mode,
  copy,
}: {
  scheme: ColorScheme;
  mode: Mode;
  copy: (value: string) => void;
}) {
  return (
    <div className="detail-panel">
      {ROLE_GROUPS.map((group) => (
        <div className="role-group" key={group.id}>
          <p className="role-group__label">{group.label}</p>
          <ul className="role-list">
            {group.roles.flatMap((role) => {
              const color = colorOf(scheme, mode, role);
              if (!color) return [];
              return [
                <li className="role-item" key={role}>
                  <button
                    type="button"
                    className="role-item__hit"
                    onClick={() => copy(hexOf(color.value))}
                  >
                    <span className="role-item__chip" style={{ background: color.value }} />
                    <span className="role-item__role">{role}</span>
                    <span className="role-item__jp">{colorLabel(color)}</span>
                    <span className="role-item__hex">{hexOf(color.value)}</span>
                  </button>
                </li>,
              ];
            })}
          </ul>
        </div>
      ))}

      <div className="role-group">
        <p className="role-group__label">コントラスト</p>
        <ul className="ratios">
          {DIALOG_PAIRS.flatMap((role) => {
            const rule = ROLE_CONTRAST[role];
            if (!rule) return [];
            const fg = colorOf(scheme, mode, role);
            const bg = colorOf(scheme, mode, rule.against);
            if (!fg || !bg) return [];
            const ratio = contrastRatioFromCss(fg.value, bg.value);
            const ok = passesWcag(ratio, rule.minimum);
            return [
              <li className="ratio" key={role} data-pass={ok}>
                <span className="ratio__pair">
                  {role} 対 {rule.against}
                </span>
                <span className="ratio__value">{formatRatio(ratio)}</span>
                <span className="ratio__min">{rule.minimum}:1</span>
                <span className="ratio__mark">{ok ? "合格" : "不足"}</span>
              </li>,
            ];
          })}
        </ul>
      </div>

      <div className="role-group">
        <p className="role-group__label">組んだところ</p>
        <SchemeSpecimen scheme={scheme} mode={mode} />
      </div>
    </div>
  );
}

/** 配色を当てた小さな標本。色の一覧だけでは、組んだときの見え方が分からない。 */
function SchemeSpecimen({ scheme, mode }: { scheme: ColorScheme; mode: Mode }) {
  const vars: Record<string, string> = {};
  for (const color of scheme[mode]) vars[`--cs-${color.role}`] = color.value;
  return (
    <div className="specimen" style={vars as React.CSSProperties}>
      <p className="specimen__title">日本語プロダクト UI</p>
      <p className="specimen__body">この配色で本文を組むと、こう見える。</p>
      <p className="specimen__row">
        <span className="specimen__btn">主ボタン</span>
        <span className="specimen__btn specimen__btn--quiet">副ボタン</span>
      </p>
      <p className="specimen__field">入力欄</p>
    </div>
  );
}
