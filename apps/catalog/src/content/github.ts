export const GITHUB_REPO = "salan70/uiux-numa";
export const GITHUB_BLOB = `https://github.com/${GITHUB_REPO}/blob/main`;

export function githubBlobUrl(repoPath: string): string {
  return `${GITHUB_BLOB}/${repoPath}`;
}

export function toRepoPath(globKey: string): string {
  const match = globKey.match(/\/((?:experiments|tokens|docs|skills)\/.*)$/);
  if (!match) throw new Error(`リポジトリパスに変換できない: ${globKey}`);
  return match[1];
}
