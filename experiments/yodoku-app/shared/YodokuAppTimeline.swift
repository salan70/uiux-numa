import SwiftUI

// セッション単位のきろく。本詳細と読書空間で同じ骨格を使う（book-detail.md R-3〜R-7、reading.md R-2）。

extension YK {
    /// 通常画面と読書空間で文字色だけを替える。
    struct Ink {
        let primary: Color
        let secondary: Color
        let line: Color

        static let canvas = Ink(primary: Palette.onSurface, secondary: Palette.onSurfaceVariant, line: Palette.hairline)
        static let reading = Ink(primary: ReadingInk.text, secondary: ReadingInk.secondary, line: ReadingInk.line.opacity(0.5))
    }

    struct SessionBlock: View {
        @Environment(Store.self) private var store
        let session: Session
        let ink: Ink
        /// nil は開閉しない（常に開く）。
        var expanded: Binding<Bool>?
        /// 終了済みセッションの詳細へ移る操作。nil なら置かない。
        var detail: AnyView?
        /// メモを長押しで直す・消す（セッション詳細だけで使う）。
        var memoActions = false
        var focusID: UUID?

        var body: some View {
            let memos = store.memos(inSession: session.id)
            let yoin = store.yoin(of: session.id)
            let hasBody = !memos.isEmpty || yoin != nil
            let isOpen = expanded?.wrappedValue ?? true
            VStack(alignment: .leading, spacing: Space.s300) {
                HStack(alignment: .top, spacing: Space.s300) {
                    Button {
                        guard hasBody, let expanded else { return }
                        expanded.wrappedValue.toggle()
                    } label: {
                        header(memoCount: memos.count, hasYoin: yoin != nil)
                            .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                    // 開閉できない見出しも文字を薄くしない。押しても何も起きないだけにする。
                    .allowsHitTesting(expanded != nil && hasBody)
                    .accessibilityAddTraits(expanded != nil && hasBody ? .isButton : [])
                    .accessibilityHint(expanded == nil || !hasBody ? "" : (isOpen ? "メモを隠します" : "メモを表示します"))
                    if let detail {
                        detail
                    }
                }
                if isOpen, hasBody {
                    VStack(alignment: .leading, spacing: Space.s400) {
                        ForEach(memos) { memo in
                            MemoRow(memo: memo, ink: ink, actions: memoActions)
                                .id(memo.id)
                                .background(focusID == memo.id ? ink.secondary.opacity(0.08) : .clear)
                        }
                        if let yoin {
                            YoinRow(yoin: yoin, ink: ink).id(yoin.id)
                        }
                    }
                    .padding(.leading, Space.s600 + Space.s300)
                    .transition(.opacity)
                }
            }
            .padding(.vertical, Space.s400)
        }

        private func header(memoCount: Int, hasYoin: Bool) -> some View {
            let period = ReadingPeriod.at(session.startedAt)
            return HStack(alignment: .firstTextBaseline, spacing: Space.s300) {
                Image(systemName: period.symbol)
                    .frame(width: Space.s600)
                    .foregroundStyle(ink.secondary)
                    .accessibilityLabel(period.label)
                VStack(alignment: .leading, spacing: Space.s100) {
                    HStack(spacing: Space.s200) {
                        SwiftUI.Text(session.isActive ? "いまのセッション" : Format.dateTime(session.startedAt))
                            .font(Font.control())
                            .foregroundStyle(ink.primary)
                        if store.isFinishingSession(session) {
                            Fact(symbol: "checkmark.circle", text: "読了", color: ink.primary)
                        }
                    }
                    FlowFacts(ink: ink, items: facts(memoCount: memoCount, hasYoin: hasYoin))
                }
                Spacer(minLength: 0)
            }
        }

        private func facts(memoCount: Int, hasYoin: Bool) -> [(String, String)] {
            var items: [(String, String)] = [("clock", Format.duration(session.readingDuration(now: .now)))]
            items.append(("note.text", Format.count(memoCount, "件")))
            if hasYoin { items.append(("text.quote", "余韻")) }
            if let book = store.book(session.bookID), !book.finishedDates.isEmpty {
                items.append(("arrow.clockwise", "\(store.cycle(at: session.startedAt, in: book)) 周目"))
            }
            return items
        }
    }

    /// 文字を拡大しても 1 字ずつ折り返さないよう、収まらない値は次の行へ送る（Yodoku の点検 Y2）。
    struct FlowFacts: View {
        let ink: Ink
        let items: [(String, String)]

        var body: some View {
            ViewThatFits(in: .horizontal) {
                HStack(spacing: Space.s300) { content }
                VStack(alignment: .leading, spacing: Space.s100) { content }
            }
        }

        @ViewBuilder private var content: some View {
            ForEach(items, id: \.1) { item in
                Fact(symbol: item.0, text: item.1, color: ink.secondary).fixedSize()
            }
        }
    }

    struct MemoRow: View {
        @Environment(Store.self) private var store
        let memo: Memo
        let ink: Ink
        var actions = false
        var showsDate = false
        @State private var expanded = false
        @State private var editing = false

        var body: some View {
            VStack(alignment: .leading, spacing: Space.s150) {
                HStack(spacing: Space.s200) {
                    SwiftUI.Text(showsDate ? Format.dateTime(memo.createdAt) : Format.time(memo.createdAt))
                    if let category = store.category(memo.categoryID) {
                        Label(category.name, systemImage: category.symbol)
                    }
                }
                .font(Font.caption())
                .foregroundStyle(ink.secondary)
                ExpandableText(text: memo.body, ink: ink, expanded: $expanded)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .contentShape(Rectangle())
            .contextMenu {
                if actions {
                    Button("編集", systemImage: "pencil") { editing = true }
                    Button("削除", systemImage: "trash", role: .destructive) { store.deleteMemo(memo.id) }
                }
            }
            .accessibilityElement(children: .combine)
            .accessibilityActions {
                if actions {
                    Button("編集") { editing = true }
                    Button("削除") { store.deleteMemo(memo.id) }
                }
            }
            .sheet(isPresented: $editing) {
                MemoComposer(target: .edit(memo))
            }
        }
    }

    struct YoinRow: View {
        let yoin: Yoin
        let ink: Ink
        @State private var expanded = false

        var body: some View {
            VStack(alignment: .leading, spacing: Space.s150) {
                Label("余韻", systemImage: "text.quote")
                    .font(Font.captionBold())
                    .foregroundStyle(ink.secondary)
                ExpandableText(text: yoin.body, ink: ink, expanded: $expanded)
            }
            .accessibilityElement(children: .combine)
        }
    }

    /// 5 行を超える本文は「続きを読む」で開く（book-detail.md R-5）。文字を拡大しても本文は省略記号で切らずに開ける。
    struct ExpandableText: View {
        let text: String
        let ink: Ink
        @Binding var expanded: Bool
        @State private var truncated = false

        var body: some View {
            VStack(alignment: .leading, spacing: Space.s100) {
                SwiftUI.Text(text)
                    .font(Font.body())
                    .lineSpacing(Leading.body)
                    .foregroundStyle(ink.primary)
                    .lineLimit(expanded ? nil : 5)
                    .background {
                        // 5 行で切れているかを、切らない高さと比べて調べる。
                        ViewThatFits(in: .vertical) {
                            SwiftUI.Text(text).font(Font.body()).lineSpacing(Leading.body).hidden()
                                .onAppear { truncated = false }
                            Color.clear.onAppear { truncated = true }
                        }
                    }
                if truncated {
                    Button(expanded ? "閉じる" : "続きを読む") { expanded.toggle() }
                        .font(Font.captionBold())
                        .foregroundStyle(ink.secondary)
                        .frame(minHeight: Size.target, alignment: .leading)
                }
            }
        }
    }
}
