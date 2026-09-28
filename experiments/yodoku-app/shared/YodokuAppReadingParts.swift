import SwiftUI

// 読書空間の部品。構成は variant ごとに変え、ここには構成によらない部品だけを置く。

extension YK {
    /// 読書空間で描く時間帯。手動で選んでいればそれを、無ければ時刻から選ぶ（reading.md R-11）。
    @MainActor static func period(_ store: Store, now: Date = .now) -> ReadingPeriod {
        store.themeOverride ?? ReadingPeriod.at(now)
    }

    struct ThemeMenu: View {
        @Bindable var store: Store

        var body: some View {
            Menu {
                Picker("空の色", selection: $store.themeOverride) {
                    Label("時刻に合わせる", systemImage: "clock").tag(ReadingPeriod?.none)
                    ForEach(ReadingPeriod.allCases) { period in
                        Label(period.label, systemImage: period.symbol).tag(ReadingPeriod?.some(period))
                    }
                }
            } label: {
                Label("空の色", systemImage: YK.period(store).symbol)
                    .labelStyle(.iconOnly)
                    .frame(width: Size.target, height: Size.target)
            }
        }
    }

    /// 読書空間の円形の操作。Liquid Glass は操作にだけ使い、本文には使わない。
    struct RoundControl: View {
        let title: String
        let symbol: String
        var prominent = false
        let action: () -> Void

        var body: some View {
            Button(action: action) {
                Image(systemName: symbol)
                    .font(.system(size: prominent ? 22 : 18, weight: .semibold))
                    .frame(width: prominent ? 64 : 52, height: prominent ? 64 : 52)
            }
            .buttonStyle(.glass)
            .buttonBorderShape(.circle)
            .accessibilityLabel(title)
        }
    }

    /// 自動終了の知らせ。home.md R-3。起きたこと、次の行動の順に書く。
    struct AutoEndNotice: View {
        @Environment(Store.self) private var store
        let session: Session
        let open: () -> Void

        var body: some View {
            VStack(alignment: .leading, spacing: Space.s300) {
                Label {
                    SwiftUI.Text("読書時間が 6 時間に達したので、\(session.endedAt.map(Format.time) ?? "") に読書を終えました。終了時刻は詳細で直せます。")
                        .fixedSize(horizontal: false, vertical: true)
                } icon: {
                    Image(systemName: "clock.badge.checkmark")
                }
                .font(Font.ui())
                HStack(spacing: Space.s200) {
                    Button("詳細を開く", action: open).buttonStyle(SecondaryButtonStyle(fill: Palette.surface))
                    Button("閉じる") { store.autoEndedSessionID = nil }
                        .font(Font.control())
                        .frame(minHeight: Size.target)
                        .padding(.horizontal, Space.s300)
                }
            }
            .padding(Space.s400)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Palette.surfaceContainer, in: RoundedRectangle(cornerRadius: Radius.surface, style: .continuous))
        }
    }

    /// ミニ読書プレイヤーの中身。進行中への復帰と一時停止・再開だけを持つ（home.md R-8）。
    struct MiniPlayerContent: View {
        @Environment(Store.self) private var store
        let session: Session
        var compact = false

        var body: some View {
            HStack(spacing: Space.s300) {
                Button { store.isReadingPresented = true } label: {
                    HStack(spacing: Space.s300) {
                        if let book = store.book(session.bookID) {
                            BookCover(book: book, width: compact ? 20 : 28)
                            VStack(alignment: .leading, spacing: 0) {
                                SwiftUI.Text(book.title).font(Font.captionBold()).lineLimit(1)
                                HStack(spacing: Space.s100) {
                                    SwiftUI.Text(stateLabel(session))
                                    ReadingTime(session: session, font: Font.caption().monospacedDigit())
                                }
                                .font(Font.caption())
                                .foregroundStyle(.secondary)
                            }
                        }
                        Spacer(minLength: 0)
                    }
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel("読書に戻る")
                Button(session.isPaused ? "再開" : "一時停止", systemImage: session.isPaused ? "play.fill" : "pause.fill") {
                    session.isPaused ? store.resume() : store.pause()
                }
                .labelStyle(.iconOnly)
                .frame(width: Size.target, height: Size.target)
                .sensoryFeedback(.impact(weight: .light), trigger: session.isPaused)
            }
            .padding(.horizontal, Space.s300)
        }
    }

    /// 終了の候補時刻。シートの item に使う。
    struct EndCandidate: Identifiable {
        let date: Date
        var id: Date { date }
    }

    /// この本のセッション。読書空間の色のまま開く。進行中のセッションは常に開く。
    struct ReadingRecords: View {
        @Environment(Store.self) private var store
        @Environment(\.dismiss) private var dismiss
        let bookID: UUID
        @State private var open: Set<UUID> = []

        var body: some View {
            NavigationStack {
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 0) {
                        ForEach(store.sessions(of: bookID)) { past in
                            SessionBlock(
                                session: past, ink: .reading,
                                expanded: Binding(
                                    get: { past.isActive || open.contains(past.id) },
                                    set: { if $0 { open.insert(past.id) } else { open.remove(past.id) } }
                                )
                            )
                            Hairline(color: ReadingInk.line.opacity(0.4))
                        }
                    }
                    .padding(.horizontal, Space.page)
                }
                .foregroundStyle(ReadingInk.text)
                .navigationTitle("きろく")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar { ToolbarItem(placement: .cancellationAction) { Button("閉じる", systemImage: "xmark") { dismiss() } } }
            }
            .preferredColorScheme(.dark)
            .presentationBackground(Color(hex: 0x1C2130))
        }
    }
}
