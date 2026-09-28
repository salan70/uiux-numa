import Foundation

// Yodoku の docs/specs/domain.md の語彙を写した型と導出（Yodoku 8dd7e5d）。
// 本体の YodokuCore には依存しない。規則の出典を各導出のコメントに書く。

extension YK {
    struct Book: Identifiable, Hashable {
        let id: UUID
        var title: String
        var author: String?
        var isbn: String?
        var finishedDates: [Date]
        let createdAt: Date
        /// モック専用。書影 API を呼ばないため、書影の代わりに描く装丁の色。
        var coverHue: Double
        /// モック専用。楽天ブックスの商品ページがある本か。
        var hasStorePage: Bool = true
    }

    struct Session: Identifiable, Hashable {
        let id: UUID
        let bookID: UUID
        var startedAt: Date
        var endedAt: Date?
        var pausedDuration: TimeInterval = 0
        var pausedAt: Date?

        var isActive: Bool { endedAt == nil }
        var isPaused: Bool { pausedAt != nil }

        /// session.md R-1。進行中は現在時刻、一時停止中は一時停止開始日時を終点にする。
        func readingDuration(now: Date) -> TimeInterval {
            let end = endedAt ?? pausedAt ?? now
            return max(0, end.timeIntervalSince(startedAt) - pausedDuration)
        }
    }

    struct Memo: Identifiable, Hashable {
        let id: UUID
        let bookID: UUID
        var sessionID: UUID?
        var categoryID: UUID?
        var body: String
        let createdAt: Date
    }

    struct Yoin: Identifiable, Hashable {
        let id: UUID
        let sessionID: UUID
        var body: String
        let createdAt: Date
    }

    struct MemoCategory: Identifiable, Hashable {
        let id: UUID
        var name: String
        var sortOrder: Int
        var symbol: String
    }

    enum HomeState: Equatable {
        case empty
        case idle(suggested: UUID)
        case active(session: UUID)
    }

    /// bookshelf.md R-3。
    enum LastRead: Equatable {
        case reading
        case ago(String)
    }

    /// 本詳細のタイムラインの外側の項目。book-detail.md R-2。
    enum TimelineItem: Identifiable, Hashable {
        case session(Session)
        case memo(Memo)
        case finished(Date)

        var id: String {
            switch self {
            case .session(let s): "s-\(s.id)"
            case .memo(let m): "m-\(m.id)"
            case .finished(let d): "f-\(d.timeIntervalSince1970)"
            }
        }

        var date: Date {
            switch self {
            case .session(let s): s.startedAt
            case .memo(let m): m.createdAt
            case .finished(let d): d
            }
        }
    }

    /// 検索のメモ・余韻の結果。search.md R-4。
    struct TextHit: Identifiable, Hashable {
        enum Kind: Hashable { case memo, yoin }
        let id: UUID
        let kind: Kind
        let bookID: UUID
        let sessionID: UUID?
        let excerpt: String
        let createdAt: Date
    }

    /// 統計の日ごとの本。statistics.md R-4、R-5。
    struct DayBook: Identifiable, Hashable {
        var id: UUID { bookID }
        let bookID: UUID
        let duration: TimeInterval
        let sessionCount: Int
        let latest: Date
    }

    struct Day: Identifiable, Hashable {
        var id: Date { date }
        let date: Date
        let books: [DayBook]
    }
}

// MARK: - 表記

extension YK {
    /// 画面の文字列の形。docs/guidelines/japanese-notation.md に従い、数と助数詞の間に空白を入れる。
    enum Format {
        static let calendar: Calendar = {
            var c = Calendar(identifier: .gregorian)
            c.locale = Locale(identifier: "ja_JP")
            return c
        }()

        /// 読書時間。1 時間未満は分だけ、以上は時間と分。
        static func duration(_ interval: TimeInterval) -> String {
            let minutes = Int(interval / 60)
            if minutes < 60 { return "\(minutes) 分" }
            let rest = minutes % 60
            return rest == 0 ? "\(minutes / 60) 時間" : "\(minutes / 60) 時間 \(rest) 分"
        }

        /// 読み上げでは空白の有無が伝わらないので、同じ文字列を使う。
        static func count(_ n: Int, _ unit: String) -> String { "\(n) \(unit)" }

        /// 日付は 2026.09.22（火）。japanese-notation.md の日付の Tips。
        static func date(_ d: Date) -> String {
            let f = DateFormatter()
            f.calendar = calendar
            f.locale = Locale(identifier: "ja_JP")
            f.dateFormat = "yyyy.MM.dd（E）"
            return f.string(from: d)
        }

        static func dateTime(_ d: Date) -> String {
            let f = DateFormatter()
            f.calendar = calendar
            f.locale = Locale(identifier: "ja_JP")
            f.dateFormat = "yyyy.MM.dd HH:mm"
            return f.string(from: d)
        }

        static func time(_ d: Date) -> String {
            let f = DateFormatter()
            f.calendar = calendar
            f.dateFormat = "HH:mm"
            return f.string(from: d)
        }

        static func month(_ d: Date) -> String {
            let f = DateFormatter()
            f.calendar = calendar
            f.dateFormat = "yyyy.MM"
            return f.string(from: d)
        }

        /// bookshelf.md R-4。30 日を 1 か月、365 日を 1 年として切り捨てる。表記は「か月」にする。
        static func relative(from date: Date, now: Date) -> String {
            let s = now.timeIntervalSince(date)
            let minute = 60.0, hour = 3600.0, day = 86400.0
            if s < minute { return "たった今" }
            if s < hour { return "\(Int(s / minute)) 分前" }
            if s < day { return "\(Int(s / hour)) 時間前" }
            if s < 30 * day { return "\(Int(s / day)) 日前" }
            if s < 365 * day { return "\(Int(s / (30 * day))) か月前" }
            return "\(Int(s / (365 * day))) 年前"
        }

        /// search.md R-5。最初の一致の前後から最大 80 字を切り出し、途中を切った側に「…」を付ける。
        static func excerpt(_ body: String, around terms: [String], limit: Int = 80) -> String {
            let flat = body.replacingOccurrences(of: "\n", with: " ")
            guard flat.count > limit else { return flat }
            let options: String.CompareOptions = [.caseInsensitive, .widthInsensitive, .diacriticInsensitive]
            let hit = terms.compactMap { flat.range(of: $0, options: options) }.min { $0.lowerBound < $1.lowerBound }
            let hitOffset = hit.map { flat.distance(from: flat.startIndex, to: $0.lowerBound) } ?? 0
            let start = max(0, min(hitOffset - 20, flat.count - limit))
            let from = flat.index(flat.startIndex, offsetBy: start)
            let to = flat.index(from, offsetBy: limit)
            return (start > 0 ? "…" : "") + flat[from ..< to] + (to < flat.endIndex ? "…" : "")
        }
    }
}
