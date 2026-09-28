import Foundation
import Observation
import SwiftUI
import UIKit

// Yodoku の機能仕様（docs/specs/features/*.md、Yodoku 8dd7e5d）の規則を、モックの状態として持つ。
// 永続化はせず、起動のたびに Fixture から作り直す。

extension YK {
    struct SaveError: Error {}

    struct UndoItem: Identifiable {
        let id = UUID()
        let message: String
        let restore: @MainActor () -> Void
    }

    enum LookupResult: Equatable {
        case results([LookupBook])
        case empty
        case failed
    }

    struct LookupBook: Identifiable, Equatable, Hashable {
        let id = UUID()
        let title: String
        let author: String?
        let publisher: String?
        let year: String?
        let isbn: String?
        let hue: Double
    }

    @MainActor
    @Observable
    final class Store {
        var books: [Book]
        var sessions: [Session]
        var memos: [Memo]
        var yoins: [Yoin]
        var categories: [MemoCategory]
        let firstLaunch: Date

        /// 読書空間を全画面で見せているか。reading.md R-9: 進行中セッションがあれば起動時は全画面。
        var isReadingPresented: Bool
        /// 自動終了したセッション。home.md R-3 の通知に使う。
        var autoEndedSessionID: UUID?
        var undo: UndoItem?
        /// reading.md R-10: 同じセッションの次のメモへカテゴリーを引き継ぐ。
        var carriedCategory: [UUID: UUID] = [:]
        /// reading.md R-11: 手動のテーマ。nil は自動。
        var themeOverride: ReadingPeriod?
        /// search.md R-9: プロセスが生きている間は検索語を保持する。
        var searchQuery = ""

        /// モックの切り替え。起動引数 `-memoFailure` で次のメモ保存を失敗させ、`-lookupOffline` で本検索を失敗させる。
        var failNextMemoSave: Bool
        let lookupOffline: Bool
        /// 撮影用の起動引数。variant が起動直後に一度だけ読む。
        var launchRoute: Route?
        var launchEnding: Bool

        init(fixture: Fixture) {
            let data = fixture.build()
            books = data.books
            sessions = data.sessions
            memos = data.memos
            yoins = data.yoins
            categories = Fixture.categories
            firstLaunch = data.firstLaunch
            isReadingPresented = data.sessions.contains { $0.isActive } && !fixture.minimized
            failNextMemoSave = fixture.memoFailure
            lookupOffline = fixture.lookupOffline
            launchEnding = fixture.ending
            let first = data.books.first?.id
            let lastEnded = data.sessions.filter { $0.bookID == first && $0.endedAt != nil }.max { $0.startedAt < $1.startedAt }
            launchRoute = switch fixture.route {
            case "book": first.map { .book($0) }
            case "session": lastEnded.map { .session($0.id) }
            case "shelf": .shelf
            case "stats": .stats
            default: nil
            }
        }

        /// 起動引数の画面を一度だけ返す。
        func takeLaunchRoute() -> Route? {
            defer { launchRoute = nil }
            return launchRoute
        }

        func takeLaunchEnding() -> Date? {
            guard launchEnding else { return nil }
            launchEnding = false
            return endCandidate()
        }

        /// 起動引数から作る。例: `-fixture active -minimized`。
        static func fromLaunchArguments() -> Store {
            Store(fixture: Fixture.fromLaunchArguments())
        }

        // MARK: 参照

        func book(_ id: UUID?) -> Book? { books.first { $0.id == id } }
        func session(_ id: UUID?) -> Session? { sessions.first { $0.id == id } }
        func category(_ id: UUID?) -> MemoCategory? { categories.first { $0.id == id } }
        var sortedCategories: [MemoCategory] { categories.sorted { $0.sortOrder < $1.sortOrder } }

        var activeSession: Session? { sessions.first { $0.isActive } }

        /// home.md の状態。
        var homeState: HomeState {
            if let active = activeSession { return .active(session: active.id) }
            guard let first = bookshelf.first else { return .empty }
            return .idle(suggested: first.id)
        }

        /// bookshelf.md R-6: 進行中 → 最後の endedAt の降順 → セッションの無い本を createdAt の降順。
        var bookshelf: [Book] {
            func lastEnded(_ book: Book) -> Date? {
                sessions.filter { $0.bookID == book.id }.compactMap(\.endedAt).max()
            }
            let activeBookID = activeSession?.bookID
            return books.sorted { a, b in
                if a.id == activeBookID { return true }
                if b.id == activeBookID { return false }
                switch (lastEnded(a), lastEnded(b)) {
                case let (x?, y?): return x > y
                case (_?, nil): return true
                case (nil, _?): return false
                case (nil, nil): return a.createdAt > b.createdAt
                }
            }
        }

        func sessions(of bookID: UUID) -> [Session] {
            sessions.filter { $0.bookID == bookID }.sorted { $0.startedAt > $1.startedAt }
        }

        /// bookshelf.md R-3、R-4。
        func lastRead(_ book: Book, now: Date) -> LastRead? {
            let own = sessions.filter { $0.bookID == book.id }
            if own.contains(where: \.isActive) { return .reading }
            guard let last = own.compactMap(\.endedAt).max() else { return nil }
            return .ago(Format.relative(from: last, now: now))
        }

        /// bookshelf.md R-2: 読了 n 件で、最後の読了の後にセッションがあれば「n+1 周目」、無ければ「n 周した」。
        func cycleLabel(_ book: Book) -> String? {
            guard let lastFinish = book.finishedDates.max() else { return nil }
            let n = book.finishedDates.count
            let reread = sessions.contains { $0.bookID == book.id && $0.startedAt > lastFinish }
            return reread ? "\(n + 1) 周目" : "\(n) 周した"
        }

        /// domain.md の周回。対象の日時より前にある読了の数 + 1。
        func cycle(at date: Date, in book: Book) -> Int {
            book.finishedDates.filter { $0 < date }.count + 1
        }

        /// book-detail.md R-1: 終了済みセッションの合計読書時間。
        func totalReading(_ bookID: UUID) -> TimeInterval {
            sessions.filter { $0.bookID == bookID && !$0.isActive }.reduce(0) { $0 + $1.readingDuration(now: .now) }
        }

        func memos(inSession id: UUID) -> [Memo] {
            memos.filter { $0.sessionID == id }.sorted { $0.createdAt < $1.createdAt }
        }

        func yoin(of sessionID: UUID) -> Yoin? { yoins.first { $0.sessionID == sessionID } }

        /// 本に属する最新のメモまたは余韻。home.md の画面節の「最新メモまたは余韻」。
        func latestText(of bookID: UUID) -> TextHit? {
            recentTexts().first { $0.bookID == bookID }
        }

        /// 全ての本のメモと余韻を新しい順に並べる。
        func recentTexts(limit: Int? = nil) -> [TextHit] {
            let memoHits = memos.map {
                TextHit(id: $0.id, kind: .memo, bookID: $0.bookID, sessionID: $0.sessionID, excerpt: $0.body, createdAt: $0.createdAt)
            }
            let yoinHits: [TextHit] = yoins.compactMap { yoin in
                guard let session = session(yoin.sessionID) else { return nil }
                return TextHit(id: yoin.id, kind: .yoin, bookID: session.bookID, sessionID: session.id, excerpt: yoin.body, createdAt: yoin.createdAt)
            }
            let all = (memoHits + yoinHits).sorted { $0.createdAt > $1.createdAt }
            return limit.map { Array(all.prefix($0)) } ?? all
        }

        /// book-detail.md R-2、R-7: セッション、セッション外メモ、対応するセッションの無い読了。
        func timeline(of bookID: UUID, newestFirst: Bool) -> [TimelineItem] {
            guard let book = book(bookID) else { return [] }
            let own = sessions.filter { $0.bookID == bookID }
            var items: [TimelineItem] = own.map { .session($0) }
            items += memos.filter { $0.bookID == bookID && $0.sessionID == nil }.map { .memo($0) }
            items += book.finishedDates.filter { date in !own.contains { $0.endedAt == date } }.map { .finished($0) }
            return items.sorted { newestFirst ? $0.date > $1.date : $0.date < $1.date }
        }

        /// セッション終了時に作られた読了か。book-detail.md R-7。
        func isFinishingSession(_ session: Session) -> Bool {
            guard let end = session.endedAt, let book = book(session.bookID) else { return false }
            return book.finishedDates.contains(end)
        }

        // MARK: 読書

        /// session.md R-2、R-7: 進行中が既にあれば開始しない。
        @discardableResult
        func start(_ bookID: UUID) -> Bool {
            guard activeSession == nil else { return false }
            sessions.append(Session(id: UUID(), bookID: bookID, startedAt: .now))
            isReadingPresented = true
            return true
        }

        /// session.md R-3。
        func pause() {
            guard let i = sessions.firstIndex(where: \.isActive), sessions[i].pausedAt == nil else { return }
            sessions[i].pausedAt = .now
        }

        func resume() {
            guard let i = sessions.firstIndex(where: \.isActive), let pausedAt = sessions[i].pausedAt else { return }
            sessions[i].pausedDuration += Date.now.timeIntervalSince(pausedAt)
            sessions[i].pausedAt = nil
        }

        /// session.md R-4: 一時停止中の終了は pausedAt を終了時刻にする。
        func endCandidate() -> Date? {
            guard let active = activeSession else { return nil }
            return active.pausedAt ?? .now
        }

        /// reading.md R-4〜R-6: 確定したときだけ終了、余韻、読了を保存する。
        func confirmEnd(at end: Date, yoin: String, finished: Bool) {
            guard let i = sessions.firstIndex(where: \.isActive) else { return }
            if let pausedAt = sessions[i].pausedAt, pausedAt < end {
                sessions[i].pausedDuration += end.timeIntervalSince(pausedAt)
            }
            sessions[i].pausedAt = nil
            sessions[i].endedAt = end
            let trimmed = yoin.trimmingCharacters(in: .whitespacesAndNewlines)
            if !trimmed.isEmpty {
                yoins.append(Yoin(id: UUID(), sessionID: sessions[i].id, body: trimmed, createdAt: .now))
            }
            if finished, let b = books.firstIndex(where: { $0.id == sessions[i].bookID }) {
                books[b].finishedDates.append(end)
            }
            isReadingPresented = false
        }

        /// reading.md R-12: 進行中のセッションと配下のメモを消す。確認は呼び出し側で行う。
        func cancelActiveSession() {
            guard let active = activeSession else { return }
            sessions.removeAll { $0.id == active.id }
            memos.removeAll { $0.sessionID == active.id }
            isReadingPresented = false
        }

        /// session.md R-5: 実行中で読書時間が 6 時間に達していたら自動終了する。
        func autoEndIfNeeded(now: Date = .now) {
            guard let i = sessions.firstIndex(where: \.isActive), sessions[i].pausedAt == nil else { return }
            let limit: TimeInterval = 6 * 3600
            guard sessions[i].readingDuration(now: now) >= limit else { return }
            sessions[i].endedAt = sessions[i].startedAt.addingTimeInterval(limit + sessions[i].pausedDuration)
            autoEndedSessionID = sessions[i].id
            isReadingPresented = false
        }

        // MARK: メモと余韻

        /// memo-input.md R-1〜R-5。保存に失敗したら例外を投げ、呼び出し側は入力を残す。
        func addMemo(body: String, categoryID: UUID?, bookID: UUID, sessionID: UUID?) throws {
            let trimmed = body.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !trimmed.isEmpty else { return }
            if failNextMemoSave {
                failNextMemoSave = false
                throw SaveError()
            }
            memos.append(Memo(id: UUID(), bookID: bookID, sessionID: sessionID, categoryID: categoryID, body: trimmed, createdAt: .now))
            if let sessionID {
                carriedCategory[sessionID] = categoryID
            }
        }

        func updateMemo(_ id: UUID, body: String, categoryID: UUID?) throws {
            let trimmed = body.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !trimmed.isEmpty, let i = memos.firstIndex(where: { $0.id == id }) else { return }
            if failNextMemoSave {
                failNextMemoSave = false
                throw SaveError()
            }
            memos[i].body = trimmed
            memos[i].categoryID = categoryID
        }

        /// book-detail.md R-12: メモは確認なしで消し、取り消しを出す。
        func deleteMemo(_ id: UUID) {
            guard let memo = memos.first(where: { $0.id == id }) else { return }
            memos.removeAll { $0.id == id }
            offerUndo("メモを削除しました") { $0.memos.append(memo) }
        }

        /// session-detail.md R-9。トリム後が空なら false を返し、呼び出し側が削除の確認を出す（R-10）。
        func saveYoin(sessionID: UUID, body: String) -> Bool {
            let trimmed = body.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !trimmed.isEmpty else { return false }
            if let i = yoins.firstIndex(where: { $0.sessionID == sessionID }) {
                yoins[i].body = trimmed
            } else {
                yoins.append(Yoin(id: UUID(), sessionID: sessionID, body: trimmed, createdAt: .now))
            }
            return true
        }

        func deleteYoin(sessionID: UUID) {
            guard let yoin = yoin(of: sessionID) else { return }
            yoins.removeAll { $0.id == yoin.id }
            offerUndo("余韻を削除しました") { $0.yoins.append(yoin) }
        }

        // MARK: セッションと本の編集

        /// session-detail.md R-5、R-6。
        @discardableResult
        func updateTimes(_ id: UUID, start: Date, end: Date) -> Bool {
            guard let i = sessions.firstIndex(where: { $0.id == id }), sessions[i].endedAt != nil,
                  start <= end, end <= .now else { return false }
            sessions[i].startedAt = start
            sessions[i].endedAt = end
            sessions[i].pausedDuration = min(sessions[i].pausedDuration, end.timeIntervalSince(start))
            return true
        }

        /// book-detail.md R-11、R-12: 配下のメモと余韻も消すが、読了は残す。
        func deleteSession(_ id: UUID) {
            guard let session = session(id) else { return }
            let ownMemos = memos.filter { $0.sessionID == id }
            let ownYoin = yoin(of: id)
            sessions.removeAll { $0.id == id }
            memos.removeAll { $0.sessionID == id }
            yoins.removeAll { $0.sessionID == id }
            offerUndo("セッションを削除しました") { store in
                store.sessions.append(session)
                store.memos += ownMemos
                if let ownYoin { store.yoins.append(ownYoin) }
            }
        }

        /// book-detail.md R-13。
        func removeFinish(bookID: UUID, date: Date) {
            guard let i = books.firstIndex(where: { $0.id == bookID }) else { return }
            books[i].finishedDates.removeAll { $0 == date }
            offerUndo("読了を取り消しました") { store in
                guard let j = store.books.firstIndex(where: { $0.id == bookID }) else { return }
                store.books[j].finishedDates.append(date)
            }
        }

        /// book-add.md R-1〜R-4。
        @discardableResult
        func addBook(title: String, author: String?, isbn: String?, hue: Double? = nil) -> Book? {
            let t = title.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !t.isEmpty else { return nil }
            let a = author?.trimmingCharacters(in: .whitespacesAndNewlines)
            let book = Book(
                id: UUID(), title: t, author: (a?.isEmpty ?? true) ? nil : a, isbn: isbn,
                finishedDates: [], createdAt: .now, coverHue: hue ?? Double(abs(t.hashValue % 360)) / 360,
                hasStorePage: isbn != nil
            )
            books.append(book)
            return book
        }

        /// book-detail.md R-8。
        @discardableResult
        func updateBook(_ id: UUID, title: String, author: String) -> Bool {
            let t = title.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !t.isEmpty, let i = books.firstIndex(where: { $0.id == id }) else { return false }
            let a = author.trimmingCharacters(in: .whitespacesAndNewlines)
            books[i].title = t
            books[i].author = a.isEmpty ? nil : a
            return true
        }

        /// book-detail.md R-11、R-12: 本の削除は配下をすべて消す。確認は呼び出し側で行う。
        func deleteBook(_ id: UUID) {
            guard let book = book(id) else { return }
            let ownSessions = sessions.filter { $0.bookID == id }
            let ids = Set(ownSessions.map(\.id))
            let ownMemos = memos.filter { $0.bookID == id }
            let ownYoins = yoins.filter { ids.contains($0.sessionID) }
            books.removeAll { $0.id == id }
            sessions.removeAll { $0.bookID == id }
            memos.removeAll { $0.bookID == id }
            yoins.removeAll { ids.contains($0.sessionID) }
            offerUndo("「\(book.title)」を削除しました") { store in
                store.books.append(book)
                store.sessions += ownSessions
                store.memos += ownMemos
                store.yoins += ownYoins
            }
        }

        private func offerUndo(_ message: String, restore: @escaping @MainActor (Store) -> Void) {
            undo = UndoItem(message: message) { [weak self] in
                guard let self else { return }
                restore(self)
                self.undo = nil
            }
            // 通知の表示を読み上げでも伝える（Yodoku の点検 Y4）。
            AccessibilityNotification.Announcement("\(message)。取り消せます。").post()
        }

        // MARK: 検索

        /// search.md R-1〜R-4。
        func search(_ query: String) -> (books: [Book], texts: [TextHit]) {
            let terms = query.split(whereSeparator: \.isWhitespace).map(String.init)
            guard !terms.isEmpty else { return ([], []) }
            let options: String.CompareOptions = [.caseInsensitive, .widthInsensitive, .diacriticInsensitive]
            func matches(_ text: String) -> Bool { terms.allSatisfy { text.range(of: $0, options: options) != nil } }
            let foundBooks = bookshelf.filter { matches($0.title + " " + ($0.author ?? "")) }
            let foundTexts = recentTexts().filter { matches($0.excerpt) }.map {
                TextHit(id: $0.id, kind: $0.kind, bookID: $0.bookID, sessionID: $0.sessionID,
                        excerpt: Format.excerpt($0.excerpt, around: terms), createdAt: $0.createdAt)
            }
            return (foundBooks, foundTexts)
        }

        /// book-search.md のモック。R-7: ISBN でなければトリム後 2 字以上で検索する。
        func lookup(_ query: String) async -> LookupResult {
            try? await Task.sleep(for: .milliseconds(700))
            if lookupOffline { return .failed }
            let q = query.trimmingCharacters(in: .whitespacesAndNewlines)
            let hits = Fixture.lookupCatalog.filter {
                $0.title.localizedCaseInsensitiveContains(q) || ($0.author ?? "").localizedCaseInsensitiveContains(q) || $0.isbn == q
            }
            return hits.isEmpty ? .empty : .results(hits)
        }

        // MARK: 統計

        /// statistics.md R-2、R-4、R-5。
        func days(inMonthOf month: Date) -> [Day] {
            let cal = YK.Format.calendar
            let target = sessions.filter { !$0.isActive && cal.isDate($0.startedAt, equalTo: month, toGranularity: .month) }
            let byDay = Dictionary(grouping: target) { cal.startOfDay(for: $0.startedAt) }
            return byDay.keys.sorted(by: >).map { day in
                let byBook = Dictionary(grouping: byDay[day] ?? []) { $0.bookID }
                let books = byBook.map { bookID, list in
                    DayBook(bookID: bookID, duration: list.reduce(0) { $0 + $1.readingDuration(now: .now) },
                            sessionCount: list.count, latest: list.map(\.startedAt).max() ?? day)
                }.sorted { $0.latest > $1.latest }
                return Day(date: day, books: books)
            }
        }

        /// statistics.md R-8: 直近 6 か月の日ごとの合計読書時間。
        func dailyTotals(now: Date = .now) -> [Date: TimeInterval] {
            let cal = YK.Format.calendar
            guard let from = cal.date(byAdding: .month, value: -6, to: cal.startOfDay(for: now)) else { return [:] }
            var totals: [Date: TimeInterval] = [:]
            for s in sessions where !s.isActive && s.startedAt >= from {
                totals[cal.startOfDay(for: s.startedAt), default: 0] += s.readingDuration(now: now)
            }
            return totals
        }
    }
}
