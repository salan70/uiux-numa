import SwiftUI

// メモの入力。memo-input.md の R-1〜R-6。
// 保存に失敗したらシートを閉じず、書いた文章を残したまま理由と次の行動を出す（Yodoku の点検 Y1）。

extension YK {
    struct MemoComposer: View {
        enum Target {
            /// 読書中または終了済みのセッションへ足す。
            case session(bookID: UUID, sessionID: UUID)
            /// 本へ直接足す（セッション外メモ）。
            case book(UUID)
            /// 既存のメモを直す。
            case edit(Memo)
        }

        @Environment(Store.self) private var store
        @Environment(\.dismiss) private var dismiss
        let target: Target
        /// 読書空間から開くときは暗い面で描く。
        var dark = false

        @State private var text = ""
        @State private var categoryID: UUID?
        @State private var failed = false
        @State private var saving = false
        @FocusState private var focused: Bool

        private var trimmedIsEmpty: Bool { text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }

        var body: some View {
            NavigationStack {
                VStack(alignment: .leading, spacing: Space.s400) {
                    categoryPicker
                    TextField("", text: $text, prompt: SwiftUI.Text("読みながら浮かんだこと").foregroundStyle(inkSecondary), axis: .vertical)
                        .font(Font.body())
                        .lineSpacing(Leading.body)
                        .foregroundStyle(ink)
                        .focused($focused)
                        .frame(maxHeight: .infinity, alignment: .top)
                        .accessibilityLabel("メモの本文")
                    if failed {
                        Label {
                            SwiftUI.Text("保存できませんでした。文章は残っています。もう一度保存してください。")
                        } icon: {
                            Image(systemName: "exclamationmark.circle")
                        }
                        .font(Font.caption())
                        .foregroundStyle(dark ? Color(hex: 0xF2B8B0) : Palette.error)
                        .accessibilityAddTraits(.updatesFrequently)
                    }
                }
                .padding(.horizontal, Space.page)
                .padding(.top, Space.s200)
                .background(background.ignoresSafeArea())
                .navigationTitle(title)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("キャンセル", systemImage: "xmark") { dismiss() }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("保存", systemImage: "checkmark", action: save)
                            .disabled(trimmedIsEmpty || saving)
                    }
                }
            }
            .tint(ink)
            .preferredColorScheme(dark ? .dark : nil)
            .presentationDetents([.medium, .large])
            .presentationBackground(background)
            .onAppear(perform: prepare)
        }

        private var title: String {
            switch target {
            case .session: "メモ"
            case .book: "本へのメモ"
            case .edit: "メモを編集"
            }
        }

        private var ink: Color { dark ? ReadingInk.text : Palette.onSurface }
        private var inkSecondary: Color { dark ? ReadingInk.secondary : Palette.onSurfaceVariant }
        private var background: Color { dark ? Color(hex: 0x1C2130) : Palette.surface }

        /// カテゴリーは 0..1 の選択。選び直すと外れる（memo-input.md R-2）。
        private var categoryPicker: some View {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Space.s200) {
                    ForEach(store.sortedCategories) { category in
                        let selected = categoryID == category.id
                        Button {
                            categoryID = selected ? nil : category.id
                        } label: {
                            Label(category.name, systemImage: category.symbol)
                                .font(Font.caption())
                                .padding(.horizontal, Space.s300)
                                .frame(minHeight: Size.controlSm)
                                .foregroundStyle(selected ? (dark ? Color(hex: 0x14192A) : Palette.onPrimary) : ink)
                                .background(
                                    selected ? (dark ? ReadingInk.text : Palette.primary) : (dark ? ReadingInk.control : Palette.surfaceContainer),
                                    in: Capsule()
                                )
                                .frame(minHeight: Size.target)
                                .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                        .accessibilityAddTraits(selected ? .isSelected : [])
                    }
                }
                .padding(.horizontal, Space.page)
            }
            .padding(.horizontal, -Space.page)
            .accessibilityElement(children: .contain)
            .accessibilityLabel("カテゴリー")
        }

        private func prepare() {
            switch target {
            case .session(_, let sessionID):
                categoryID = store.carriedCategory[sessionID]
            case .book:
                break
            case .edit(let memo):
                text = memo.body
                categoryID = memo.categoryID
            }
            focused = true
        }

        private func save() {
            saving = true
            defer { saving = false }
            do {
                switch target {
                case let .session(bookID, sessionID):
                    try store.addMemo(body: text, categoryID: categoryID, bookID: bookID, sessionID: sessionID)
                case let .book(bookID):
                    try store.addMemo(body: text, categoryID: categoryID, bookID: bookID, sessionID: nil)
                case let .edit(memo):
                    try store.updateMemo(memo.id, body: text, categoryID: categoryID)
                }
                dismiss()
            } catch {
                failed = true
                AccessibilityNotification.Announcement("保存できませんでした。文章は残っています。").post()
            }
        }
    }
}

extension YK.MemoComposer.Target: Identifiable {
    var id: String {
        switch self {
        case .session(_, let s): "s-\(s)"
        case .book(let b): "b-\(b)"
        case .edit(let m): "e-\(m.id)"
        }
    }
}
