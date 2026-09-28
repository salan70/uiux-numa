import SwiftUI

// セッション詳細。session-detail.md。終了済みのセッションだけを開く。

extension YK {
    struct SessionDetail: View {
        @Environment(Store.self) private var store
        @Environment(\.dismiss) private var dismiss
        let sessionID: UUID

        @State private var composing = false
        @State private var editingYoin = false
        @State private var confirmDelete = false
        @State private var rejected = false

        var body: some View {
            if let session = store.session(sessionID), let book = store.book(session.bookID), let end = session.endedAt {
                ScrollView {
                    VStack(alignment: .leading, spacing: Space.section) {
                        header(session: session, book: book)
                        times(session: session, end: end)
                        memos(session: session)
                        yoin(session: session)
                    }
                    .padding(.horizontal, Space.page)
                    .padding(.vertical, Space.s400)
                }
                .ykCanvas()
                .navigationTitle("セッション")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Menu {
                            if store.isFinishingSession(session) {
                                Button("読了を取り消す", systemImage: "arrow.uturn.backward") {
                                    store.removeFinish(bookID: book.id, date: end)
                                }
                            }
                            Button("セッションを削除", systemImage: "trash", role: .destructive) {
                                let hasChildren = !store.memos(inSession: session.id).isEmpty || store.yoin(of: session.id) != nil
                                if hasChildren { confirmDelete = true } else { delete(session) }
                            }
                        } label: {
                            Label("その他", systemImage: "ellipsis")
                        }
                    }
                }
                .confirmationDialog("このセッションを削除しますか？", isPresented: $confirmDelete, titleVisibility: .visible) {
                    Button("削除", role: .destructive) { delete(session) }
                } message: {
                    SwiftUI.Text("メモ \(store.memos(inSession: session.id).count) 件と余韻も消えます。直後だけ取り消せます。")
                }
                .sheet(isPresented: $composing) {
                    MemoComposer(target: .session(bookID: book.id, sessionID: session.id))
                }
                .sheet(isPresented: $editingYoin) {
                    YoinEditor(sessionID: session.id)
                }
            }
        }

        private func delete(_ session: Session) {
            dismiss()
            store.deleteSession(session.id)
        }

        private func header(session: Session, book: Book) -> some View {
            VStack(alignment: .leading, spacing: Space.s400) {
                HStack(spacing: Space.s300) {
                    BookCover(book: book, width: 40)
                    VStack(alignment: .leading, spacing: Space.s50) {
                        SwiftUI.Text(book.title).font(Font.control())
                        if let author = book.author {
                            SwiftUI.Text(author).font(Font.caption()).foregroundStyle(Palette.onSurfaceVariant)
                        }
                    }
                }
                HStack(alignment: .firstTextBaseline, spacing: Space.s200) {
                    let period = ReadingPeriod.at(session.startedAt)
                    Image(systemName: period.symbol).accessibilityLabel(period.label)
                    SwiftUI.Text(Format.date(session.startedAt)).font(Font.heading()).accessibilityAddTraits(.isHeader)
                    if store.isFinishingSession(session) {
                        Fact(symbol: "checkmark.circle", text: "読了", color: Palette.onSurface)
                    }
                }
                SummaryValue(label: "読書時間", value: Format.duration(session.readingDuration(now: .now)))
            }
        }

        /// session-detail.md R-3〜R-6: 変えるたびに保存し、範囲外なら元の値に戻して理由を出す。
        private func times(session: Session, end: Date) -> some View {
            VStack(alignment: .leading, spacing: Space.s200) {
                SectionTitle(title: "時刻")
                DatePicker("開始", selection: Binding(
                    get: { session.startedAt },
                    set: { rejected = !store.updateTimes(session.id, start: $0, end: end) }
                ), in: ...Date.now)
                DatePicker("終了", selection: Binding(
                    get: { end },
                    set: { rejected = !store.updateTimes(session.id, start: session.startedAt, end: $0) }
                ), in: ...Date.now)
                // 理由の行は常に確保し、出ても下の要素を動かさない（States & Feedback）。
                SwiftUI.Text(rejected ? "終了は開始より後、かつ今より前にしてください。" : " ")
                    .font(Font.caption())
                    .foregroundStyle(Palette.error)
                    .accessibilityHidden(!rejected)
            }
            .font(Font.ui())
        }

        private func memos(session: Session) -> some View {
            let list = store.memos(inSession: session.id)
            return VStack(alignment: .leading, spacing: Space.s400) {
                SectionTitle(title: "メモ", trailing: AnyView(
                    Button("メモを追加", systemImage: "square.and.pencil") { composing = true }
                        .font(Font.caption())
                        .frame(minHeight: Size.target)
                ))
                if list.isEmpty {
                    SwiftUI.Text("このセッションのメモはありません。").font(Font.ui()).foregroundStyle(Palette.onSurfaceVariant)
                }
                ForEach(list) { memo in
                    MemoRow(memo: memo, ink: .canvas, actions: true)
                    Hairline()
                }
                if !list.isEmpty {
                    SwiftUI.Text("長押しで編集と削除ができます。").font(Font.caption()).foregroundStyle(Palette.onSurfaceVariant)
                }
            }
        }

        private func yoin(session: Session) -> some View {
            VStack(alignment: .leading, spacing: Space.s400) {
                SectionTitle(title: "余韻")
                if let yoin = store.yoin(of: session.id) {
                    SwiftUI.Text(yoin.body).font(Font.body()).lineSpacing(Leading.body)
                    Button("余韻を編集", systemImage: "pencil") { editingYoin = true }
                        .buttonStyle(SecondaryButtonStyle())
                } else {
                    Button("余韻を残す", systemImage: "text.quote") { editingYoin = true }
                        .buttonStyle(SecondaryButtonStyle())
                }
            }
        }
    }

    /// 余韻の作成と編集。session-detail.md R-9、R-10: 空で保存しようとしたら削除の確認を出す。
    struct YoinEditor: View {
        @Environment(Store.self) private var store
        @Environment(\.dismiss) private var dismiss
        let sessionID: UUID
        @State private var text = ""
        @State private var confirmDelete = false

        var body: some View {
            NavigationStack {
                TextField("", text: $text, prompt: SwiftUI.Text("読み終えて残ったこと"), axis: .vertical)
                    .font(Font.body())
                    .lineSpacing(Leading.body)
                    .padding(.horizontal, Space.page)
                    .frame(maxHeight: .infinity, alignment: .top)
                    .navigationTitle("余韻")
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar {
                        ToolbarItem(placement: .cancellationAction) { Button("キャンセル", systemImage: "xmark") { dismiss() } }
                        ToolbarItem(placement: .confirmationAction) {
                            Button("保存", systemImage: "checkmark") {
                                if store.saveYoin(sessionID: sessionID, body: text) {
                                    dismiss()
                                } else if store.yoin(of: sessionID) != nil {
                                    confirmDelete = true
                                } else {
                                    dismiss()
                                }
                            }
                        }
                    }
                    .confirmationDialog("余韻を削除しますか？", isPresented: $confirmDelete, titleVisibility: .visible) {
                        Button("削除", role: .destructive) {
                            store.deleteYoin(sessionID: sessionID)
                            dismiss()
                        }
                    } message: {
                        SwiftUI.Text("本文が空のため、保存すると余韻が消えます。直後だけ取り消せます。")
                    }
            }
            .presentationDetents([.medium, .large])
            .onAppear { text = store.yoin(of: sessionID)?.body ?? "" }
        }
    }
}
