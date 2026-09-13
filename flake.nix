{
  description = "uiux-numa — AI エージェントで UI/UX とプロダクト体験を探索する R&D リポジトリ";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  # このフレークの責務はツールチェーンの固定のみ。
  # コマンドの定義元は justfile（`just --list` で一覧）。両者で重複させない。
  outputs = { self, nixpkgs, nixpkgs-unstable, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        unstable = import nixpkgs-unstable { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.just
            pkgs.direnv
            pkgs.pre-commit
            pkgs.nodejs_22
            pkgs.pnpm
            pkgs.markdownlint-cli2
            unstable.oxfmt
          ];

          shellHook = ''
            echo "🧪 uiux-numa"
            echo "  コマンド一覧: just --list"
          '';
        };

        formatter = pkgs.nixfmt-classic;
      });
}
