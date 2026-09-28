import SwiftUI

// 本の詳細。book-detail.md。
// 変えた点: 読書中でも本詳細を開ける。別の本を読書中なら「読む」を押せない理由を文字で出す（session.md R-7 は守る）。

extension YK {
    struct BookDetail: View {
        @Environment(Store.self) private var store
        @Environment(\.dismiss) private var dismiss
        let bookID: UUID
        /// 検索から開いたとき、該当のメモや余韻まで送る（search.md R-8）。
        var focusID: UUID?

        @State private var newestFirst = true
        @State private var collapsed: Set<UUID> = []
        @State private var composing = false
        @State private var editing = false
        @State private var confirmDelete = false

        var body: some View {
            if let book = store.book(bookID) {
                ScrollViewReader { proxy in
                    ScrollView {
                        VStack(alignment: .leading, spacing: Space.section) {
                            header(book)
                            timeline(book)
                        }
                        .padding(.horizontal, Space.page)
                        .padding(.bottom, Space.s1000)
                    }
                    .onAppear {
                        guard let focusID else { return }
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                            withAnimation { proxy.scrollTo(focusID, anchor: .center) }
                        }
                    }
                }
                .ykCanvas()
                .navigationBarTitleDisplayMode(.inline)
                .toolbar { menu(book) }
                .safeAreaInset(edge: .bottom) { readAction(book) }
                .sheet(isPresented: $composing) { MemoComposer(target: .book(book.id)) }
                .sheet(isPresented: $editing) { BookEditor(book: book) }
                .confirmationDialog("「\(book.title)」を削除しますか？", isPresented: $confirmDelete, titleVisibility: .visible) {
                    Button("削除", role: .destructive) {
                        dismiss()
                        store.deleteBook(book.id)
                    }
                } message: {
                    SwiftUI.Text("この本のセッション、メモ、余韻もすべて消えます。直後だけ取り消せます。")
                }
            }
        }

        private func header(_ book: Book) -> some View {
            VStack(alignment: .leading, spacing: Space.s600) {
                HStack(alignment: .bottom, spacing: Space.s400) {
                    BookCover(book: book, width: 88)
                    VStack(alignment: .leading, spacing: Space.s200) {
                        SwiftUI.Text(book.title)
                            .font(Font.heading())
                            .accessibilityAddTraits(.isHeader)
                        if let author = book.author {
                            SwiftUI.Text(author).font(Font.caption()).foregroundStyle(Palette.onSurfaceVariant)
                        }
                    }
                }
                let sessions = store.sessions(of: book.id)
                ViewThatFits(in: .horizontal) {
                    HStack(spacing: Space.s600) { summaryValues(book, sessions: sessions) }
                    VStack(alignment: .leading, spacing: Space.s300) { summaryValues(book, sessions: sessions) }
                }
            }
            .padding(.top, Space.s400)
        }

        @ViewBuilder
        private func summaryValues(_ book: Book, sessions: [Session]) -> some View {
            SummaryValue(label: "セッション", value: Format.count(sessions.count, "回"))
            SummaryValue(label: "読書時間", value: Format.duration(store.totalReading(book.id)))
            SummaryValue(label: "読了", value: Format.count(book.finishedDates.count, "回"))
        }

        private func timeline(_ book: Book) -> some View {
            let items = store.timeline(of: book.id, newestFirst: newestFirst)
            return VStack(alignment: .leading, spacing: 0) {
                SectionTitle(title: "きろく", trailing: AnyView(
                    Menu {
                        Picker("並び順", selection: $newestFirst) {
                            SwiftUI.Text("新しい順").tag(true)
                            SwiftUI.Text("古い順").tag(false)
                        }
                    } label: {
                        Label(newestFirst ? "新しい順" : "古い順", systemImage: "arrow.up.arrow.down")
                            .font(Font.caption())
                            .frame(minHeight: Size.target)
                    }
                ))
                if items.isEmpty {
                    SwiftUI.Text("まだ読書がありません。下の「読む」から始められます。")
                        .font(Font.ui())
                        .foregroundStyle(Palette.onSurfaceVariant)
                        .padding(.top, Space.s400)
                }
                ForEach(items) { item in
                    Hairline()
                    switch item {
                    case .session(let session):
                        SessionBlock(
                            session: session, ink: .canvas,
                            expanded: Binding(
                                get: { !collapsed.contains(session.id) },
                                set: { open in if open { collapsed.remove(session.id) } else { collapsed.insert(session.id) } }
                            ),
                            detail: session.isActive ? nil : AnyView(
                                NavigationLink {
                                    SessionDetail(sessionID: session.id)
                                } label: {
                                    Image(systemName: "chevron.right")
                                        .foregroundStyle(Palette.outline)
                                        .frame(width: Size.target, height: Size.target)
                                }
                                .accessibilityLabel("セッションの詳細")
                            ),
                            focusID: focusID
                        )
                    case .memo(let memo):
                        HStack(alignment: .firstTextBaseline, spacing: Space.s300) {
                            Image(systemName: "square.and.pencil").frame(width: Space.s600).foregroundStyle(Palette.onSurfaceVariant)
                                .accessibilityHidden(true)
                            MemoRow(memo: memo, ink: .canvas, actions: true, showsDate: true)
                        }
                        .padding(.vertical, Space.s400)
                        .id(memo.id)
                    case .finished(let date):
                        HStack(spacing: Space.s300) {
                            Image(systemName: "checkmark.circle").frame(width: Space.s600).accessibilityHidden(true)
                            SwiftUI.Text("\(Format.date(date)) に読了").font(Font.ui())
                            Spacer()
                        }
                        .padding(.vertical, Space.s400)
                        .contextMenu {
                            Button("読了を取り消す", systemImage: "arrow.uturn.backward") { store.removeFinish(bookID: book.id, date: date) }
                        }
                        .accessibilityAction(named: "読了を取り消す") { store.removeFinish(bookID: book.id, date: date) }
                    }
                }
            }
        }

        @ToolbarContentBuilder
        private func menu(_ book: Book) -> some ToolbarContent {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Button("メモを書く", systemImage: "square.and.pencil") { composing = true }
                    if book.hasStorePage {
                        Link(destination: URL(string: "https://books.rakuten.co.jp/")!) {
                            Label("楽天ブックスで見る", systemImage: "arrow.up.right.square")
                        }
                    }
                    Button("本の情報を編集", systemImage: "pencil") { editing = true }
                    Button("本を削除", systemImage: "trash", role: .destructive) { confirmDelete = true }
                } label: {
                    Label("その他", systemImage: "ellipsis")
                }
            }
        }

        /// book-detail.md R-14 の主操作。進行中のセッションは 1 つだけ（session.md R-7）。
        @ViewBuilder
        private func readAction(_ book: Book) -> some View {
            VStack(spacing: Space.s200) {
                if let active = store.activeSession {
                    if active.bookID == book.id {
                        Button("読書に戻る") { store.isReadingPresented = true }
                            .buttonStyle(PrimaryButtonStyle())
                    } else {
                        Button("読む") {}
                            .buttonStyle(PrimaryButtonStyle())
                            .disabled(true)
                        SwiftUI.Text("「\(store.book(active.bookID)?.title ?? "")」を読書中です。終えてから始められます。")
                            .font(Font.caption())
                            .foregroundStyle(Palette.onSurfaceVariant)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                } else {
                    Button("読む") { store.start(book.id) }
                        .buttonStyle(PrimaryButtonStyle())
                }
            }
            .padding(.horizontal, Space.page)
            .padding(.vertical, Space.s300)
            .background(.bar)
        }
    }

    struct SummaryValue: View {
        let label: String
        let value: String

        var body: some View {
            VStack(alignment: .leading, spacing: Space.s100) {
                SwiftUI.Text(label).font(Font.caption()).foregroundStyle(Palette.onSurfaceVariant)
                SwiftUI.Text(value).font(Font.control().monospacedDigit())
            }
            .accessibilityElement(children: .combine)
        }
    }

    /// 書名と著者の編集。book-add.md と同じ正規化（book-detail.md R-8）。
    struct BookEditor: View {
        @Environment(Store.self) private var store
        @Environment(\.dismiss) private var dismiss
        let book: Book
        @State private var title = ""
        @State private var author = ""
        @State private var tried = false

        var body: some View {
            NavigationStack {
                Form {
                    Section {
                        TextField("書名", text: $title)
                        if tried, title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                            SwiftUI.Text("書名を入力してください。").font(Font.caption()).foregroundStyle(Palette.error)
                        }
                        TextField("著者（任意）", text: $author)
                    }
                }
                .navigationTitle("本の情報")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) { Button("キャンセル", systemImage: "xmark") { dismiss() } }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("保存", systemImage: "checkmark") {
                            tried = true
                            if store.updateBook(book.id, title: title, author: author) { dismiss() }
                        }
                    }
                }
            }
            .onAppear {
                title = book.title
                author = book.author ?? ""
            }
        }
    }
}
