import SwiftUI

// variant `bookstand`: 書見台に 1 冊ずつ本を立てる。ホームは本棚の順に本をめくる 1 枚ずつの面で、
// 1 面に 1 冊と 1 つの主操作だけを置く。一覧、検索、ふりかえり、本の追加は上端から開く。

struct YodokuAppBookstand: View {
    @State private var store = YK.Store.fromLaunchArguments()

    var body: some View {
        Root()
            .environment(store)
            // 端末の言語によらず日本語の画面として確かめる。
            .environment(\.locale, Locale(identifier: "ja_JP"))
            .onAppear { store.autoEndIfNeeded() }
    }
}

extension YodokuAppBookstand {
    struct Root: View {
        @Environment(YK.Store.self) private var store
        @State private var path: [YK.Route] = []
        @State private var adding = false
        @State private var searching = false

        var body: some View {
            @Bindable var store = store
            NavigationStack(path: $path) {
                Stand(path: $path, onAdd: { adding = true }, onSearch: { searching = true })
                    .ykRoutes($path, onAdd: { adding = true })
            }
            .ykUndoBanner(store)
            .safeAreaInset(edge: .bottom) {
                // 書見台の面では、読書中の本の面が同じ役目を持つので、押し先の画面でだけ出す。
                if let session = store.activeSession, !store.isReadingPresented, !path.isEmpty {
                    YK.MiniPlayerContent(session: session)
                        .frame(height: 56)
                        .glassEffect(.regular, in: Capsule())
                        .padding(.horizontal, YK.Space.s400)
                        .padding(.bottom, YK.Space.s100)
                }
            }
            .tint(YK.Palette.primary)
            .sheet(isPresented: $adding) { YK.BookLookup() }
            .sheet(isPresented: $searching) {
                SearchSheet { bookID, focus in
                    searching = false
                    path.append(.book(bookID, focus: focus))
                }
            }
            .fullScreenCover(isPresented: $store.isReadingPresented) { Reading() }
            .onAppear { if let route = store.takeLaunchRoute() { path.append(route) } }
        }
    }

    struct Stand: View {
        @Environment(YK.Store.self) private var store
        @Binding var path: [YK.Route]
        let onAdd: () -> Void
        let onSearch: () -> Void
        @State private var selection: UUID?

        var body: some View {
            let books = store.bookshelf
            VStack(spacing: 0) {
                if let id = store.autoEndedSessionID, let session = store.session(id) {
                    YK.AutoEndNotice(session: session) {
                        store.autoEndedSessionID = nil
                        path.append(.session(id))
                    }
                    .padding(.horizontal, YK.Space.page)
                }
                if books.isEmpty {
                    YK.EmptyShelf(onAdd: onAdd)
                        .padding(.horizontal, YK.Space.page)
                    Spacer()
                } else {
                    TabView(selection: $selection) {
                        ForEach(books) { book in
                            Page(book: book) { path.append(.book(book.id)) }
                                .tag(Optional(book.id))
                        }
                    }
                    .tabViewStyle(.page(indexDisplayMode: .never))
                    pageIndex(books: books)
                    if let book = store.book(selection ?? books.first?.id) {
                        action(book)
                    }
                }
            }
            .ykCanvas()
            .onAppear { if selection == nil { selection = books.first?.id } }
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("本棚", systemImage: "square.grid.2x2") { path.append(.shelf) }
                }
                ToolbarItemGroup(placement: .topBarTrailing) {
                    Button("検索", systemImage: "magnifyingglass", action: onSearch)
                    Menu {
                        Button("ふりかえり", systemImage: "chart.bar") { path.append(.stats) }
                        Button("本を追加", systemImage: "plus", action: onAdd)
                    } label: {
                        Label("その他", systemImage: "ellipsis")
                    }
                }
            }
        }

        /// 何冊目かを文字で示す。点の列だけでは冊数が読めない。
        private func pageIndex(books: [YK.Book]) -> some View {
            let index = (books.firstIndex { $0.id == selection } ?? 0) + 1
            return Text("\(index) / \(books.count)")
                .font(YK.Font.caption().monospacedDigit())
                .foregroundStyle(YK.Palette.onSurfaceVariant)
                .padding(.bottom, YK.Space.s300)
                .accessibilityLabel("\(books.count) 冊中 \(index) 冊目。左右にスワイプして本を替えます。")
        }

        /// 面の本に対する主操作。進行中のセッションは 1 つだけなので、別の本を読書中なら理由を出す。
        @ViewBuilder
        private func action(_ book: YK.Book) -> some View {
            VStack(spacing: YK.Space.s200) {
                if let active = store.activeSession {
                    if active.bookID == book.id {
                        Button("読書に戻る") { store.isReadingPresented = true }
                            .buttonStyle(YK.PrimaryButtonStyle())
                    } else {
                        Button("読む") {}.buttonStyle(YK.PrimaryButtonStyle()).disabled(true)
                        Text("「\(store.book(active.bookID)?.title ?? "")」を読書中です。終えてから始められます。")
                            .font(YK.Font.caption())
                            .foregroundStyle(YK.Palette.onSurfaceVariant)
                    }
                } else {
                    Button("読む") { store.start(book.id) }.buttonStyle(YK.PrimaryButtonStyle())
                }
            }
            .padding(.horizontal, YK.Space.page)
            .padding(.bottom, YK.Space.s300)
        }
    }

    /// 1 冊の面。表紙、書名、事実、最後に書いた文の順に置く。
    struct Page: View {
        @Environment(YK.Store.self) private var store
        let book: YK.Book
        let open: () -> Void

        var body: some View {
            ScrollView {
                VStack(spacing: YK.Space.s600) {
                    Button(action: open) {
                        YK.BookCover(book: book, width: 168)
                            .shadow(color: .black.opacity(0.12), radius: 12, y: 6)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("「\(book.title)」の詳細")
                    .padding(.top, YK.Space.s600)
                    VStack(spacing: YK.Space.s200) {
                        Text(book.title).font(YK.Font.title()).multilineTextAlignment(.center)
                        if let author = book.author {
                            Text(author).font(YK.Font.caption()).foregroundStyle(YK.Palette.onSurfaceVariant)
                        }
                        status
                    }
                    if let text = store.latestText(of: book.id) {
                        VStack(spacing: YK.Space.s200) {
                            Text(text.kind == .yoin ? "前回の余韻" : "最後のメモ")
                                .font(YK.Font.caption())
                                .foregroundStyle(YK.Palette.onSurfaceVariant)
                            Text(text.excerpt)
                                .font(YK.Font.body())
                                .lineSpacing(YK.Leading.body)
                                .multilineTextAlignment(.center)
                                .lineLimit(5)
                        }
                        .accessibilityElement(children: .combine)
                    }
                }
                .padding(.horizontal, YK.Space.s1000)
                .padding(.bottom, YK.Space.s600)
            }
            .scrollBounceBehavior(.basedOnSize)
        }

        @ViewBuilder private var status: some View {
            if let session = store.sessions(of: book.id).first(where: \.isActive) {
                HStack(spacing: YK.Space.s200) {
                    Text(YK.stateLabel(session))
                    YK.ReadingTime(session: session, font: YK.Font.captionBold().monospacedDigit())
                }
                .font(YK.Font.captionBold())
            } else {
                let count = store.sessions(of: book.id).count
                let parts: [String] = [
                    store.lastRead(book, now: .now).flatMap { if case .ago(let s) = $0 { "\(s)に読んだ" } else { nil } },
                    store.cycleLabel(book),
                    count > 0 ? YK.Format.count(count, "回") : "まだ読んでいません",
                ].compactMap { $0 }
                Text(parts.joined(separator: "、"))
                    .font(YK.Font.caption())
                    .foregroundStyle(YK.Palette.onSurfaceVariant)
                    .multilineTextAlignment(.center)
            }
        }
    }

    struct SearchSheet: View {
        @Environment(YK.Store.self) private var store
        @Environment(\.dismiss) private var dismiss
        let onSelect: (UUID, UUID?) -> Void

        var body: some View {
            @Bindable var store = store
            NavigationStack {
                YK.SearchResults(query: store.searchQuery, onSelect: onSelect)
                    .navigationTitle("検索")
                    .navigationBarTitleDisplayMode(.inline)
                    .searchable(text: $store.searchQuery, placement: .navigationBarDrawer(displayMode: .always), prompt: "書名、著者、メモ、余韻")
                    .toolbar { ToolbarItem(placement: .cancellationAction) { Button("閉じる", systemImage: "xmark") { dismiss() } } }
            }
        }
    }
}
