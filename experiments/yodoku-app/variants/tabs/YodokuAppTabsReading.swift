import SwiftUI

// `tabs` の読書空間。音楽アプリの再生画面と同じ型で、上に本と時間、中央にきろく、下に 3 つの操作を置く。
// 下へ閉じると最小化し、下端のアクセサリーから戻る。

extension YodokuAppTabs {
    struct Reading: View {
        @Environment(YK.Store.self) private var store
        @Environment(\.accessibilityReduceMotion) private var reduceMotion
        @State private var composing: YK.MemoComposer.Target?
        @State private var ending: Date?
        @State private var openPast: Set<UUID> = []

        var body: some View {
            if let session = store.activeSession, let book = store.book(session.bookID) {
                ZStack {
                    YK.ReadingBackground(period: YK.period(store))
                    ScrollView {
                        VStack(alignment: .leading, spacing: YK.Space.s600) {
                            header(session: session, book: book)
                            records(session: session, book: book)
                        }
                        .padding(.horizontal, YK.Space.page)
                        .padding(.bottom, 120)
                    }
                    .scrollIndicators(.hidden)
                }
                .safeAreaInset(edge: .top) { topBar }
                .safeAreaInset(edge: .bottom) { controls(session: session, book: book) }
                .foregroundStyle(YK.ReadingInk.text)
                .tint(YK.ReadingInk.text)
                .sheet(item: $composing) { YK.MemoComposer(target: $0, dark: true) }
                .sheet(item: Binding(get: { ending.map(YK.EndCandidate.init) }, set: { ending = $0?.date })) {
                    YK.EndSessionSheet(candidate: $0.date)
                }
                .onAppear {
                    store.autoEndIfNeeded()
                    if let candidate = store.takeLaunchEnding() { ending = candidate }
                }
                .preferredColorScheme(.dark)
            }
        }

        private var topBar: some View {
            @Bindable var store = store
            return HStack {
                Button("最小化", systemImage: "chevron.down") { store.isReadingPresented = false }
                    .labelStyle(.iconOnly)
                    .frame(width: YK.Size.target, height: YK.Size.target)
                    .accessibilityLabel("読書を最小化してホームへ")
                Spacer()
                YK.ThemeMenu(store: store)
            }
            .padding(.horizontal, YK.Space.s300)
        }

        private func header(session: YK.Session, book: YK.Book) -> some View {
            HStack(alignment: .center, spacing: YK.Space.s400) {
                YK.BookCover(book: book, width: 64)
                VStack(alignment: .leading, spacing: YK.Space.s100) {
                    Text(book.title).font(YK.Font.heading()).lineLimit(3)
                    HStack(alignment: .firstTextBaseline, spacing: YK.Space.s200) {
                        YK.ReadingTime(session: session)
                        Text(YK.stateLabel(session)).font(YK.Font.caption()).foregroundStyle(YK.ReadingInk.secondary)
                    }
                    Text("\(YK.Format.time(session.startedAt)) から").font(YK.Font.caption()).foregroundStyle(YK.ReadingInk.secondary)
                }
            }
            .accessibilityElement(children: .combine)
        }

        /// いまのセッションは常に開き、過去は閉じておく（reading.md R-2）。
        private func records(session: YK.Session, book: YK.Book) -> some View {
            VStack(alignment: .leading, spacing: 0) {
                Text("きろく").font(YK.Font.heading()).accessibilityAddTraits(.isHeader)
                YK.SessionBlock(session: session, ink: .reading)
                if store.memos(inSession: session.id).isEmpty {
                    Text("浮かんだことは下の「メモ」から残せます。")
                        .font(YK.Font.caption())
                        .foregroundStyle(YK.ReadingInk.secondary)
                        .padding(.leading, YK.Space.s600 + YK.Space.s300)
                }
                ForEach(store.sessions(of: book.id).filter { !$0.isActive }) { past in
                    YK.Hairline(color: YK.ReadingInk.line.opacity(0.4))
                    YK.SessionBlock(
                        session: past, ink: .reading,
                        expanded: Binding(
                            get: { openPast.contains(past.id) },
                            set: { if $0 { openPast.insert(past.id) } else { openPast.remove(past.id) } }
                        )
                    )
                }
            }
        }

        private func controls(session: YK.Session, book: YK.Book) -> some View {
            GlassEffectContainer(spacing: YK.Space.s400) {
                HStack(spacing: YK.Space.s1000) {
                    YK.RoundControl(title: session.isPaused ? "再開" : "一時停止", symbol: session.isPaused ? "play.fill" : "pause.fill") {
                        withAnimation(YK.Motion.resolve(YK.Motion.state, reduceMotion: reduceMotion)) {
                            session.isPaused ? store.resume() : store.pause()
                        }
                    }
                    .sensoryFeedback(.impact(weight: .light), trigger: session.isPaused)
                    YK.RoundControl(title: "メモ", symbol: "square.and.pencil", prominent: true) {
                        composing = .session(bookID: book.id, sessionID: session.id)
                    }
                    YK.RoundControl(title: "終える", symbol: "stop.fill") {
                        ending = store.endCandidate()
                    }
                    .sensoryFeedback(.impact(weight: .medium), trigger: ending != nil)
                }
            }
            .padding(.bottom, YK.Space.s200)
        }
    }
}
