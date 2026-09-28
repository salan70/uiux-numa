import SwiftUI

// variant `journal`: 書いた文章を時系列に並べた 1 本の帳面をホームにする。
// 本はその上端の「いま」と、文章に添えた書名から開く。検索は帳面を引いて出す。

struct YodokuAppJournal: View {
    @State private var store = YK.Store.fromLaunchArguments()

    var body: some View {
        Root()
            .environment(store)
            // 端末の言語によらず日本語の画面として確かめる。
            .environment(\.locale, Locale(identifier: "ja_JP"))
            .onAppear { store.autoEndIfNeeded() }
    }
}

extension YodokuAppJournal {
    struct Root: View {
        @Environment(YK.Store.self) private var store
        @State private var path: [YK.Route] = []
        @State private var adding = false

        var body: some View {
            @Bindable var store = store
            NavigationStack(path: $path) {
                Journal(path: $path, onAdd: { adding = true })
                    .ykRoutes($path, onAdd: { adding = true })
            }
            .ykUndoBanner(store)
            .safeAreaInset(edge: .bottom) {
                if let session = store.activeSession, !store.isReadingPresented {
                    YK.MiniPlayerContent(session: session)
                        .frame(height: 56)
                        .glassEffect(.regular, in: Capsule())
                        .padding(.horizontal, YK.Space.s400)
                        .padding(.bottom, YK.Space.s100)
                }
            }
            .tint(YK.Palette.primary)
            .sheet(isPresented: $adding) { YK.BookLookup() }
            .fullScreenCover(isPresented: $store.isReadingPresented) { Reading() }
            .onAppear { if let route = store.takeLaunchRoute() { path.append(route) } }
        }
    }

    struct Journal: View {
        @Environment(YK.Store.self) private var store
        @Binding var path: [YK.Route]
        let onAdd: () -> Void

        var body: some View {
            @Bindable var store = store
            Group {
                if store.searchQuery.trimmingCharacters(in: .whitespaces).isEmpty {
                    feed
                } else {
                    YK.SearchResults(query: store.searchQuery) { path.append(.book($0, focus: $1)) }
                }
            }
            .navigationTitle("きろく")
            .searchable(text: $store.searchQuery, placement: .navigationBarDrawer, prompt: "書名、著者、メモ、余韻")
            .toolbar {
                ToolbarItemGroup(placement: .topBarLeading) {
                    Button("本棚", systemImage: "books.vertical") { path.append(.shelf) }
                    Button("ふりかえり", systemImage: "chart.bar") { path.append(.stats) }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("本を追加", systemImage: "plus", action: onAdd)
                }
            }
        }

        private var feed: some View {
            ScrollView {
                LazyVStack(alignment: .leading, spacing: YK.Space.s600) {
                    if let id = store.autoEndedSessionID, let session = store.session(id) {
                        YK.AutoEndNotice(session: session) {
                            store.autoEndedSessionID = nil
                            path.append(.session(id))
                        }
                    }
                    if store.books.isEmpty {
                        YK.EmptyShelf(onAdd: onAdd)
                    } else {
                        now
                        entries
                    }
                }
                .padding(.horizontal, YK.Space.page)
                .padding(.bottom, YK.Space.s2000)
            }
            .ykCanvas()
        }

        /// 帳面の上端。いま読んでいる本か、次に読む本を 1 行で示す。
        @ViewBuilder private var now: some View {
            let session = store.activeSession
            let bookID: UUID? = session?.bookID ?? {
                if case .idle(let id) = store.homeState { return id }
                return nil
            }()
            if let bookID, let book = store.book(bookID) {
                VStack(alignment: .leading, spacing: YK.Space.s300) {
                    Text(session.map(YK.stateLabel) ?? "次に読む")
                        .font(YK.Font.caption())
                        .foregroundStyle(YK.Palette.onSurfaceVariant)
                    HStack(alignment: .center, spacing: YK.Space.s300) {
                        Button { path.append(.book(book.id)) } label: {
                            HStack(spacing: YK.Space.s300) {
                                YK.BookCover(book: book, width: 44)
                                VStack(alignment: .leading, spacing: YK.Space.s50) {
                                    Text(book.title).font(YK.Font.control()).lineLimit(2)
                                    if let session {
                                        YK.ReadingTime(session: session, font: YK.Font.caption().monospacedDigit())
                                            .foregroundStyle(YK.Palette.onSurfaceVariant)
                                    } else if let last = store.lastRead(book, now: .now), case .ago(let ago) = last {
                                        Text(ago).font(YK.Font.caption()).foregroundStyle(YK.Palette.onSurfaceVariant)
                                    }
                                }
                                Spacer(minLength: 0)
                            }
                            .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                        if session != nil {
                            Button("戻る") { store.isReadingPresented = true }
                                .buttonStyle(YK.SecondaryButtonStyle(fill: YK.Palette.primary, ink: YK.Palette.onPrimary))
                                .accessibilityLabel("読書に戻る")
                        } else {
                            Button("読む") { store.start(book.id) }
                                .buttonStyle(YK.SecondaryButtonStyle(fill: YK.Palette.primary, ink: YK.Palette.onPrimary))
                                .accessibilityLabel("「\(book.title)」を読む")
                        }
                    }
                }
                .padding(.top, YK.Space.s200)
                YK.Hairline()
            }
        }

        /// メモと余韻を日ごとにまとめ、新しい日から並べる。
        @ViewBuilder private var entries: some View {
            let texts = store.recentTexts()
            if texts.isEmpty {
                Text("まだ書いたことがありません。読書中のメモと余韻がここに並びます。")
                    .font(YK.Font.ui())
                    .foregroundStyle(YK.Palette.onSurfaceVariant)
            }
            let days = Dictionary(grouping: texts) { YK.Format.calendar.startOfDay(for: $0.createdAt) }
            ForEach(days.keys.sorted(by: >), id: \.self) { day in
                VStack(alignment: .leading, spacing: YK.Space.s400) {
                    Text(YK.Format.date(day))
                        .font(YK.Font.captionBold())
                        .foregroundStyle(YK.Palette.onSurfaceVariant)
                        .accessibilityAddTraits(.isHeader)
                    ForEach(days[day] ?? []) { hit in
                        Entry(hit: hit) { path.append(.book(hit.bookID, focus: hit.id)) }
                    }
                }
            }
        }
    }

    /// 帳面の 1 件。文章を主役にし、書名は出どころとして後に添える。
    struct Entry: View {
        @Environment(YK.Store.self) private var store
        let hit: YK.TextHit
        let open: () -> Void

        var body: some View {
            Button(action: open) {
                VStack(alignment: .leading, spacing: YK.Space.s150) {
                    if hit.kind == .yoin {
                        Label("余韻", systemImage: "text.quote").font(YK.Font.caption()).foregroundStyle(YK.Palette.onSurfaceVariant)
                    }
                    Text(hit.excerpt)
                        .font(YK.Font.body())
                        .lineSpacing(YK.Leading.body)
                        .multilineTextAlignment(.leading)
                    Text("\(store.book(hit.bookID)?.title ?? "")、\(YK.Format.time(hit.createdAt))")
                        .font(YK.Font.caption())
                        .foregroundStyle(YK.Palette.onSurfaceVariant)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.leading, YK.Space.s300)
                .overlay(alignment: .leading) {
                    Rectangle().fill(YK.Palette.hairline).frame(width: 2)
                }
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityElement(children: .combine)
        }
    }
}
