import { Showcase } from "../../shared/Showcase";
import "../../shared/button.css";
import "../pill-action/variant.css";
import "./variant.css";

// pill-action の形と押下反応をそのまま使い、hover の返し方だけを変える。
export default function Variant() {
  return <Showcase variantClass="button-pill-action button-pill-zoom-label" />;
}
