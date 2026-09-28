import SwiftUI

// 読書の終了。reading.md R-4〜R-6、R-12。
// 終了の候補時刻を持ったまま開き、確定したときだけ保存する。閉じれば読書に戻る。

extension YK {
    struct EndSessionSheet: View {
        @Environment(Store.self) private var store
        @Environment(\.dismiss) private var dismiss
        let candidate: Date

        @State private var yoin = ""
        @State private var finished = false
        @State private var confirmCancel = false
        @FocusState private var yoinFocused: Bool

        var body: some View {
            NavigationStack {
                if let session = store.activeSession, let book = store.book(session.bookID) {
                    ScrollView {
                        VStack(alignment: .leading, spacing: Space.s600) {
                            summary(session: session, book: book)
                            Toggle(isOn: $finished) {
                                SwiftUI.Text("この本を読み終えた").font(Font.ui())
                            }
                            .tint(ReadingInk.secondary)
                            .frame(minHeight: Size.target)
                            VStack(alignment: .leading, spacing: Space.s200) {
                                SwiftUI.Text("余韻")
                                    .font(Font.captionBold())
                                    .foregroundStyle(ReadingInk.secondary)
                                    .accessibilityAddTraits(.isHeader)
                                TextField("", text: $yoin, prompt: SwiftUI.Text("読み終えて残ったこと（任意）").foregroundStyle(ReadingInk.secondary), axis: .vertical)
                                    .font(Font.body())
                                    .lineSpacing(Leading.body)
                                    .lineLimit(4...)
                                    .focused($yoinFocused)
                                    .padding(Space.s300)
                                    .background(ReadingInk.control, in: RoundedRectangle(cornerRadius: Radius.surface, style: .continuous))
                                    .accessibilityLabel("余韻")
                            }
                            VStack(spacing: Space.s200) {
                                Button("読書に戻る") { dismiss() }
                                    .buttonStyle(SecondaryButtonStyle(fill: ReadingInk.control, ink: ReadingInk.text))
                                    .frame(maxWidth: .infinity)
                                Button("このセッションを取り消す", role: .destructive) { confirmCancel = true }
                                    .font(Font.caption())
                                    .foregroundStyle(Color(hex: 0xF2B8B0))
                                    .frame(minHeight: Size.target)
                            }
                            .frame(maxWidth: .infinity)
                        }
                        .padding(.horizontal, Space.page)
                        .padding(.vertical, Space.s400)
                    }
                    .scrollDismissesKeyboard(.interactively)
                    .foregroundStyle(ReadingInk.text)
                    .navigationTitle("読書を終える")
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar {
                        ToolbarItem(placement: .confirmationAction) {
                            Button("終える", systemImage: "checkmark") {
                                store.confirmEnd(at: candidate, yoin: yoin, finished: finished)
                                dismiss()
                            }
                        }
                    }
                    .confirmationDialog("このセッションを取り消しますか？", isPresented: $confirmCancel, titleVisibility: .visible) {
                        Button("取り消す", role: .destructive) {
                            store.cancelActiveSession()
                            dismiss()
                        }
                    } message: {
                        SwiftUI.Text("読書時間と、このセッションのメモ \(store.memos(inSession: session.id).count) 件が消え、戻せません。")
                    }
                }
            }
            .tint(ReadingInk.text)
            .preferredColorScheme(.dark)
            .presentationDetents([.large])
            .presentationBackground(Color(hex: 0x1C2130))
        }

        private func summary(session: Session, book: Book) -> some View {
            HStack(alignment: .top, spacing: Space.s400) {
                BookCover(book: book, width: 56)
                VStack(alignment: .leading, spacing: Space.s200) {
                    SwiftUI.Text(book.title).font(Font.control()).lineLimit(3)
                    // 終了の候補時刻で止めた値を出す。確定までは保存しない。
                    HStack(spacing: Space.s400) {
                        Fact(symbol: "clock", text: Format.duration(session.readingDuration(now: candidate)), color: ReadingInk.secondary)
                        Fact(symbol: "note.text", text: Format.count(store.memos(inSession: session.id).count, "件"), color: ReadingInk.secondary)
                    }
                    SwiftUI.Text("\(Format.time(session.startedAt))〜\(Format.time(candidate))")
                        .font(Font.caption())
                        .foregroundStyle(ReadingInk.secondary)
                }
            }
            .accessibilityElement(children: .combine)
        }
    }
}
