type Props = {
  html: string;
};

export function MarkdownBody({ html }: Props) {
  if (!html) return null;
  return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
