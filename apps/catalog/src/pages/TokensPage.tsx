import { catalog } from "../content/collect";
import { TopicScreen } from "../components/TopicScreen";
import { formatTokenValue } from "../content/tokens";
import { TokenSample } from "../components/TokenSample";
import { renderSentences } from "../components/Sentences";

/** token の正本をそのまま表にする。一覧を挟まず、値と見本を直接出す。 */
export function TokensPage() {
  return (
    <TopicScreen id="tokens">
      <div className="token-families">
        {catalog.tokenFamilies.map((family) => (
          <section className="token-family" key={family.id} aria-labelledby={`tf-${family.id}`}>
            <h2 className="token-family__head" id={`tf-${family.id}`}>
              {family.label}
            </h2>
            <p className="meta">
              {family.role && <span>{family.role}</span>}
              {family.maturity && <span>{family.maturity}</span>}
              <span>{family.tokens.length} token</span>
            </p>
            <p className="token-family__source">
              正本は <code>{family.sourcePath}</code>
            </p>
            <div className="token-table-wrap">
              <table className="token-table">
                <thead>
                  <tr>
                    <th scope="col">名前</th>
                    <th scope="col">値</th>
                    <th scope="col">見本</th>
                    <th scope="col">説明</th>
                  </tr>
                </thead>
                <tbody>
                  {family.tokens.map((token) => (
                    <tr key={token.name}>
                      <th scope="row">
                        <code>{token.cssNames[0]}</code>
                        <span className="token-table__kind">{token.kind}</span>
                      </th>
                      <td className="token-table__value">
                        {formatTokenValue(token.type, token.resolvedValue)}
                      </td>
                      <td>
                        <TokenSample token={token} />
                      </td>
                      <td className="token-table__desc">{renderSentences(token.description)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </TopicScreen>
  );
}
