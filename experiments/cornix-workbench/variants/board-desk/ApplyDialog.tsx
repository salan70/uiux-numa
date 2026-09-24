import { useEffect, useRef, useState } from "react";
import { Button } from "../../../button/shared/Button";
import type { Diagnostic, DiffRow } from "../../shared/fixture";
import { subjectLabel } from "../../shared/model";
import { SEVERITY } from "./Drawers";
import { APPLY_STEPS, type ApplyPhase } from "./state";

type Props = {
  phase: ApplyPhase;
  total: number;
  diff: DiffRow[];
  warnings: Diagnostic[];
  onNext: () => void;
  onWrite: () => void;
  onAbort: () => void;
  onClose: () => void;
};

/** 途中で他の作業へ移れない線形の流れ。書き込みを始めたら「中断」だけを出す。 */
export function ApplyDialog({
  phase,
  total,
  diff,
  warnings,
  onNext,
  onWrite,
  onAbort,
  onClose,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [acks, setAcks] = useState<Record<string, boolean>>({});
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    heading.current?.focus();
  }, []);
  useEffect(() => {
    heading.current?.focus();
  }, [phase.step]);
  const writing = phase.step === 3;
  const allAcked = warnings.every((w) => acks[w.id]);

  return (
    <dialog
      ref={ref}
      className="bd-apply"
      aria-labelledby="bd-apply-title"
      onCancel={(e) => {
        e.preventDefault();
        if (phase.step < 3 || phase.step === 4) onClose();
      }}
    >
      <header className="bd-apply-head">
        <h2 id="bd-apply-title" ref={heading} tabIndex={-1}>
          実機へ Apply
        </h2>
        <ol className="bd-apply-steps" aria-label="Apply の段階">
          {APPLY_STEPS.map((s, i) => (
            <li
              key={s}
              className={i < phase.step ? "is-done" : i === phase.step ? "is-current" : ""}
              aria-current={i === phase.step ? "step" : undefined}
            >
              <span className="bd-step-no">{i < phase.step ? "✓" : i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </header>

      <div className="bd-apply-body">
        {phase.step === 0 ? (
          <section aria-live="polite">
            <h3 className="bd-section-title">実機の現在の状態を backup する</h3>
            <p>
              全 read 中… 往復 {phase.roundTrips} / {total} 回
            </p>
            <progress max={total} value={phase.roundTrips} />
            <p className="bd-hint">
              保存先 <code>cornix/backups/latest.vil</code>。残り時間は推定しない。
            </p>
          </section>
        ) : null}

        {phase.step === 1 ? (
          <section>
            <h3 className="bd-section-title">書き込む差分 {diff.length} 件</h3>
            <p className="bd-hint">
              backup を保存した。書き込むのは差分だけ。1 件ごとに書いて同じ entry
              を読み直して確認する。
            </p>
            <table className="bd-diff-table">
              <thead>
                <tr>
                  <th>種類</th>
                  <th>対象</th>
                  <th>現在</th>
                  <th>移行後</th>
                </tr>
              </thead>
              <tbody>
                {diff.map((d) => (
                  <tr key={d.target}>
                    <td>
                      <span className="bd-tag is-change">変更</span>
                    </td>
                    <td>{subjectLabel(d.subject)}</td>
                    <td>
                      {d.beforeBehavior} <code>{d.before}</code>
                    </td>
                    <td>
                      <strong>{d.afterBehavior}</strong> <code>{d.after}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        {phase.step === 2 ? (
          <section>
            <h3 className="bd-section-title">書き込む前の確認</h3>
            {warnings.length === 0 ? (
              <p>承認が要る警告はない。error も無いので書き込める。</p>
            ) : (
              <>
                <p>
                  内容を理解した警告だけ承認する。承認は問題の解決ではなく、差分が変わると外れる。
                </p>
                {warnings.map((w) => (
                  <label key={w.id} className="bd-ack">
                    <input
                      type="checkbox"
                      checked={Boolean(acks[w.id])}
                      onChange={(e) => setAcks((a) => ({ ...a, [w.id]: e.target.checked }))}
                    />
                    <span>
                      {SEVERITY.warning.icon} <code>{w.code}</code> {w.message}
                    </span>
                  </label>
                ))}
              </>
            )}
            <p className="bd-hint">書き込み中は実機を切断しない。</p>
          </section>
        ) : null}

        {phase.step === 3 ? (
          <section aria-live="polite">
            <h3 className="bd-section-title">
              書き込みと確認 {phase.verified} / {diff.length} 件
            </h3>
            <progress max={diff.length} value={phase.verified} />
            <ul className="bd-write-rows">
              {diff.map((d, i) => (
                <li
                  key={d.target}
                  className={
                    i < phase.verified ? "is-done" : i === phase.verified ? "is-active" : ""
                  }
                >
                  <span>
                    {i < phase.verified
                      ? "✓ 書き込み → 再読み込みが一致"
                      : i === phase.verified
                        ? "◌ 書き込み中"
                        : "待機"}
                  </span>
                  <span>{subjectLabel(d.subject)}</span>
                </li>
              ))}
            </ul>
            <p className="bd-hint">
              中断すると、途中までの状態は持ち越さずに全 read からやり直す。
            </p>
          </section>
        ) : null}

        {phase.step === 4 ? (
          <section>
            {phase.outcome === "done" ? (
              <>
                <h3 className="bd-section-title bd-ok">✓ {phase.verified} 件を実機に反映した</h3>
                <p>書き込みのあと実機を読み直し、workspace と一致した。</p>
                <p className="bd-hint">
                  確かめたのは実機に反映されたことまで。電源を切っても残るかは確認していない。確かめるには、電源を入れ直してから実機を読み込む。
                </p>
              </>
            ) : (
              <>
                <h3 className="bd-section-title bd-bad">
                  ! 中断した（{phase.verified} 件まで確認済み）
                </h3>
                <p>
                  途中の状態は持ち越さない。「実機と適用」から、実機を読み込み直して差分を確かめる。
                </p>
              </>
            )}
          </section>
        ) : null}
      </div>

      <footer className="bd-apply-foot">
        {phase.step < 3 ? (
          <Button appearance="quiet" onClick={onClose}>
            キャンセル
          </Button>
        ) : null}
        <span className="bd-spacer" />
        {phase.step === 1 ? <Button onClick={onNext}>確認へ進む</Button> : null}
        {phase.step === 2 ? (
          <Button disabled={!allAcked} onClick={onWrite}>
            {diff.length} 件を実機へ書き込む
          </Button>
        ) : null}
        {writing ? (
          <Button appearance="danger" onClick={onAbort}>
            中断
          </Button>
        ) : null}
        {phase.step === 4 ? <Button onClick={onClose}>閉じる</Button> : null}
      </footer>
    </dialog>
  );
}
