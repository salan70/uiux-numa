import Foundation

// モックの固定データ。起動時刻から相対的に作るので、いつ起動しても同じ見え方になる。
// 書名と著者は実在の本、メモと余韻はこの Experiment のために書いた文である（本文の引用は置かない）。

extension YK {
    struct Fixture {
        enum Mode: String {
            /// 本が 1 冊もない。home.md の empty。
            case empty
            /// 本はあるが進行中のセッションがない。
            case idle
            /// 実行中のセッションがある。
            case active
            /// 一時停止中のセッションがある。
            case paused
            /// 読書時間が 6 時間を超えた実行中のセッションがあり、表示時に自動終了する。
            case autoEnded
        }

        var mode: Mode = .idle
        /// 読書空間を最小化した状態で始める。ミニ読書プレイヤーの確認に使う。
        var minimized = false
        var memoFailure = false
        var lookupOffline = false
        /// 撮影用。起動直後に開く画面（`-route book|session|shelf|stats`）と、終了シート（`-ending`）。
        var route: String?
        var ending = false

        static func fromLaunchArguments() -> Fixture {
            let defaults = UserDefaults.standard
            let args = ProcessInfo.processInfo.arguments
            return Fixture(
                mode: defaults.string(forKey: "fixture").flatMap(Mode.init(rawValue:)) ?? .idle,
                minimized: args.contains("-minimized"),
                memoFailure: args.contains("-memoFailure"),
                lookupOffline: args.contains("-lookupOffline"),
                route: defaults.string(forKey: "route"),
                ending: args.contains("-ending")
            )
        }

        struct Data {
            var books: [Book] = []
            var sessions: [Session] = []
            var memos: [Memo] = []
            var yoins: [Yoin] = []
            var firstLaunch: Date
        }

        // MARK: カテゴリー

        /// domain.md §3 の初期シード 5 種。
        static let categories: [MemoCategory] = [
            MemoCategory(id: categoryID(0), name: "引用", sortOrder: 0, symbol: "quote.opening"),
            MemoCategory(id: categoryID(1), name: "要約", sortOrder: 1, symbol: "text.alignleft"),
            MemoCategory(id: categoryID(2), name: "感想", sortOrder: 2, symbol: "bubble.left"),
            MemoCategory(id: categoryID(3), name: "アイデア", sortOrder: 3, symbol: "lightbulb"),
            MemoCategory(id: categoryID(4), name: "その他", sortOrder: 4, symbol: "ellipsis.circle"),
        ]

        static func categoryID(_ n: Int) -> UUID {
            UUID(uuidString: String(format: "00000000-0000-0000-0000-%012d", n + 1))!
        }

        enum Cat: Int { case quote, summary, thought, idea, other }

        // MARK: 本

        private struct Plan {
            let title: String
            let author: String?
            let isbn: String?
            let hue: Double
            /// 登録した日。今日から何日前か。
            let registered: Double
            /// セッション: (何日前, 開始時刻, 読書分)
            let sessions: [(Double, Double, Double)]
            /// 読了した日。セッションの終了と一致させるときは、そのセッションの添字。
            let finishedAfter: [Int]
            /// メモ: (セッションの添字, カテゴリー, 本文)。添字 -1 はセッション外メモ。
            let memos: [(Int, Cat?, String)]
            /// 余韻: (セッションの添字, 本文)
            let yoins: [(Int, String)]
        }

        private static let plans: [Plan] = [
            Plan(
                title: "暇と退屈の倫理学", author: "國分功一郎", isbn: "9784101050713", hue: 0.08, registered: 24,
                sessions: [(20, 21.5, 35), (18, 22, 42), (15, 21, 28), (12, 7.5, 20), (9, 21.2, 55), (6, 22.1, 31), (3, 21.4, 47), (1, 21, 38), (0.1, 0, 25)],
                finishedAfter: [],
                memos: [
                    (0, .thought, "退屈を悪者にしないところから話が始まるのがいい。"),
                    (1, .summary, "暇は客観的な時間の条件、退屈は主観的な感じ方として分けて考えている。"),
                    (4, .idea, "週末の予定を詰めすぎてしまう理由が、ここにある気がする。"),
                    (4, .thought, "第 4 章は一度では読み切れない。明日もう一度読む。"),
                    (6, .quote, "p.212 の「気晴らし」の定義は書き写しておきたい。"),
                    (7, .thought, "消費と浪費の違いが、自分の買い物の仕方に刺さった。"),
                    (8, .idea, "退屈と向き合う時間を、読書の後の 10 分に作ってみる。"),
                    (-1, nil, "友人に勧めるなら第 1 章と結論だけでも良さそう。"),
                ],
                yoins: [
                    (4, "読むのに時間がかかった夜。それでも、分かった気がする瞬間が 2 回あった。"),
                    (7, "買いたいと思っていたものを、今日はひとつ見送った。この本のせいだと思う。"),
                    (8, "眠る前に少しだけのつもりが 25 分。静かな章だった。"),
                ]
            ),
            Plan(
                title: "センス・オブ・ワンダー", author: "レイチェル・カーソン", isbn: "9784105197025", hue: 0.36, registered: 90,
                sessions: [(80, 20, 30), (74, 21, 25), (66, 8, 40), (60, 21.5, 35), (40, 6.5, 22), (26, 7, 18), (14, 6.8, 26), (4, 7.2, 15)],
                finishedAfter: [3],
                memos: [
                    (0, .thought, "子どもと歩くときは、名前を教えるより一緒に驚くほうがいい、という話。"),
                    (2, .summary, "知ることより、感じることを先に置く。"),
                    (3, .thought, "短いのに、読み終えるのが惜しかった。"),
                    (5, .thought, "2 回目は、夜の海の場面がずっと静かに読めた。"),
                    (7, .idea, "朝の散歩で、見たことのない草を 1 つ探す。"),
                ],
                yoins: [
                    (3, "外に出たくなる本。次は写真と一緒に読みたい。"),
                    (6, "朝に読むのが合っている。窓を開けて読んだ。"),
                ]
            ),
            Plan(
                title: "三体", author: "劉慈欣", isbn: "9784152098702", hue: 0.62, registered: 60,
                sessions: [(55, 22, 70), (53, 23, 45), (48, 21, 90), (44, 13, 120), (37, 22.5, 60), (31, 21, 50), (22, 14, 150), (12, 22, 40)],
                finishedAfter: [],
                memos: [
                    (1, .thought, "ゲームの章で一気に引き込まれた。"),
                    (2, .idea, "物理法則が信用できない不安を、日常の描写で見せている。"),
                    (3, .summary, "文化大革命の場面から現在へ。時間の飛び方が大きい。"),
                    (6, .thought, "登場人物の名前を控えておかないと迷う。"),
                    (6, .other, "人物表: 汪淼、葉文潔、史強。"),
                ],
                yoins: [
                    (3, "休日の昼に 2 時間。読み終えたら外が暗くなっていた。"),
                    (6, "続きが気になるが、少し間をおいて読みたい。"),
                ]
            ),
            Plan(
                title: "雪国", author: "川端康成", isbn: "9784101001012", hue: 0.55, registered: 120,
                sessions: [(115, 21, 30), (108, 22, 25), (100, 21.5, 40), (92, 20.5, 35), (85, 22, 45)],
                finishedAfter: [4],
                memos: [
                    (0, .thought, "冒頭の景色の切り替わりが速い。"),
                    (2, .summary, "駒子と葉子、2 人の見え方の違いが軸になっている。"),
                    (4, .thought, "終わり方が唐突に思えたが、しばらくして腑に落ちた。"),
                ],
                yoins: [(4, "冬のうちに読めてよかった。")]
            ),
            Plan(
                title: "博士の愛した数式", author: "小川洋子", isbn: "9784101215235", hue: 0.95, registered: 175,
                sessions: [(170, 21, 40), (165, 21.5, 50), (158, 22, 35), (150, 13, 80), (140, 21, 45), (131, 21.2, 55), (124, 20.8, 60)],
                finishedAfter: [6],
                memos: [
                    (1, .thought, "数式が、人と人をつなぐ道具として描かれている。"),
                    (3, .quote, "友愛数の場面。ページの端を折った。"),
                    (6, .thought, "最後の数ページは、急がずに読んだ。"),
                ],
                yoins: [(6, "やさしい話だった。誰かに貸したい。")]
            ),
            Plan(
                title: "エッセンシャル思考", author: "グレッグ・マキューン", isbn: "9784761270438", hue: 0.14, registered: 7,
                sessions: [], finishedAfter: [], memos: [], yoins: []
            ),
            Plan(
                title: "祖母の料理ノート", author: nil, isbn: nil, hue: 0.03, registered: 30,
                sessions: [(28, 16, 20)], finishedAfter: [],
                memos: [(0, .other, "煮物の分量は「目分量」とだけ書いてある。")], yoins: []
            ),
        ]

        // MARK: 組み立て

        func build(now: Date = .now) -> Data {
            let cal = Format.calendar
            let today = cal.startOfDay(for: now)
            var data = Data(firstLaunch: cal.date(byAdding: .day, value: -176, to: today) ?? today)
            guard mode != .empty else { return data }

            func at(_ daysAgo: Double, _ hour: Double) -> Date {
                today.addingTimeInterval(-daysAgo.rounded(.down) * 86400 + hour * 3600)
            }

            for (index, plan) in Self.plans.enumerated() {
                let bookID = UUID()
                var sessions: [Session] = []
                for (daysAgo, hour, minutes) in plan.sessions {
                    var start = at(daysAgo, hour)
                    // 最新のセッションは「2 時間前に終わった」に揃える。ホームの提示と本棚の並びを安定させる。
                    if index == 0, daysAgo < 1 {
                        start = now.addingTimeInterval(-(2 * 3600 + minutes * 60))
                    }
                    sessions.append(Session(id: UUID(), bookID: bookID, startedAt: start, endedAt: start.addingTimeInterval(minutes * 60)))
                }
                let finished = plan.finishedAfter.compactMap { sessions[$0].endedAt }
                data.books.append(Book(
                    id: bookID, title: plan.title, author: plan.author, isbn: plan.isbn, finishedDates: finished,
                    createdAt: now.addingTimeInterval(-plan.registered * 86400), coverHue: plan.hue,
                    hasStorePage: plan.isbn != nil
                ))
                for (offset, (sessionIndex, cat, body)) in plan.memos.enumerated() {
                    let session = sessionIndex >= 0 ? sessions[sessionIndex] : nil
                    let created = session.map { $0.startedAt.addingTimeInterval(Double(offset % 3 + 1) * 6 * 60) }
                        ?? now.addingTimeInterval(-5 * 86400)
                    data.memos.append(Memo(id: UUID(), bookID: bookID, sessionID: session?.id,
                                           categoryID: cat.map { Self.categoryID($0.rawValue) }, body: body, createdAt: created))
                }
                for (sessionIndex, body) in plan.yoins {
                    let session = sessions[sessionIndex]
                    data.yoins.append(Yoin(id: UUID(), sessionID: session.id, body: body, createdAt: session.endedAt ?? now))
                }
                data.sessions += sessions
            }

            // 進行中のセッションは先頭の本に置く。
            let current = data.books[0].id
            switch mode {
            case .empty, .idle:
                break
            case .active:
                let s = Session(id: UUID(), bookID: current, startedAt: now.addingTimeInterval(-32 * 60))
                data.sessions.append(s)
                data.memos.append(Memo(id: UUID(), bookID: current, sessionID: s.id, categoryID: Self.categoryID(2),
                                       body: "第 5 章。退屈の第 2 形式が、いちばん身に覚えがある。", createdAt: now.addingTimeInterval(-20 * 60)))
                data.memos.append(Memo(id: UUID(), bookID: current, sessionID: s.id, categoryID: Self.categoryID(3),
                                       body: "予定の無い土曜を、あえて 1 日作ってみる。", createdAt: now.addingTimeInterval(-6 * 60)))
            case .paused:
                var s = Session(id: UUID(), bookID: current, startedAt: now.addingTimeInterval(-23 * 60))
                s.pausedAt = now.addingTimeInterval(-5 * 60)
                data.sessions.append(s)
                data.memos.append(Memo(id: UUID(), bookID: current, sessionID: s.id, categoryID: Self.categoryID(2),
                                       body: "第 5 章。退屈の第 2 形式が、いちばん身に覚えがある。", createdAt: now.addingTimeInterval(-12 * 60)))
            case .autoEnded:
                data.sessions.append(Session(id: UUID(), bookID: current, startedAt: now.addingTimeInterval(-7 * 3600)))
            }
            return data
        }

        // MARK: 本検索のモック

        /// book-search.md の検索結果の代わり。楽天と NDL は呼ばない。
        static let lookupCatalog: [LookupBook] = [
            LookupBook(title: "中動態の世界", author: "國分功一郎", publisher: "医学書院", year: "2017", isbn: "9784260031578", hue: 0.1),
            LookupBook(title: "目的への抵抗", author: "國分功一郎", publisher: "新潮社", year: "2023", isbn: "9784106109935", hue: 0.3),
            LookupBook(title: "沈黙の春", author: "レイチェル・カーソン", publisher: "新潮社", year: "1974", isbn: "9784102074015", hue: 0.4),
            LookupBook(title: "三体Ⅱ 黒暗森林", author: "劉慈欣", publisher: "早川書房", year: "2020", isbn: "9784152099464", hue: 0.66),
            LookupBook(title: "三体Ⅲ 死神永生", author: "劉慈欣", publisher: "早川書房", year: "2021", isbn: "9784152100306", hue: 0.7),
            LookupBook(title: "古都", author: "川端康成", publisher: "新潮社", year: "1968", isbn: "9784101001210", hue: 0.9),
            LookupBook(title: "ことり", author: "小川洋子", publisher: "朝日新聞出版", year: "2012", isbn: "9784022510099", hue: 0.2),
            LookupBook(title: "読書の日記", author: nil, publisher: nil, year: nil, isbn: nil, hue: 0.5),
        ]
    }
}
