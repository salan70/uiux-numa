import SwiftUI

// 画面の行き先。どの variant でも同じ実体へ結ぶ（Information Architecture: 置き場所を 1 つに決める）。

extension YK {
    enum Route: Hashable {
        case book(UUID, focus: UUID? = nil)
        case session(UUID)
        case shelf
        case stats
    }

    struct RouteDestinations: ViewModifier {
        @Binding var path: [Route]
        let onAdd: () -> Void

        func body(content: Content) -> some View {
            content.navigationDestination(for: Route.self) { route in
                switch route {
                case let .book(id, focus):
                    BookDetail(bookID: id, focusID: focus)
                case let .session(id):
                    SessionDetail(sessionID: id)
                case .shelf:
                    Bookshelf(onSelect: { path.append(.book($0)) }, onAdd: onAdd)
                        .navigationTitle("本棚")
                case .stats:
                    Statistics(onSelectBook: { path.append(.book($0)) })
                        .navigationTitle("ふりかえり")
                }
            }
        }
    }
}

extension View {
    func ykRoutes(_ path: Binding<[YK.Route]>, onAdd: @escaping () -> Void) -> some View {
        modifier(YK.RouteDestinations(path: path, onAdd: onAdd))
    }
}
