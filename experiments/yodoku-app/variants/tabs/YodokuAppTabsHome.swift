import SwiftUI

// `tabs` の「読む」タブ。いまの本、最近書いたこと、最近の本の順に置く。

extension YodokuAppTabs {
    struct Home: View {
        @Environment(YK.Store.self) private var store
        @Binding var path: [YK.Route]
        let onAdd: () -> Void

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: YK.Space.section) {
                    if let id = store.autoEndedSessionID, let session = store.session(id) {
                        YK.AutoEndNotice(session: session) {
                            store.autoEndedSessionID = nil
                            path.append(.session(id))
                        }
                    }
                    switch store.homeState {
                    case .empty:
                        YK.EmptyShelf(onAdd: onAdd)
                    case .idle(let bookID):
                        if let book = store.book(bookID) { hero(book: book, session: nil) }
                    case .active(let id):
                        if let session = store.session(id), let book = store.book(session.bookID) {
                            hero(book: book, session: session)
                        }
                    }
                    recentTexts
                    recentBooks
                }
                .padding(.horizontal, YK.Space.page)
                .padding(.bottom, YK.Space.s1000)
            }
            .ykCanvas()
            .navigationTitle("読む")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("本を追加", systemImage: "plus", action: onAdd)
                }
            }
        }

        private func hero(book: YK.Book, session: YK.Session?) -> some View {
            VStack(alignment: .leading, spacing: YK.Space.s400) {
                HStack(alignment: .bottom, spacing: YK.Space.s400) {
                    Button { path.append(.book(book.id)) } label: {
                        YK.BookCover(book: book, width: 104)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("「\(book.title)」の詳細")
                    VStack(alignment: .leading, spacing: YK.Space.s200) {
                        Text(session == nil ? "次に読む" : YK.stateLabel(session!))
                            .font(YK.Font.caption())
                            .foregroundStyle(YK.Palette.onSurfaceVariant)
                        Text(book.title).font(YK.Font.title())
                        if let author = book.author {
                            Text(author).font(YK.Font.caption()).foregroundStyle(YK.Palette.onSurfaceVariant)
                        }
                        if let session {
                            YK.ReadingTime(session: session)
                        } else {
                            YK.Fact(symbol: "clock", text: "これまで \(YK.Format.duration(store.totalReading(book.id)))")
                        }
                    }
                }
                if let text = store.latestText(of: book.id) {
                    VStack(alignment: .leading, spacing: YK.Space.s100) {
                        Text(text.kind == .yoin ? "前回の余韻" : "最後のメモ")
                            .font(YK.Font.caption()).foregroundStyle(YK.Palette.onSurfaceVariant)
                        Text(text.excerpt).font(YK.Font.body()).lineSpacing(YK.Leading.body).lineLimit(4)
                    }
                    .accessibilityElement(children: .combine)
                }
                if session != nil {
                    Button("読書に戻る") { store.isReadingPresented = true }
                        .buttonStyle(YK.PrimaryButtonStyle())
                } else {
                    Button("読む") { store.start(book.id) }
                        .buttonStyle(YK.PrimaryButtonStyle())
                }
            }
            .padding(.top, YK.Space.s200)
        }

        @ViewBuilder private var recentTexts: some View {
            // 上の本で見せた最新の文は繰り返さない。
            let shown = heroBookID.flatMap { store.latestText(of: $0)?.id }
            let texts = Array(store.recentTexts().filter { $0.id != shown }.prefix(3))
            if !texts.isEmpty {
                VStack(alignment: .leading, spacing: YK.Space.s400) {
                    YK.SectionTitle(title: "最近書いたこと")
                    ForEach(texts) { hit in
                        Button { path.append(.book(hit.bookID, focus: hit.id)) } label: {
                            YK.TextHitRow(hit: hit, lineLimit: 3)
                        }
                        .buttonStyle(.plain)
                        YK.Hairline()
                    }
                }
            }
        }

        private var heroBookID: UUID? {
            switch store.homeState {
            case .empty: nil
            case .idle(let id): id
            case .active(let id): store.session(id)?.bookID
            }
        }

        @ViewBuilder private var recentBooks: some View {
            let books = Array(store.bookshelf.prefix(8))
            if !books.isEmpty {
                VStack(alignment: .leading, spacing: YK.Space.s300) {
                    YK.SectionTitle(title: "最近の本")
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(alignment: .top, spacing: YK.Space.s400) {
                            ForEach(books) { book in
                                Button { path.append(.book(book.id)) } label: {
                                    VStack(alignment: .leading, spacing: YK.Space.s150) {
                                        YK.BookCover(book: book, width: 88)
                                        Text(book.title).font(YK.Font.caption()).lineLimit(2).frame(width: 88, alignment: .leading)
                                    }
                                }
                                .buttonStyle(.plain)
                                .accessibilityElement(children: .combine)
                            }
                        }
                        .padding(.horizontal, YK.Space.page)
                    }
                    .padding(.horizontal, -YK.Space.page)
                }
            }
        }
    }
}
