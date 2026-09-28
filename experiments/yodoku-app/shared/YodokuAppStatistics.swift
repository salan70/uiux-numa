import SwiftUI

// 統計。statistics.md。比較と評価の文を置かず、分布と合計だけを示す。
// 濃淡の境界を凡例で文字にする（Yodoku の点検 Y7）。

extension YK {
    struct Statistics: View {
        @Environment(Store.self) private var store
        let onSelectBook: (UUID) -> Void
        @State private var month = Date.now

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: Space.section) {
                    Heatmap(totals: store.dailyTotals())
                    monthSection
                }
                .padding(.horizontal, Space.page)
                .padding(.vertical, Space.s400)
            }
            .ykCanvas()
        }

        private var monthSection: some View {
            let cal = Format.calendar
            let days = store.days(inMonthOf: month)
            let sessions = days.flatMap(\.books).reduce(0) { $0 + $1.sessionCount }
            let total = days.flatMap(\.books).reduce(0) { $0 + $1.duration }
            let canBack = cal.compare(month, to: store.firstLaunch, toGranularity: .month) == .orderedDescending
            let canForward = cal.compare(month, to: .now, toGranularity: .month) == .orderedAscending
            return VStack(alignment: .leading, spacing: Space.s600) {
                HStack {
                    Button("前の月", systemImage: "chevron.left") { shift(-1) }
                        .labelStyle(.iconOnly).disabled(!canBack)
                        .frame(width: Size.target, height: Size.target)
                    Spacer()
                    SwiftUI.Text(Format.month(month)).font(Font.heading()).monospacedDigit().accessibilityAddTraits(.isHeader)
                    Spacer()
                    Button("次の月", systemImage: "chevron.right") { shift(1) }
                        .labelStyle(.iconOnly).disabled(!canForward)
                        .frame(width: Size.target, height: Size.target)
                }
                HStack(spacing: Space.s1000) {
                    SummaryValue(label: "読書時間", value: Format.duration(total))
                    SummaryValue(label: "セッション", value: Format.count(sessions, "回"))
                }
                if days.isEmpty {
                    SwiftUI.Text("この月の読書はまだありません。").font(Font.ui()).foregroundStyle(Palette.onSurfaceVariant)
                }
                ForEach(days) { day in
                    VStack(alignment: .leading, spacing: Space.s300) {
                        SwiftUI.Text(Format.date(day.date)).font(Font.captionBold()).foregroundStyle(Palette.onSurfaceVariant)
                        ForEach(day.books) { item in
                            if let book = store.book(item.bookID) {
                                Button { onSelectBook(book.id) } label: {
                                    HStack(spacing: Space.s300) {
                                        BookCover(book: book, width: 32)
                                        VStack(alignment: .leading, spacing: Space.s50) {
                                            SwiftUI.Text(book.title).font(Font.ui()).lineLimit(2)
                                            SwiftUI.Text("\(Format.duration(item.duration))、\(Format.count(item.sessionCount, "回"))")
                                                .font(Font.caption()).foregroundStyle(Palette.onSurfaceVariant)
                                        }
                                        Spacer(minLength: 0)
                                    }
                                    .contentShape(Rectangle())
                                }
                                .buttonStyle(.plain)
                                .accessibilityElement(children: .combine)
                            }
                        }
                        Hairline()
                    }
                }
            }
        }

        private func shift(_ months: Int) {
            month = Format.calendar.date(byAdding: .month, value: months, to: month) ?? month
        }
    }

    /// 直近 6 か月の日ごとの読書時間。statistics.md R-8 の 5 段階。
    struct Heatmap: View {
        let totals: [Date: TimeInterval]

        static let levels: [(label: String, upper: TimeInterval)] = [
            ("なし", 0), ("30 分未満", 1800), ("1 時間未満", 3600), ("2 時間未満", 7200), ("2 時間以上", .infinity),
        ]

        static func level(_ t: TimeInterval) -> Int {
            if t <= 0 { return 0 }
            if t < 1800 { return 1 }
            if t < 3600 { return 2 }
            if t < 7200 { return 3 }
            return 4
        }

        static func color(_ level: Int) -> Color {
            level == 0 ? Palette.surfaceContainer : Palette.primary.opacity([0, 0.28, 0.5, 0.74, 1][level])
        }

        var body: some View {
            let cal = Format.calendar
            let today = cal.startOfDay(for: .now)
            let start = cal.date(byAdding: .month, value: -6, to: today) ?? today
            let weekStart = cal.date(from: cal.dateComponents([.yearForWeekOfYear, .weekOfYear], from: start)) ?? start
            let weeks = (cal.dateComponents([.weekOfYear], from: weekStart, to: today).weekOfYear ?? 0) + 1
            let readDays = totals.values.filter { $0 > 0 }.count
            VStack(alignment: .leading, spacing: Space.s300) {
                SectionTitle(title: "この半年")
                GeometryReader { geo in
                    let gap: CGFloat = 3
                    let cell = (geo.size.width - gap * CGFloat(weeks - 1)) / CGFloat(weeks)
                    HStack(alignment: .top, spacing: gap) {
                        ForEach(0 ..< weeks, id: \.self) { w in
                            VStack(spacing: gap) {
                                ForEach(0 ..< 7, id: \.self) { d in
                                    let date = cal.date(byAdding: .day, value: w * 7 + d, to: weekStart) ?? weekStart
                                    let inRange = date >= start && date <= today
                                    RoundedRectangle(cornerRadius: 2)
                                        .fill(inRange ? Self.color(Self.level(totals[date] ?? 0)) : .clear)
                                        .frame(width: cell, height: cell)
                                }
                            }
                        }
                    }
                }
                .aspectRatio(CGFloat(weeks) / 7, contentMode: .fit)
                .accessibilityElement()
                .accessibilityLabel("直近 6 か月で読書した日は \(readDays) 日です。")
                legend
            }
        }

        private var legend: some View {
            ViewThatFits(in: .horizontal) {
                HStack(spacing: Space.s300) { legendItems }
                VStack(alignment: .leading, spacing: Space.s100) { legendItems }
            }
            .font(Font.caption())
            .foregroundStyle(Palette.onSurfaceVariant)
            .accessibilityHidden(true)
        }

        @ViewBuilder private var legendItems: some View {
            ForEach(Array(Self.levels.enumerated()), id: \.offset) { index, item in
                HStack(spacing: Space.s100) {
                    RoundedRectangle(cornerRadius: 2).fill(Self.color(index)).frame(width: 10, height: 10)
                    SwiftUI.Text(item.label).fixedSize()
                }
            }
        }
    }
}
