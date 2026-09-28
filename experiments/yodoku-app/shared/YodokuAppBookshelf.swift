import SwiftUI

// 本棚。bookshelf.md。並びは R-6 で固定し、並べ替えは置かない。

extension YK {
    struct Bookshelf: View {
        @Environment(Store.self) private var store
        @AppStorage("yk.shelf.columns") private var columns = 3
        let onSelect: (UUID) -> Void
        let onAdd: () -> Void

        var body: some View {
            ScrollView {
                VStack(alignment: .leading, spacing: Space.section) {
                    if store.books.isEmpty {
                        EmptyShelf(onAdd: onAdd)
                    } else {
                        densityPicker
                        grid
                    }
                }
                .padding(.horizontal, Space.page)
                .padding(.vertical, Space.s400)
            }
            .ykCanvas()
        }

        private var densityPicker: some View {
            Picker("表示", selection: $columns.animation(Motion.state)) {
                Label("1 列", systemImage: "rectangle.grid.1x2").tag(1)
                Label("2 列", systemImage: "square.grid.2x2").tag(2)
                Label("3 列", systemImage: "square.grid.3x3").tag(3)
            }
            .pickerStyle(.segmented)
        }

        private var grid: some View {
            LazyVGrid(
                columns: Array(repeating: GridItem(.flexible(), spacing: Space.s400, alignment: .top), count: columns),
                alignment: .leading,
                spacing: Space.s600
            ) {
                ForEach(store.bookshelf) { book in
                    Button { onSelect(book.id) } label: {
                        ShelfItem(book: book, columns: columns)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    struct ShelfItem: View {
        @Environment(Store.self) private var store
        let book: Book
        let columns: Int

        var body: some View {
            let layout = columns == 1 ? AnyLayout(HStackLayout(alignment: .top, spacing: Space.s400)) : AnyLayout(VStackLayout(alignment: .leading, spacing: Space.s200))
            layout {
                GeometryReader { geo in
                    BookCover(book: book, width: geo.size.width)
                }
                .aspectRatio(2 / 3, contentMode: .fit)
                .frame(width: columns == 1 ? 72 : nil)
                VStack(alignment: .leading, spacing: Space.s100) {
                    SwiftUI.Text(book.title)
                        .font(columns == 3 ? Font.caption() : Font.control())
                        .lineLimit(columns == 1 ? 3 : 2)
                    if columns < 3, let author = book.author {
                        SwiftUI.Text(author).font(Font.caption()).foregroundStyle(Palette.onSurfaceVariant).lineLimit(1)
                    }
                    facts
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .accessibilityElement(children: .combine)
            .accessibilityAddTraits(.isButton)
        }

        @ViewBuilder private var facts: some View {
            let count = store.sessions(of: book.id).count
            let lines: [String] = [
                store.lastRead(book, now: .now).map { if case .ago(let s) = $0 { s } else { "読書中" } },
                store.cycleLabel(book),
                count > 0 ? Format.count(count, "回") : "未読",
            ].compactMap { $0 }
            SwiftUI.Text(lines.joined(separator: "、"))
                .font(Font.caption())
                .foregroundStyle(Palette.onSurfaceVariant)
                .lineLimit(columns == 3 ? 2 : nil)
        }
    }

    struct EmptyShelf: View {
        let onAdd: () -> Void

        var body: some View {
            VStack(alignment: .leading, spacing: Space.s400) {
                SwiftUI.Text("まだ本がありません。")
                    .font(Font.heading())
                    .accessibilityAddTraits(.isHeader)
                SwiftUI.Text("書名か ISBN で探して、本棚に加えられます。")
                    .font(Font.ui())
                    .foregroundStyle(Palette.onSurfaceVariant)
                Button("本を追加", systemImage: "plus", action: onAdd)
                    .buttonStyle(PrimaryButtonStyle())
            }
            .padding(.vertical, Space.s1000)
        }
    }
}
