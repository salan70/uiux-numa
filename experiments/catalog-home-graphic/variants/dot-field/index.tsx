import { DotFieldHome } from "../../shared/DotFieldHome";
import { Frame } from "../../shared/Frame";
import { HOME_TOPICS } from "../../shared/home";

/** 採用案。部品は shared/DotFieldHome にあり、Catalog のトップも同じものを使う。 */
export default function Variant() {
  return (
    <Frame variantClass="df">
      <DotFieldHome topics={HOME_TOPICS} />
    </Frame>
  );
}
