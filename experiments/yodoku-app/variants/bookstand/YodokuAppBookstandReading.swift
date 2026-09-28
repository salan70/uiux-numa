import SwiftUI

// `bookstand` の読書空間。画面の中央に本と、いま書いた最後の 1 文だけを置き、ほかの文章はシートへ退ける。
// 顔を上げたときに目に入るものを最小にする。

extension YodokuAppBookstand {
    struct Reading: View {
        @Environment(YK.Store.self) private var store
        @Environment(\.accessibilityReduceMotion) private var reduceMotion
        @State private var composing: YK.MemoComposer.Target?
        @State private var ending: Date?
        @State private var recordsOpen = false

        var body: some View {
            if let session = store.activeSession, let book = store.book(session.bookID) {
                ZStack {
                    YK.ReadingBackground(period: YK.period(store))
                    ScrollView {
                        center(session: session, book: book)
                            .padding(.horizontal, YK.Space.s1000)
                            .containerRelativeFrame(.vertical, alignment: .center)
                    }
                    .scrollBounceBehavior(.basedOnSize)
                }
                .safeAreaInset(edge: .top) { topBar }
                .safeAreaInset(edge: .bottom) { controls(session: session, book: book) }
                .foregroundStyle(YK.ReadingInk.text)
                .tint(YK.ReadingInk.text)
                .sheet(item: $composing) { YK.MemoComposer(target: $0, dark: true) }
                .sheet(isPresented: $recordsOpen) { YK.ReadingRecords(bookID: book.id) }
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
                    .accessibilityLabel("読書を最小化して書見台へ")
                Spacer()
                YK.ThemeMenu(store: store)
            }
            .padding(.horizontal, YK.Space.s300)
        }

        private func center(session: YK.Session, book: YK.Book) -> some View {
            let memos = store.memos(inSession: session.id)
            return VStack(spacing: YK.Space.s1000) {
                VStack(spacing: YK.Space.s200) {
                    Text(book.title).font(YK.Font.heading()).multilineTextAlignment(.center)
                    HStack(spacing: YK.Space.s200) {
                        Text(YK.stateLabel(session))
                        YK.ReadingTime(session: session, font: YK.Font.ui().monospacedDigit())
                    }
                    .font(YK.Font.ui())
                    .foregroundStyle(YK.ReadingInk.secondary)
                    Text("\(YK.Format.time(session.startedAt)) から").font(YK.Font.caption()).foregroundStyle(YK.ReadingInk.secondary)
                }
                .accessibilityElement(children: .combine)
                VStack(spacing: YK.Space.s300) {
                    if let last = memos.last {
                        Text("さっき書いたこと").font(YK.Font.caption()).foregroundStyle(YK.ReadingInk.secondary)
                        Text(last.body)
                            .font(YK.Font.title())
                            .lineSpacing(YK.Leading.tight)
                            .multilineTextAlignment(.center)
                    } else {
                        Text("浮かんだことは「メモ」から残せます。")
                            .font(YK.Font.body())
                            .foregroundStyle(YK.ReadingInk.secondary)
                    }
                    Button("きろくを見る（メモ \(YK.Format.count(memos.count, "件"))）") { recordsOpen = true }
                        .font(YK.Font.caption())
                        .foregroundStyle(YK.ReadingInk.secondary)
                        .frame(minHeight: YK.Size.target)
                }
            }
        }

        private func controls(session: YK.Session, book: YK.Book) -> some View {
            GlassEffectContainer(spacing: YK.Space.s400) {
                HStack(alignment: .center, spacing: YK.Space.s1000) {
                    YK.RoundControl(title: session.isPaused ? "再開" : "一時停止", symbol: session.isPaused ? "play.fill" : "pause.fill") {
                        withAnimation(YK.Motion.resolve(YK.Motion.state, reduceMotion: reduceMotion)) {
                            session.isPaused ? store.resume() : store.pause()
                        }
                    }
                    .sensoryFeedback(.impact(weight: .light), trigger: session.isPaused)
                    YK.RoundControl(title: "メモ", symbol: "square.and.pencil", prominent: true) {
                        composing = .session(bookID: book.id, sessionID: session.id)
                    }
                    YK.RoundControl(title: "終える", symbol: "stop.fill") { ending = store.endCandidate() }
                        .sensoryFeedback(.impact(weight: .medium), trigger: ending != nil)
                }
            }
            .padding(.bottom, YK.Space.s400)
        }
    }
}
