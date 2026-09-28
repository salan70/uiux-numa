import SwiftUI

// 本の追加。book-search.md と book-add.md。検索は明示の操作で行い、見つからないときも手動で加えられる。

extension YK {
    struct BookLookup: View {
        @Environment(Store.self) private var store
        @Environment(\.dismiss) private var dismiss

        enum Phase: Equatable { case idle, loading, done(LookupResult) }

        @State private var query = ""
        @State private var phase: Phase = .idle
        @State private var manual = false
        @State private var credits = false
        @FocusState private var focused: Bool

        private var trimmed: String { query.trimmingCharacters(in: .whitespacesAndNewlines) }
        /// R-7: ISBN 以外は 2 字以上で検索できる。
        private var canSearch: Bool { trimmed.count >= 2 && phase != .loading }

        var body: some View {
            NavigationStack {
                VStack(spacing: 0) {
                    searchField
                    ScrollView {
                        VStack(alignment: .leading, spacing: Space.s400) { content }
                            .padding(.horizontal, Space.page)
                            .padding(.vertical, Space.s400)
                    }
                    .scrollDismissesKeyboard(.immediately)
                }
                .ykCanvas()
                .safeAreaInset(edge: .bottom) {
                    Button("手動で追加") { manual = true }
                        .buttonStyle(SecondaryButtonStyle())
                        .padding(.vertical, Space.s300)
                        .frame(maxWidth: .infinity)
                        .background(.bar)
                }
                .navigationTitle("本を追加")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) { Button("閉じる", systemImage: "xmark") { dismiss() } }
                    ToolbarItem(placement: .topBarTrailing) { Button("クレジット", systemImage: "info.circle") { credits = true } }
                }
                .navigationDestination(isPresented: $manual) { ManualBookForm { dismiss() } }
                .sheet(isPresented: $credits) { Credits() }
            }
            .onAppear { focused = true }
        }

        private var searchField: some View {
            HStack(spacing: Space.s200) {
                Image(systemName: "magnifyingglass").foregroundStyle(Palette.onSurfaceVariant).accessibilityHidden(true)
                TextField("書名、著者、ISBN", text: $query)
                    .font(Font.ui())
                    .focused($focused)
                    .submitLabel(.search)
                    .onSubmit(search)
                Button("検索", action: search)
                    .font(Font.control())
                    .disabled(!canSearch)
                    .frame(minHeight: Size.target)
            }
            .padding(.horizontal, Space.s300)
            .background(Palette.surfaceContainer, in: RoundedRectangle(cornerRadius: Radius.surface, style: .continuous))
            .padding(.horizontal, Space.page)
            .padding(.vertical, Space.s200)
        }

        @ViewBuilder private var content: some View {
            switch phase {
            case .idle:
                SwiftUI.Text(trimmed.count == 1 ? "2 字以上で検索できます。" : "書名、著者、ISBN のどれかで探せます。")
                    .font(Font.ui()).foregroundStyle(Palette.onSurfaceVariant)
            case .loading:
                HStack(spacing: Space.s200) {
                    ProgressView()
                    SwiftUI.Text("検索しています").font(Font.ui()).foregroundStyle(Palette.onSurfaceVariant)
                }
            case .done(.empty):
                SwiftUI.Text("見つかりませんでした。書名を短くするか、手動で追加できます。")
                    .font(Font.ui()).foregroundStyle(Palette.onSurfaceVariant)
            case .done(.failed):
                VStack(alignment: .leading, spacing: Space.s300) {
                    SwiftUI.Text("検索できませんでした。通信を確かめて、もう一度試してください。")
                        .font(Font.ui())
                    Button("もう一度検索", action: search).buttonStyle(SecondaryButtonStyle())
                }
            case .done(.results(let books)):
                ForEach(books) { book in
                    ResultRow(book: book) {
                        store.addBook(title: book.title, author: book.author, isbn: book.isbn, hue: book.hue)
                        dismiss()
                    }
                    Hairline()
                }
            }
        }

        private func search() {
            guard canSearch else { return }
            phase = .loading
            let q = trimmed
            Task {
                let result = await store.lookup(q)
                phase = .done(result)
            }
        }
    }

    private struct ResultRow: View {
        let book: LookupBook
        let add: () -> Void

        var body: some View {
            HStack(alignment: .top, spacing: Space.s300) {
                Cover(title: book.title, author: book.author, hue: book.hue, width: 48).accessibilityHidden(true)
                VStack(alignment: .leading, spacing: Space.s100) {
                    SwiftUI.Text(book.title).font(Font.ui())
                    SwiftUI.Text([book.author, book.publisher, book.year].compactMap { $0 }.joined(separator: "、"))
                        .font(Font.caption()).foregroundStyle(Palette.onSurfaceVariant)
                    SwiftUI.Text(book.isbn.map { "ISBN \($0)" } ?? "ISBN なし")
                        .font(Font.caption().monospacedDigit()).foregroundStyle(Palette.onSurfaceVariant)
                    if book.isbn != nil {
                        Link("楽天ブックスで見る", destination: URL(string: "https://books.rakuten.co.jp/")!)
                            .font(Font.caption())
                            .frame(minHeight: Size.target)
                    }
                }
                Spacer(minLength: 0)
                Button("追加", action: add)
                    .buttonStyle(SecondaryButtonStyle())
                    .accessibilityLabel("「\(book.title)」を追加")
            }
        }
    }

    struct ManualBookForm: View {
        @Environment(Store.self) private var store
        @State private var title = ""
        @State private var author = ""
        @State private var tried = false
        let done: () -> Void

        var body: some View {
            Form {
                Section {
                    TextField("書名", text: $title)
                    if tried, title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                        SwiftUI.Text("書名を入力してください。").font(Font.caption()).foregroundStyle(Palette.error)
                    }
                    TextField("著者（任意）", text: $author)
                } footer: {
                    SwiftUI.Text("検索で見つからない本も、書名だけで加えられます。")
                }
            }
            .navigationTitle("手動で追加")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存", systemImage: "checkmark") {
                        tried = true
                        if store.addBook(title: title, author: author, isbn: nil) != nil { done() }
                    }
                }
            }
        }
    }

    /// book-search.md R-11 のクレジット。
    struct Credits: View {
        @Environment(\.dismiss) private var dismiss

        var body: some View {
            NavigationStack {
                List {
                    SwiftUI.Text("Supported by Rakuten Developers")
                    SwiftUI.Text("国立国会図書館サーチ API（全国書誌）を利用しています。CC BY 4.0")
                }
                .font(Font.ui())
                .navigationTitle("クレジット")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar { ToolbarItem(placement: .cancellationAction) { Button("閉じる", systemImage: "xmark") { dismiss() } } }
            }
            .presentationDetents([.medium])
        }
    }
}
