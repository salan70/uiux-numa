import CoreText
import SwiftUI

// 実行基盤の責務は experiments/<slug>/variants/<id>/<Pascal(slug)><Pascal(id)>.swift の型を列挙して描画することだけ。
// 起動引数 `-variant <slug>/<id>` で variant を選ぶと一覧を隠し、その variant だけを全画面で描く。preview の撮影に使う。
// variant 固有の起動引数（例: `-fixture idle`）は variant 自身が ProcessInfo から読む。

struct VariantEntry: Identifiable {
    let experiment: String
    let variant: String
    let make: @MainActor () -> AnyView

    var id: String { "\(experiment)/\(variant)" }
}

@main
struct RunnerApp: App {
    init() {
        RunnerFonts.register()
    }

    var body: some Scene {
        WindowGroup {
            if let selected = RunnerApp.launchSelection {
                selected.make()
            } else {
                VariantList()
            }
        }
    }

    static var launchSelection: VariantEntry? {
        guard let id = UserDefaults.standard.string(forKey: "variant") else { return nil }
        return variantEntries.first { $0.id == id }
    }
}

private struct VariantList: View {
    @State private var selected: VariantEntry?

    var body: some View {
        NavigationStack {
            List(variantEntries) { entry in
                Button("\(entry.experiment) / \(entry.variant)") { selected = entry }
            }
            .navigationTitle("variant")
            .overlay {
                if variantEntries.isEmpty {
                    ContentUnavailableView("variant がありません", systemImage: "square.dashed")
                }
            }
        }
        .fullScreenCover(item: $selected) { entry in
            entry.make()
                .overlay(alignment: .top) { RunnerCloseButton { selected = nil } }
        }
    }
}

/// 一覧へ戻る操作。variant の操作と重ならないよう、ステータスバーの中央を長押ししたときだけ閉じる。
private struct RunnerCloseButton: View {
    let close: () -> Void

    var body: some View {
        Color.clear
            .frame(width: 120, height: 24)
            .contentShape(Rectangle())
            .ignoresSafeArea()
            .onLongPressGesture(minimumDuration: 0.8, perform: close)
            .accessibilityLabel("variant の一覧へ戻る")
            .accessibilityAddTraits(.isButton)
            .accessibilityAction { close() }
    }
}

/// tokens/typography/fonts の woff2 をそのまま登録する。CoreText は woff2 を読めるので、ttf の複製を持たない。
enum RunnerFonts {
    static func register() {
        let urls = Bundle.main.urls(forResourcesWithExtension: "woff2", subdirectory: nil) ?? []
        for url in urls {
            CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
        }
    }
}
