import { useEffect, useId, useMemo, useState } from "react";
import { searchIndex } from "../content/search";
import { navigate } from "../router";
import { Link } from "./Link";

type Props = {
  path?: string;
  onNavigate?: () => void;
};

export function SearchBox({ path, onNavigate }: Props) {
  const listId = useId();
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    setQuery("");
    setActive(0);
  }, [path]);

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length < 1) return [];
    return searchIndex.search(trimmed).slice(0, 8);
  }, [query]);

  function go(path: string) {
    setQuery("");
    setActive(0);
    navigate(path);
    onNavigate?.();
  }

  return (
    <search className="site-search">
      <label htmlFor={inputId}>検索</label>
      <input
        id={inputId}
        type="search"
        role="combobox"
        aria-expanded={results.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        value={query}
        placeholder="配色、文字、部品"
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => Math.max(index - 1, 0));
          }
          if (event.key === "Enter" && results[active]) {
            event.preventDefault();
            const path = String(results[active].path ?? "");
            if (path) go(path);
          }
          if (event.key === "Escape") {
            setQuery("");
          }
        }}
      />
      {results.length > 0 ? (
        <ul id={listId} role="listbox" className="search-results">
          {results.map((item, index) => (
            <li key={item.id} role="option" aria-selected={index === active}>
              <Link
                href={String(item.path)}
                onNavigate={() => {
                  setQuery("");
                  onNavigate?.();
                }}
              >
                {String(item.title)}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </search>
  );
}
