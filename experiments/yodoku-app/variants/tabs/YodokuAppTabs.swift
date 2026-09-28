import SwiftUI

// variant `tabs`: iOS 標準のタブで、読む・本棚・ふりかえり・検索を同じ階層に並べる。
// 読書の入口は下端のアクセサリーに常に置き、どのタブからでも 1 回で読み始め、読書へ戻れる。

struct YodokuAppTabs: View {
    @State private var store = YK.Store.fromLaunchArguments()

    var body: some View {
        Root()
            .environment(store)
            // 端末の言語によらず日本語の画面として確かめる。
            .environment(\.locale, Locale(identifier: "ja_JP"))
            .onAppear { store.autoEndIfNeeded() }
    }
}

extension YodokuAppTabs {
    enum Section: Hashable { case read, shelf, stats, search }

    struct Root: View {
        @Environment(YK.Store.self) private var store
        @State private var section: Section = .read
        @State private var readPath: [YK.Route] = []
        @State private var shelfPath: [YK.Route] = []
        @State private var statsPath: [YK.Route] = []
        @State private var searchPath: [YK.Route] = []
        @State private var adding = false

        var body: some View {
            @Bindable var store = store
            tabs
                .modifier(Accessory(enabled: !store.books.isEmpty))
                .tint(YK.Palette.primary)
                .sheet(isPresented: $adding) { YK.BookLookup() }
                .fullScreenCover(isPresented: $store.isReadingPresented) { Reading() }
            .onAppear { if let route = store.takeLaunchRoute() { readPath.append(route) } }
        }

        private var tabs: some View {
            @Bindable var store = store
            return TabView(selection: $section) {
                Tab("読む", systemImage: "book", value: .read) {
                    NavigationStack(path: $readPath) {
                        Home(path: $readPath, onAdd: { adding = true })
                            .ykRoutes($readPath, onAdd: { adding = true })
                    }
                    .ykUndoBanner(store)
                }
                Tab("本棚", systemImage: "books.vertical", value: .shelf) {
                    NavigationStack(path: $shelfPath) {
                        YK.Bookshelf(onSelect: { shelfPath.append(.book($0)) }, onAdd: { adding = true })
                            .navigationTitle("本棚")
                            .toolbar { addButton }
                            .ykRoutes($shelfPath, onAdd: { adding = true })
                    }
                    .ykUndoBanner(store)
                }
                Tab("ふりかえり", systemImage: "chart.bar", value: .stats) {
                    NavigationStack(path: $statsPath) {
                        YK.Statistics(onSelectBook: { statsPath.append(.book($0)) })
                            .navigationTitle("ふりかえり")
                            .ykRoutes($statsPath, onAdd: { adding = true })
                    }
                }
                Tab(value: .search, role: .search) {
                    NavigationStack(path: $searchPath) {
                        YK.SearchResults(query: store.searchQuery) { searchPath.append(.book($0, focus: $1)) }
                            .navigationTitle("検索")
                            .searchable(text: $store.searchQuery, prompt: "書名、著者、メモ、余韻")
                            .ykRoutes($searchPath, onAdd: { adding = true })
                    }
                }
            }
            .tabBarMinimizeBehavior(.onScrollDown)
        }

        private var addButton: some ToolbarContent {
            ToolbarItem(placement: .topBarTrailing) {
                Button("本を追加", systemImage: "plus") { adding = true }
            }
        }
    }

    /// 下端のアクセサリー。本が 1 冊も無いときは置かない。
    struct Accessory: ViewModifier {
        let enabled: Bool

        func body(content: Content) -> some View {
            if enabled {
                content.tabViewBottomAccessory { AccessoryContent() }
            } else {
                content
            }
        }
    }

    /// 読書中はミニ読書プレイヤー、そうでなければ次に読む本と「読む」。
    struct AccessoryContent: View {
        @Environment(YK.Store.self) private var store
        @Environment(\.tabViewBottomAccessoryPlacement) private var placement

        var body: some View {
            switch store.homeState {
            case .active(let id):
                if let session = store.session(id) {
                    YK.MiniPlayerContent(session: session, compact: placement == .inline)
                }
            case .idle(let bookID):
                if let book = store.book(bookID) {
                    HStack(spacing: YK.Space.s300) {
                        YK.BookCover(book: book, width: placement == .inline ? 20 : 28)
                        VStack(alignment: .leading, spacing: 0) {
                            Text("次に読む").font(YK.Font.caption()).foregroundStyle(.secondary)
                            Text(book.title).font(YK.Font.captionBold()).lineLimit(1)
                        }
                        Spacer(minLength: 0)
                        Button("読む", systemImage: "play.fill") { store.start(book.id) }
                            .labelStyle(.iconOnly)
                            .frame(width: YK.Size.target, height: YK.Size.target)
                            .accessibilityLabel("「\(book.title)」を読む")
                    }
                    .padding(.horizontal, YK.Space.s300)
                }
            case .empty:
                EmptyView()
            }
        }
    }
}
