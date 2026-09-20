export const GITHUB_REPO = "salan70/uiux-numa";
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`;

export function repoTreeUrl(path: string): string {
  return `${GITHUB_REPO_URL}/tree/main/${path}`;
}

export function repoBlobUrl(path: string): string {
  return `${GITHUB_REPO_URL}/blob/main/${path}`;
}
