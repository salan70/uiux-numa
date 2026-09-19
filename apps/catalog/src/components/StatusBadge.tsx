import type { VariantStatus } from "../content/collect";

const labels: Record<VariantStatus, string> = {
  adopted: "採用",
  rejected: "却下",
  exploring: "検討中",
};

type Props = {
  status: VariantStatus;
};

export function StatusBadge({ status }: Props) {
  return <span className={`status-badge status-badge-${status}`}>{labels[status]}</span>;
}

export function experimentStatusLabel(input: { status: string; adopted: string[] }): VariantStatus {
  if (input.status !== "decided") return "exploring";
  return input.adopted.length > 0 ? "adopted" : "rejected";
}
