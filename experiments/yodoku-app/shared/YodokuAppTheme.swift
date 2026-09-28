import SwiftUI
import UIKit

// uiux-numa の token（tokens/）を iOS へ読み替えた値。rem は 1rem = 16pt で写す。
// 読み替えた点と理由は README の Constraints にある。

enum YK {}

extension YK {
    /// tokens/typography の役割。Dynamic Type に追従させるため、役割ごとに近い text style を基準にする。
    enum Font {
        static func title() -> SwiftUI.Font { .custom("LINESeedJP-Bold", size: 24, relativeTo: .title2) }
        static func heading() -> SwiftUI.Font { .custom("LINESeedJP-Bold", size: 20, relativeTo: .title3) }
        static func body() -> SwiftUI.Font { .custom("LINESeedJP-Regular", size: 16, relativeTo: .body) }
        static func ui() -> SwiftUI.Font { .custom("LINESeedJP-Regular", size: 16, relativeTo: .body) }
        static func control() -> SwiftUI.Font { .custom("LINESeedJP-Bold", size: 16, relativeTo: .body) }
        static func caption() -> SwiftUI.Font { .custom("LINESeedJP-Regular", size: 14, relativeTo: .footnote) }
        static func captionBold() -> SwiftUI.Font { .custom("LINESeedJP-Bold", size: 14, relativeTo: .footnote) }
        /// 読書時間の数字。title の段を使い、桁を等幅にして幅を揺らさない。
        static func timer() -> SwiftUI.Font { title().monospacedDigit() }
    }

    /// tokens/typography の line-height を SwiftUI の行間（追加分）へ換算する。
    enum Leading {
        static let body: CGFloat = 16 * 0.75
        static let ui: CGFloat = 16 * 0.5
        static let caption: CGFloat = 14 * 0.5
        static let tight: CGFloat = 20 * 0.3
    }

    /// tokens/space。
    enum Space {
        static let s50: CGFloat = 2
        static let s100: CGFloat = 4
        static let s150: CGFloat = 6
        static let s200: CGFloat = 8
        static let s300: CGFloat = 12
        static let s400: CGFloat = 16
        static let s500: CGFloat = 20
        static let s600: CGFloat = 24
        static let s1000: CGFloat = 40
        static let s2000: CGFloat = 80
        /// 画面の左右。Web の page-inline（24）ではなく space-500 を使う。393pt 幅で本文の行長を確保するため。
        static let page: CGFloat = s500
        static let section: CGFloat = s1000
    }

    /// tokens/radius。
    enum Radius {
        static let control: CGFloat = 6
        static let surface: CGFloat = 10
    }

    /// tokens/size。押せる領域の最小は iOS の 44pt に読み替える。
    enum Size {
        static let controlSm: CGFloat = 32
        static let controlMd: CGFloat = 40
        static let controlLg: CGFloat = 48
        static let target: CGFloat = 44
    }

    /// tokens/motion。
    enum Motion {
        static let state = Animation.timingCurve(0.25, 0.1, 0.25, 1, duration: 0.12)
        static let press = Animation.timingCurve(0, 0, 0.58, 1, duration: 0.16)
        static let entrance = Animation.timingCurve(0.22, 1, 0.36, 1, duration: 0.9)

        /// 動きの抑制が有効なら、位置と大きさの動きを同じ短いクロスフェードへ縮める。
        static func resolve(_ animation: Animation, reduceMotion: Bool) -> Animation {
            reduceMotion ? .easeInOut(duration: 0.12) : animation
        }
    }
}

// MARK: - 色

extension YK {
    /// 通常画面の色。experiments/color-schemes-material の `sumi` の役割から、この画面で使う役割だけを引く。
    enum Palette {
        static let background = dynamic(light: 0xF9F8F8, dark: 0x1B1A1A)
        static let surface = dynamic(light: 0xFEFEFE, dark: 0x272525)
        static let surfaceContainer = dynamic(light: 0xF0EFEF, dark: 0x343232)
        static let onSurface = dynamic(light: 0x1F1F1F, dark: 0xF0F0F0)
        static let onSurfaceVariant = dynamic(light: 0x4D4D4D, dark: 0xC9C9C9)
        static let outline = dynamic(light: 0x757575, dark: 0x9C8B8B)
        static let hairline = dynamic(light: 0xE3DEDE, dark: 0x3F3B3B)
        static let primary = dynamic(light: 0x2B2B2B, dark: 0xF0F0F0)
        static let onPrimary = dynamic(light: 0xFFFDF9, dark: 0x1B1A1A)
        static let error = dynamic(light: 0x9C3E37, dark: 0xE59A91)
    }

    static func dynamic(light: UInt32, dark: UInt32) -> Color {
        Color(uiColor: UIColor { $0.userInterfaceStyle == .dark ? UIColor(hex: dark) : UIColor(hex: light) })
    }
}

extension UIColor {
    convenience init(hex: UInt32) {
        self.init(
            red: CGFloat((hex >> 16) & 0xFF) / 255,
            green: CGFloat((hex >> 8) & 0xFF) / 255,
            blue: CGFloat(hex & 0xFF) / 255,
            alpha: 1
        )
    }
}

extension Color {
    init(hex: UInt32) { self.init(uiColor: UIColor(hex: hex)) }
}

// MARK: - 読書空間

extension YK {
    /// 読書空間の時間帯。境界は Yodoku の reading.md R-11 に従う。
    enum ReadingPeriod: String, CaseIterable, Identifiable {
        case morning, day, evening, night

        var id: String { rawValue }

        var label: String {
            switch self {
            case .morning: "朝"
            case .day: "昼"
            case .evening: "夕"
            case .night: "夜"
            }
        }

        var symbol: String {
            switch self {
            case .morning: "leaf"
            case .day: "sun.max"
            case .evening: "sunset"
            case .night: "moon"
            }
        }

        static func at(_ date: Date, calendar: Calendar = .current) -> ReadingPeriod {
            switch calendar.component(.hour, from: date) {
            case 5 ..< 11: .morning
            case 11 ..< 17: .day
            case 17 ..< 21: .evening
            default: .night
            }
        }

        /// 上端と下端の色。地平線側（下）を明るくする。本文 7:1、補助 4.5:1、線 3:1 を両端で満たす（README に比を記録）。
        var gradient: (top: Color, bottom: Color) {
            switch self {
            case .morning: (Color(hex: 0x1E2638), Color(hex: 0x4A3A45))
            case .day: (Color(hex: 0x14263A), Color(hex: 0x29465E))
            case .evening: (Color(hex: 0x231C33), Color(hex: 0x4E3230))
            case .night: (Color(hex: 0x0D1320), Color(hex: 0x18223A))
            }
        }
    }

    /// 読書空間の文字と線。4 つの時間帯で共通にする。
    enum ReadingInk {
        static let text = Color(hex: 0xF4F1EA)
        static let secondary = Color(hex: 0xBDB8AE)
        static let line = Color(hex: 0xA39E96)
        static let control = Color.white.opacity(0.14)
    }

    struct ReadingBackground: View {
        let period: ReadingPeriod

        var body: some View {
            LinearGradient(
                colors: [period.gradient.top, period.gradient.bottom],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        }
    }
}
