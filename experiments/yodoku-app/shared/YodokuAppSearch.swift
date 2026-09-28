import SwiftUI

// 端末内の検索。search.md。入力のたびに結果を更新し、一致の色付けはしない。

extension YK {
    struct SearchResults: View {
        @Environment(Store.self) private var store
        let query: String
        let onSelect: (_ bookID: UUID, _ focus: UUID?) -> Void

        var body: some View {
            let result = store.search(query)
            ScrollView {
                LazyVStack(alignment: .leading, spacing: Space.s400) {
                    if query.trimmingCharacters(in: .whitespaces).isEmpty {
                        SwiftUI.Text("書名、著者、メモ、余韻から探せます。")
                            .font(Font.ui()).foregroundStyle(Palette.onSurfaceVariant)
                    } else if result.books.isEmpty, result.texts.isEmpty {
                        SwiftUI.Text("見つかりませんでした。語を減らすと見つかることがあります。")
                            .font(Font.ui()).foregroundStyle(Palette.onSurfaceVariant)
                    }
                    if !result.books.isEmpty {
                        SectionTitle(title: "本")
                        ForEach(result.books) { book in
                            Button { onSelect(book.id, nil) } label: {
                                HStack(spacing: Space.s300) {
                                    BookCover(book: book, width: 32)
                                    VStack(alignment: .leading, spacing: Space.s50) {
                                        SwiftUI.Text(book.title).font(Font.ui())
                                        if let author = book.author {
                                            SwiftUI.Text(author).font(Font.caption()).foregroundStyle(Palette.onSurfaceVariant)
                                        }
                                    }
                                    Spacer(minLength: 0)
                                }
                                .contentShape(Rectangle())
                            }
                            .buttonStyle(.plain)
                            .accessibilityElement(children: .combine)
                        }
                    }
                    if !result.texts.isEmpty {
                        SectionTitle(title: "メモと余韻").padding(.top, Space.s400)
                        ForEach(result.texts) { hit in
                            Button { onSelect(hit.bookID, hit.id) } label: {
                                TextHitRow(hit: hit)
                            }
                            .buttonStyle(.plain)
                            Hairline()
                        }
                    }
                }
                .padding(.horizontal, Space.page)
                .padding(.vertical, Space.s400)
            }
            .scrollDismissesKeyboard(.immediately)
            .ykCanvas()
        }
    }

    /// メモと余韻の 1 件。種別、本文、本、日付の順に読む。
    struct TextHitRow: View {
        @Environment(Store.self) private var store
        let hit: TextHit
        var lineLimit: Int? = 2

        var body: some View {
            VStack(alignment: .leading, spacing: Space.s150) {
                Label(hit.kind == .yoin ? "余韻" : "メモ", systemImage: hit.kind == .yoin ? "text.quote" : "note.text")
                    .font(Font.caption())
                    .foregroundStyle(Palette.onSurfaceVariant)
                SwiftUI.Text(hit.excerpt)
                    .font(Font.body())
                    .lineSpacing(Leading.body)
                    .lineLimit(lineLimit)
                    .multilineTextAlignment(.leading)
                SwiftUI.Text("\(store.book(hit.bookID)?.title ?? "")、\(Format.date(hit.createdAt))")
                    .font(Font.caption())
                    .foregroundStyle(Palette.onSurfaceVariant)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .contentShape(Rectangle())
            .accessibilityElement(children: .combine)
        }
    }
}
