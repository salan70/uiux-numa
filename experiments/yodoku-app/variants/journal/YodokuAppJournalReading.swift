import SwiftUI

// `journal` の読書空間。帳面の 1 ページとして、いまのセッションの文章を本文に置き、書く欄を下端に常に開いておく。
// 時間と操作は上端に小さくまとめ、この本のきろくはシートで開く。

extension YodokuAppJournal {
    struct Reading: View {
        @Environment(YK.Store.self) private var store
        @State private var ending: Date?
        @State private var pastOpen = false

        var body: some View {
            if let session = store.activeSession, let book = store.book(session.bookID) {
                ZStack {
                    YK.ReadingBackground(period: YK.period(store))
                    ScrollViewReader { proxy in
                        ScrollView {
                            page(session: session, book: book)
                                .padding(.horizontal, YK.Space.page)
                                .padding(.bottom, YK.Space.s600)
                        }
                        .scrollIndicators(.hidden)
                        .scrollDismissesKeyboard(.interactively)
                        .onChange(of: store.memos(inSession: session.id).count) {
                            withAnimation { proxy.scrollTo("end", anchor: .bottom) }
                        }
                    }
                }
                .safeAreaInset(edge: .top) { topBar(session: session, book: book) }
                .safeAreaInset(edge: .bottom) { Composer(session: session) }
                .foregroundStyle(YK.ReadingInk.text)
                .tint(YK.ReadingInk.text)
                .sheet(isPresented: $pastOpen) { YK.ReadingRecords(bookID: book.id) }
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

        private func topBar(session: YK.Session, book: YK.Book) -> some View {
            @Bindable var store = store
            return HStack(spacing: YK.Space.s100) {
                Button("最小化", systemImage: "chevron.down") { store.isReadingPresented = false }
                    .labelStyle(.iconOnly)
                    .frame(width: YK.Size.target, height: YK.Size.target)
                    .accessibilityLabel("読書を最小化してきろくへ")
                VStack(alignment: .leading, spacing: 0) {
                    HStack(spacing: YK.Space.s150) {
                        Text(YK.stateLabel(session))
                        YK.ReadingTime(session: session, font: YK.Font.captionBold().monospacedDigit())
                    }
                    .font(YK.Font.captionBold())
                    Text("\(YK.Format.time(session.startedAt)) から").font(YK.Font.caption()).foregroundStyle(YK.ReadingInk.secondary)
                }
                .accessibilityElement(children: .combine)
                Spacer(minLength: 0)
                Button(session.isPaused ? "再開" : "一時停止", systemImage: session.isPaused ? "play.fill" : "pause.fill") {
                    session.isPaused ? store.resume() : store.pause()
                }
                .labelStyle(.iconOnly)
                .frame(width: YK.Size.target, height: YK.Size.target)
                .sensoryFeedback(.impact(weight: .light), trigger: session.isPaused)
                YK.ThemeMenu(store: store)
                Button("終える") { ending = store.endCandidate() }
                    .buttonStyle(.glass)
                    .font(YK.Font.control())
                    .sensoryFeedback(.impact(weight: .medium), trigger: ending != nil)
            }
            .padding(.horizontal, YK.Space.s300)
        }

        private func page(session: YK.Session, book: YK.Book) -> some View {
            let memos = store.memos(inSession: session.id)
            return VStack(alignment: .leading, spacing: YK.Space.s600) {
                VStack(alignment: .leading, spacing: YK.Space.s100) {
                    Text(book.title).font(YK.Font.title())
                    if let author = book.author {
                        Text(author).font(YK.Font.caption()).foregroundStyle(YK.ReadingInk.secondary)
                    }
                }
                .padding(.top, YK.Space.s400)
                Button {
                    pastOpen = true
                } label: {
                    Label("この本のきろく（\(YK.Format.count(store.sessions(of: book.id).count, "回"))）", systemImage: "clock.arrow.circlepath")
                        .font(YK.Font.caption())
                        .foregroundStyle(YK.ReadingInk.secondary)
                        .frame(minHeight: YK.Size.target)
                }
                if memos.isEmpty {
                    Text("浮かんだことを下の欄に書くと、このページに残ります。")
                        .font(YK.Font.body())
                        .foregroundStyle(YK.ReadingInk.secondary)
                }
                ForEach(memos) { memo in
                    YK.MemoRow(memo: memo, ink: .reading)
                }
                Color.clear.frame(height: 1).id("end")
            }
        }
    }

    /// 下端に常に開いた書く欄。保存に失敗したら文章を残して理由を出す。
    struct Composer: View {
        @Environment(YK.Store.self) private var store
        let session: YK.Session
        @State private var text = ""
        @State private var categoryID: UUID?
        @State private var failed = false
        @FocusState private var focused: Bool

        private var canSave: Bool { !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }

        var body: some View {
            VStack(alignment: .leading, spacing: YK.Space.s200) {
                if focused || canSave {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: YK.Space.s150) {
                            ForEach(store.sortedCategories) { category in
                                let selected = categoryID == category.id
                                Button(category.name) { categoryID = selected ? nil : category.id }
                                    .font(YK.Font.caption())
                                    .padding(.horizontal, YK.Space.s300)
                                    .frame(minHeight: YK.Size.controlSm)
                                    .foregroundStyle(selected ? Color(hex: 0x14192A) : YK.ReadingInk.text)
                                    .background(selected ? YK.ReadingInk.text : YK.ReadingInk.control, in: Capsule())
                                    .frame(minHeight: YK.Size.target)
                                    .accessibilityAddTraits(selected ? .isSelected : [])
                            }
                        }
                    }
                    .accessibilityLabel("カテゴリー")
                }
                if failed {
                    Text("保存できませんでした。文章は残っています。もう一度保存してください。")
                        .font(YK.Font.caption())
                        .foregroundStyle(Color(hex: 0xF2B8B0))
                }
                HStack(alignment: .bottom, spacing: YK.Space.s200) {
                    TextField("", text: $text, prompt: Text("浮かんだことを書く").foregroundStyle(YK.ReadingInk.secondary), axis: .vertical)
                        .font(YK.Font.body())
                        .lineLimit(1 ... 6)
                        .focused($focused)
                        .padding(.horizontal, YK.Space.s300)
                        .padding(.vertical, YK.Space.s200)
                        .frame(minHeight: YK.Size.target)
                        .background(YK.ReadingInk.control, in: RoundedRectangle(cornerRadius: YK.Radius.surface, style: .continuous))
                        .accessibilityLabel("メモの本文")
                    Button("保存", systemImage: "arrow.up") { save() }
                        .labelStyle(.iconOnly)
                        .buttonStyle(.glassProminent)
                        .buttonBorderShape(.circle)
                        .disabled(!canSave)
                        .frame(minWidth: YK.Size.target, minHeight: YK.Size.target)
                }
            }
            .padding(.horizontal, YK.Space.page)
            .padding(.vertical, YK.Space.s200)
            .onAppear { categoryID = store.carriedCategory[session.id] }
        }

        private func save() {
            do {
                try store.addMemo(body: text, categoryID: categoryID, bookID: session.bookID, sessionID: session.id)
                text = ""
                failed = false
            } catch {
                failed = true
                AccessibilityNotification.Announcement("保存できませんでした。文章は残っています。").post()
            }
        }
    }
}
