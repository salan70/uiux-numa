import type { ReactNode } from "react";
import { CopyButton } from "./CopyButton";

export type TokenRow = {
  name: string;
  value: ReactNode;
  description: string;
  copy: string;
};

type Props = {
  caption: string;
  rows: TokenRow[];
};

export function TokenTable({ caption, rows }: Props) {
  return (
    <div className="token-table-wrap">
      <table className="token-table">
        <caption>{caption}</caption>
        <colgroup>
          <col className="token-col-name" />
          <col className="token-col-value" />
          <col className="token-col-desc" />
          <col className="token-col-copy" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">名前</th>
            <th scope="col">値</th>
            <th scope="col">説明</th>
            <th scope="col">コピー</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row">
                <code>{row.name}</code>
              </th>
              <td>{row.value}</td>
              <td>{row.description}</td>
              <td>
                <CopyButton value={row.copy} label={row.name} showValue={false} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
