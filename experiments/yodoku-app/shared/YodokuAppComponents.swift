import SwiftUI

// 3 つの variant が共有する部品。variant 間で変えるのはナビゲーション、ホーム、読書空間の構成であり、ここの部品は比較軸にしない。

extension YK {
    /// 書影の代わりに描く装丁。書影 API を呼ばないモックのため、書名を刷った無地の表紙にする。
    struct BookCover: View {
        let book: Book
        var width: CGFloat = 64

        var body: some View {
            Cover(title: book.title, author: book.author, hue: book.coverHue, width: width)
                .accessibilityHidden(true)
        }
    }

    struct Cover: View {
        let title: String
        let author: String?
        let hue: Double
        let width: CGFloat

        var body: some View {
            let height = width * 1.5
            RoundedRectangle(cornerRadius: max(2, width * 0.04), style: .continuous)
                .fill(Color(hue: hue, saturation: 0.22, brightness: 0.78))
                .overlay(alignment: .topLeading) {
                    if width >= 56 {
                        VStack(alignment: .leading, spacing: width * 0.04) {
                            SwiftUI.Text(title)
                                .font(.custom("LINESeedJP-Bold", fixedSize: max(7, width * 0.12)))
                                .lineLimit(3)
                            if let author {
                                SwiftUI.Text(author)
                                    .font(.custom("LINESeedJP-Regular", fixedSize: max(6, width * 0.08)))
                                    .lineLimit(1)
                            }
                        }
                        .foregroundStyle(Color(hue: hue, saturation: 0.5, brightness: 0.22))
                        .padding(width * 0.1)
                    }
                }
                .overlay(alignment: .leading) {
                    Rectangle().fill(.black.opacity(0.08)).frame(width: max(1, width * 0.03))
                }
                .frame(width: width, height: height)
                .clipShape(RoundedRectangle(cornerRadius: max(2, width * 0.04), style: .continuous))
        }
    }

    /// 節の見出し。VoiceOver のローターで移れるよう見出しの特性を付ける（Yodoku の点検 Y3）。
    struct SectionTitle: View {
        let title: String
        var trailing: AnyView? = nil

        var body: some View {
            HStack(alignment: .firstTextBaseline) {
                SwiftUI.Text(title)
                    .font(Font.heading())
                    .foregroundStyle(Palette.onSurface)
                    .accessibilityAddTraits(.isHeader)
                Spacer(minLength: Space.s300)
                trailing
            }
        }
    }

    /// 事実の値。アイコンは添え物で、意味は文字が持つ。
    struct Fact: View {
        let symbol: String
        let text: String
        var color: Color = Palette.onSurfaceVariant

        var body: some View {
            HStack(spacing: Space.s100) {
                Image(systemName: symbol).imageScale(.small).accessibilityHidden(true)
                SwiftUI.Text(text)
            }
            .font(Font.caption())
            .foregroundStyle(color)
        }
    }

    struct Hairline: View {
        @Environment(\.displayScale) private var scale
        var color: Color = Palette.hairline
        var body: some View {
            Rectangle().fill(color).frame(height: 1 / scale).accessibilityHidden(true)
        }
    }

    /// 主操作。1 画面に 1 つ。tokens/size の control-height-lg（48）と radius-control を使う。
    struct PrimaryButtonStyle: ButtonStyle {
        @Environment(\.isEnabled) private var isEnabled
        var fill: Color = Palette.primary
        var ink: Color = Palette.onPrimary

        func makeBody(configuration: Configuration) -> some View {
            configuration.label
                .font(Font.control())
                .frame(maxWidth: .infinity, minHeight: Size.controlLg)
                .padding(.horizontal, Space.s400)
                .foregroundStyle(ink)
                .background(fill.opacity(isEnabled ? 1 : 0.35), in: RoundedRectangle(cornerRadius: Radius.control, style: .continuous))
                .opacity(configuration.isPressed ? 0.8 : 1)
                .animation(Motion.press, value: configuration.isPressed)
        }
    }

    /// 副操作。面の色で区別し、枠線を使わない。
    struct SecondaryButtonStyle: ButtonStyle {
        var fill: Color = Palette.surfaceContainer
        var ink: Color = Palette.onSurface

        func makeBody(configuration: Configuration) -> some View {
            configuration.label
                .font(Font.control())
                .frame(minHeight: Size.target)
                .padding(.horizontal, Space.s400)
                .foregroundStyle(ink)
                .background(fill, in: RoundedRectangle(cornerRadius: Radius.control, style: .continuous))
                .opacity(configuration.isPressed ? 0.7 : 1)
        }
    }

    /// 読書時間。1 秒ごとに再計算するが、表示は分単位なので分が変わるときだけ文字が変わる。
    struct ReadingTime: View {
        let session: Session
        var font: SwiftUI.Font = Font.timer()

        var body: some View {
            TimelineView(.periodic(from: .now, by: 1)) { context in
                SwiftUI.Text(Format.duration(session.readingDuration(now: context.date)))
                    .font(font)
                    .contentTransition(.numericText())
            }
        }
    }

    /// 読書中か一時停止中かの文字。色だけに頼らず文字で示す。
    static func stateLabel(_ session: Session) -> String {
        session.isPaused ? "一時停止中" : "読書中"
    }
}

// MARK: - 取り消しの通知

extension YK {
    /// 削除の直後に出す取り消し。book-detail.md R-12 の 5 秒に従うが、VoiceOver の利用中は自動で閉じない（Yodoku の点検 Y4）。
    struct UndoBanner: ViewModifier {
        @Bindable var store: Store
        @State private var hideTask: Task<Void, Never>?

        func body(content: Content) -> some View {
            content.safeAreaInset(edge: .bottom, spacing: 0) {
                if let item = store.undo {
                    HStack(spacing: Space.s300) {
                        SwiftUI.Text(item.message)
                            .font(Font.ui())
                            .lineLimit(2)
                        Spacer(minLength: Space.s200)
                        Button("取り消す") { item.restore() }
                            .font(Font.control())
                            .frame(minHeight: Size.target)
                    }
                    .foregroundStyle(Palette.onPrimary)
                    .padding(.horizontal, Space.s400)
                    .padding(.vertical, Space.s100)
                    .background(Palette.primary, in: RoundedRectangle(cornerRadius: Radius.surface, style: .continuous))
                    .padding(.horizontal, Space.page)
                    .padding(.bottom, Space.s200)
                    .transition(.opacity)
                    .id(item.id)
                    .task(id: item.id) {
                        guard !UIAccessibility.isVoiceOverRunning else { return }
                        try? await Task.sleep(for: .seconds(5))
                        if store.undo?.id == item.id { store.undo = nil }
                    }
                }
            }
            .animation(Motion.state, value: store.undo?.id)
        }
    }
}

extension View {
    func ykUndoBanner(_ store: YK.Store) -> some View { modifier(YK.UndoBanner(store: store)) }

    /// 通常画面の地。
    func ykCanvas() -> some View {
        background(YK.Palette.background.ignoresSafeArea())
            .foregroundStyle(YK.Palette.onSurface)
            .tint(YK.Palette.primary)
    }
}
