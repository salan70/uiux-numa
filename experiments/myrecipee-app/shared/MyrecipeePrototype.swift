import SwiftUI

enum MyrecipeeDirection { case index, cards, prep }

struct MyrecipeeIngredient: Hashable {
    let name: String
    let amount: Double
    let unit: String
}

struct MyrecipeeRecipe: Identifiable, Hashable {
    let id: String
    var title: String
    var tag: String
    var memo: String
    let symbol: String
    let ingredients: [MyrecipeeIngredient]
    let steps: [String]

    static let examples: [Self] = [
        .init(id: "chicken", title: "鶏肉ときのこの炊き込みご飯", tag: "主食", memo: "しょうがを多めに。翌日のおにぎりにも。", symbol: "takeoutbag.and.cup.and.straw", ingredients: [.init(name: "米", amount: 2, unit: "合"), .init(name: "鶏もも肉", amount: 200, unit: "g"), .init(name: "しめじ", amount: 100, unit: "g")], steps: ["米を研ぎ、30 分ほど水に浸す。", "鶏肉をひと口大に切り、しめじをほぐす。", "炊飯器に米、調味料、水、具材を入れて炊く。"]),
        .init(id: "salmon", title: "鮭のバターしょうゆ焼き", tag: "主菜", memo: "仕上げにレモンを添える。", symbol: "fish", ingredients: [.init(name: "鮭", amount: 2, unit: "切れ"), .init(name: "しめじ", amount: 100, unit: "g"), .init(name: "バター", amount: 10, unit: "g")], steps: ["鮭の水気を拭き、塩を振る。", "バターを熱し、鮭としめじを焼く。", "しょうゆを回しかける。"]),
        .init(id: "salad", title: "トマトと大葉のサラダ", tag: "副菜", memo: "食べる直前に和える。", symbol: "carrot", ingredients: [.init(name: "トマト", amount: 2, unit: "個"), .init(name: "大葉", amount: 4, unit: "枚")], steps: ["トマトを切り、大葉を刻む。", "塩とオリーブオイルで和える。"]),
        .init(id: "soup", title: "豆腐としめじのみそ汁", tag: "汁物", memo: "みそを入れたら煮立たせない。", symbol: "mug", ingredients: [.init(name: "豆腐", amount: 150, unit: "g"), .init(name: "しめじ", amount: 100, unit: "g")], steps: ["だしでしめじを煮る。", "豆腐を加え、火を止めてみそを溶く。"]),
    ]
}

struct MyrecipeePrototype: View {
    let direction: MyrecipeeDirection
    @State private var recipes = MyrecipeeRecipe.examples
    @State private var path: [MyrecipeeRecipe] = []
    @State private var tab = 0
    @State private var query = ""
    @State private var tag = "すべて"
    @State private var cart: [String: Int] = [:]
    @State private var checked: Set<String> = []
    @State private var skipped: Set<String> = []
    @State private var editor: MyrecipeeRecipe?
    @State private var showCreate = false
    @State private var confirmClear = false
    @State private var confirmFinish = false
    @State private var history: [String] = []
    @State private var showHistory = false
    @State private var showSettings = false
    @State private var notice: String?
    @Environment(\.colorScheme) private var scheme
    @Environment(\.dynamicTypeSize) private var textSize

    // 現行のコバルト色を継承し、背景は OS の明暗に従う。
    private let cobalt = Color(red: 0.24, green: 0.45, blue: 0.99)
    private var paper: Color { Color(uiColor: .systemGroupedBackground) }
    private var surface: Color { Color(uiColor: .secondarySystemGroupedBackground) }

    init(direction: MyrecipeeDirection) {
        self.direction = direction
        let defaults = UserDefaults.standard
        let fixture = defaults.string(forKey: "fixture") ?? "saved"
        _recipes = State(initialValue: fixture == "empty" ? [] : MyrecipeeRecipe.examples)
        _cart = State(initialValue: fixture == "planned" ? ["chicken": 2, "soup": 2] : [:])
        let screen = defaults.string(forKey: "screen") ?? "recipes"
        _tab = State(initialValue: screen == "shopping" ? 2 : screen == "cart" ? 1 : 0)
        _path = State(initialValue: screen == "detail" && fixture != "empty" ? [MyrecipeeRecipe.examples[0]] : [])
    }

    var body: some View {
        TabView(selection: $tab) {
            NavigationStack(path: $path) {
                library
                    .navigationTitle(direction == .prep ? "料理の準備" : "レシピ")
                    .toolbar {
                        ToolbarItem(placement: .topBarLeading) {
                            Button { showSettings = true } label: { Image(systemName: "gearshape") }
                                .accessibilityLabel("設定")
                        }
                        ToolbarItem(placement: .topBarTrailing) {
                            Button { showCreate = true } label: { Image(systemName: "plus") }
                                .accessibilityLabel("レシピを追加")
                        }
                    }
                    .navigationDestination(for: MyrecipeeRecipe.self) { recipe in
                        detail(recipes.first(where: { $0.id == recipe.id }) ?? recipe)
                    }
            }
            .tabItem { Label("レシピ", systemImage: "book.closed") }.tag(0)
            NavigationStack { cartScreen }
                .tabItem { Label("カート", systemImage: "basket") }.tag(1)
                .badge(cart.count)
            NavigationStack { shoppingScreen }
                .tabItem { Label("買い物", systemImage: "checklist") }.tag(2)
        }
        .tint(cobalt)
        .sheet(isPresented: $showCreate) { MyrecipeeEditor { recipes.insert($0, at: 0) } }
        .sheet(item: $editor) { recipe in
            MyrecipeeEditor(recipe: recipe) { updated in
                if let index = recipes.firstIndex(where: { $0.id == updated.id }) { recipes[index] = updated }
            }
        }
        .sheet(isPresented: $showSettings) {
            NavigationStack {
                Form {
                    Section("表示") { Text("外観は端末の設定に合わせます") }
                    Section("この試作") { Text("入力と買い物の状態は、起動中だけ保持されます。") }
                }
                .navigationTitle("設定")
                .toolbar { ToolbarItem(placement: .confirmationAction) { Button("閉じる") { showSettings = false } } }
            }
        }
        .sheet(isPresented: $showHistory) {
            NavigationStack {
                List {
                    if history.isEmpty { Text("買い物の履歴はありません").foregroundStyle(Color.secondary) }
                    ForEach(Array(history.enumerated()), id: \.offset) { _, record in Text(record) }
                }
                .navigationTitle("買い物の履歴")
                .toolbar { ToolbarItem(placement: .confirmationAction) { Button("閉じる") { showHistory = false } } }
            }
        }
        .alert("カートを空にしますか？", isPresented: $confirmClear) {
            Button("キャンセル", role: .cancel) {}
            Button("空にする", role: .destructive) { cart.removeAll(); checked.removeAll(); skipped.removeAll() }
        } message: { Text("カートのレシピと買い物リストを取り除きます。保存したレシピは残ります。") }
        .alert("買い物を完了しますか？", isPresented: $confirmFinish) {
            Button("キャンセル", role: .cancel) {}
            Button("完了する") {
                history.insert("\(cart.count) 品の料理 / \(shoppingItems.filter { checked.contains(itemKey($0)) }.count) 件購入", at: 0)
                cart.removeAll(); checked.removeAll(); skipped.removeAll(); notice = "買い物を履歴に保存しました"
            }
        } message: { Text("チェックしていない材料も含め、カートを空にして履歴へ移します。") }
        .alert("買い物", isPresented: Binding(get: { notice != nil }, set: { if !$0 { notice = nil } })) {
            Button("閉じる") { notice = nil }
        } message: { Text(notice ?? "") }
    }

    private var filtered: [MyrecipeeRecipe] {
        recipes.filter {
            (tag == "すべて" || $0.tag == tag) && (query.isEmpty ||
                ($0.title + $0.tag + $0.ingredients.map(\.name).joined()).localizedStandardContains(query))
        }
    }

    private var library: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                if direction == .prep && query.isEmpty && tag == "すべて" { prepHeader }
                HStack {
                    Text(direction == .cards ? "わたしの料理帳" : "保存したレシピ").font(.title2.bold())
                    Spacer()
                    Text("\(recipes.count) 品").foregroundStyle(Color.secondary)
                }
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(["すべて", "主食", "主菜", "副菜", "汁物"], id: \.self) { label in
                            Button { tag = label } label: {
                                Text(label).font(.subheadline.weight(.medium))
                                    .padding(.horizontal, 16).frame(minHeight: 44)
                                    .background(tag == label ? cobalt : surface, in: Capsule())
                                    .foregroundStyle(tag == label ? Color.white : Color.primary)
                            }
                            .accessibilityAddTraits(tag == label ? .isSelected : [])
                        }
                    }
                }
                if filtered.isEmpty {
                    ContentUnavailableView {
                        Label(recipes.isEmpty ? "レシピを保存する" : "見つかりませんでした", systemImage: "book.closed")
                    } description: {
                        Text(recipes.isEmpty ? "料理の材料と作り方を記録できます。" : "名前、材料、タグで検索できます。")
                    } actions: {
                        Button(recipes.isEmpty ? "レシピを追加" : "絞り込みを解除") {
                            if recipes.isEmpty { showCreate = true } else { query = ""; tag = "すべて" }
                        }.buttonStyle(.borderedProminent)
                    }
                } else {
                    LazyVStack(spacing: direction == .cards ? 20 : 8) {
                        ForEach(filtered) { recipe in
                            NavigationLink(value: recipe) {
                                if direction == .cards { recipeCard(recipe) } else { recipeRow(recipe) }
                            }.buttonStyle(.plain)
                        }
                    }
                }
            }.padding(20)
        }
        .background(paper)
        .searchable(text: $query, prompt: "レシピ名、材料、タグ")
    }

    private var prepHeader: some View {
        VStack(alignment: .leading, spacing: 20) {
            Label("作る料理", systemImage: "basket").font(.subheadline.bold())
            Text(cart.isEmpty ? "カートは空です" : "\(cart.count) 品の料理を準備中")
                .font(.title.bold())
            if cart.isEmpty {
                Text("レシピを選んで、必要な人数分を追加します。")
                    .font(.subheadline)
            } else {
                ForEach(cartRecipes) { recipe in
                    HStack { Text(recipe.title); Spacer(); Text("\(cart[recipe.id] ?? 2) 人分").monospacedDigit() }
                        .font(.subheadline)
                }
                Button { tab = 2 } label: {
                    HStack { Text("買い物リストへ"); Spacer(); Image(systemName: "arrow.right") }
                        .frame(minHeight: 44)
                }.foregroundStyle(.white)
            }
        }
        .padding(24).frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 0.14, green: 0.33, blue: 0.8), in: RoundedRectangle(cornerRadius: 10))
        .foregroundStyle(.white)
    }

    private func recipeRow(_ recipe: MyrecipeeRecipe) -> some View {
        HStack(spacing: 16) {
            Image(systemName: recipe.symbol).font(.title2)
                .foregroundStyle(cobalt).frame(width: 52, height: 64)
                .background(cobalt.opacity(0.08), in: RoundedRectangle(cornerRadius: 6))
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 6) {
                Text(recipe.title).font(.headline)
                Text("\(recipe.tag) / 2 人分").font(.caption).foregroundStyle(Color.secondary)
                Label("カートに追加済み", systemImage: "checkmark")
                    .font(.caption).foregroundStyle(cobalt)
                    .opacity(cart[recipe.id] == nil ? 0 : 1)
                    .accessibilityHidden(cart[recipe.id] == nil)
            }
            Spacer(minLength: 0)
            Image(systemName: "chevron.right").font(.caption).foregroundStyle(.tertiary)
        }.padding(12).frame(maxWidth: .infinity, alignment: .leading)
            .background(surface, in: RoundedRectangle(cornerRadius: 10))
    }

    private func recipeCard(_ recipe: MyrecipeeRecipe) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            ZStack(alignment: .bottomLeading) {
                cobalt.opacity(scheme == .dark ? 0.2 : 0.08)
                Image(systemName: recipe.symbol).font(.system(size: 68, weight: .ultraLight))
                    .foregroundStyle(cobalt.opacity(0.7)).frame(maxWidth: .infinity, maxHeight: .infinity)
                Text(recipe.tag.uppercased()).font(.caption.bold()).tracking(2)
                    .foregroundStyle(cobalt).padding(20)
            }.frame(height: 148).accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 10) {
                Text(recipe.title).font(.title3.bold())
                Text(recipe.memo).font(.subheadline).foregroundStyle(Color.secondary)
                HStack {
                    Text("2 人分").font(.caption)
                    Spacer()
                    Label(cart[recipe.id] == nil ? "材料と作り方" : "カートに追加済み", systemImage: cart[recipe.id] == nil ? "arrow.up.right" : "checkmark")
                        .font(.caption.bold()).foregroundStyle(cobalt)
                }
            }.padding(20)
        }.background(surface).clipShape(RoundedRectangle(cornerRadius: 10))
    }

    private func detail(_ recipe: MyrecipeeRecipe) -> some View {
        MyrecipeeDetail(recipe: recipe, servings: cart[recipe.id] ?? 2, added: cart[recipe.id] != nil, add: { servings in
            updateCart(recipe.id, servings: servings)
        }, edit: { editor = recipe }, openCart: { tab = 1 })
    }

    private var cartRecipes: [MyrecipeeRecipe] { recipes.filter { cart[$0.id] != nil } }

    private func updateCart(_ id: String, servings: Int?) {
        let before = Dictionary(uniqueKeysWithValues: shoppingItems.map { (itemKey($0), $0.amount) })
        cart[id] = servings
        let after = Dictionary(uniqueKeysWithValues: shoppingItems.map { (itemKey($0), $0.amount) })
        // 人数が変わって必要量が変わった材料は、購入済みのままにしない。
        checked = checked.filter { before[$0] == after[$0] && after[$0] != nil }
        skipped = skipped.filter { after[$0] != nil }
    }

    private var cartScreen: some View {
        List {
            if cart.isEmpty {
                ContentUnavailableView {
                    Label("作る料理を選ぶ", systemImage: "basket")
                } description: { Text("追加したレシピの材料を、人数に合わせてまとめます。") }
                actions: { Button("レシピを見る") { tab = 0 }.buttonStyle(.borderedProminent) }
            } else {
                Section("\(cart.count) 品の料理") {
                    ForEach(cartRecipes) { recipe in
                        VStack(alignment: .leading, spacing: 12) {
                            Text(recipe.title).font(.headline)
                            Stepper("\(cart[recipe.id] ?? 2) 人分", value: Binding(get: { cart[recipe.id] ?? 2 }, set: { updateCart(recipe.id, servings: $0) }), in: 1...12)
                        }.padding(.vertical, 8)
                            .swipeActions { Button("取り除く", role: .destructive) { updateCart(recipe.id, servings: nil) } }
                    }
                }
                Section {
                    Button { tab = 2 } label: { Label("買い物リストを見る", systemImage: "checklist").frame(minHeight: 44) }
                } footer: { Text("同じ材料をまとめ、人数分に換算します。") }
            }
        }.navigationTitle("カート")
            .toolbar { if !cart.isEmpty { Button("空にする", role: .destructive) { confirmClear = true } } }
    }

    private var shoppingItems: [MyrecipeeIngredient] {
        var values: [String: MyrecipeeIngredient] = [:]
        for recipe in cartRecipes {
            for ingredient in recipe.ingredients {
                let key = ingredient.name + ingredient.unit
                let amount = ingredient.amount * Double(cart[recipe.id] ?? 2) / 2
                values[key] = .init(name: ingredient.name, amount: (values[key]?.amount ?? 0) + amount, unit: ingredient.unit)
            }
        }
        return values.values.sorted { $0.name < $1.name }
    }

    private func itemKey(_ item: MyrecipeeIngredient) -> String { item.name + item.unit }

    private var shoppingScreen: some View {
        List {
            if shoppingItems.isEmpty {
                ContentUnavailableView {
                    Label("買い物リストは空です", systemImage: "checklist")
                } description: { Text("カートにレシピを追加すると材料が並びます。") }
                actions: { Button("レシピを見る") { tab = 0 }.buttonStyle(.borderedProminent) }
            } else {
                Section {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("あと \(shoppingItems.filter { !checked.contains(itemKey($0)) && !skipped.contains(itemKey($0)) }.count) 件").font(.title2.bold())
                        ProgressView(value: Double(shoppingItems.filter { checked.contains(itemKey($0)) || skipped.contains(itemKey($0)) }.count), total: Double(shoppingItems.count))
                    }.padding(.vertical, 8)
                }
                Section("買う") {
                    ForEach(shoppingItems.filter { !skipped.contains(itemKey($0)) }, id: \.self) { item in shoppingRow(item) }
                }
                if !skipped.isEmpty {
                    Section("買わない") {
                        ForEach(shoppingItems.filter { skipped.contains(itemKey($0)) }, id: \.self) { item in shoppingRow(item) }
                    }
                }
                Section {
                    Button("買い物を完了") { confirmFinish = true }.frame(minHeight: 44)
                }
            }
        }.navigationTitle("買い物")
            .toolbar { Button { showHistory = true } label: { Image(systemName: "clock.arrow.circlepath") }.accessibilityLabel("買い物の履歴") }
    }

    private func shoppingRow(_ item: MyrecipeeIngredient) -> some View {
        let key = itemKey(item)
        return Button {
            if skipped.contains(key) { skipped.remove(key) }
            else if checked.contains(key) { checked.remove(key) } else { checked.insert(key) }
        } label: {
            HStack(spacing: 16) {
                Image(systemName: skipped.contains(key) ? "minus.circle" : checked.contains(key) ? "checkmark.circle.fill" : "circle")
                    .font(.title2).foregroundStyle(cobalt).frame(width: 28)
                if textSize.isAccessibilitySize {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(item.name).strikethrough(checked.contains(key)).foregroundStyle(Color.primary)
                        Text("\(item.amount.formatted(.number.precision(.fractionLength(0...1)))) \(item.unit)")
                            .monospacedDigit().foregroundStyle(Color.secondary)
                    }.frame(maxWidth: .infinity, alignment: .leading)
                } else {
                    Text(item.name).strikethrough(checked.contains(key)).foregroundStyle(Color.primary)
                    Spacer()
                    Text("\(item.amount.formatted(.number.precision(.fractionLength(0...1)))) \(item.unit)")
                        .monospacedDigit().foregroundStyle(Color.secondary)
                }
            }.frame(minHeight: 44)
        }
        .accessibilityLabel("\(item.name)、\(item.amount.formatted()) \(item.unit)、\(checked.contains(key) ? "購入済み" : skipped.contains(key) ? "買わない" : "未購入")")
        .swipeActions(edge: .leading) {
            Button(skipped.contains(key) ? "買う" : "買わない") {
                checked.remove(key)
                if skipped.contains(key) { skipped.remove(key) } else { skipped.insert(key) }
            }.tint(.orange)
        }
        .contextMenu {
            Button(skipped.contains(key) ? "買うリストへ" : "買わないリストへ") {
                checked.remove(key)
                if skipped.contains(key) { skipped.remove(key) } else { skipped.insert(key) }
            }
        }
    }
}

private struct MyrecipeeDetail: View {
    let recipe: MyrecipeeRecipe
    @State var servings: Int
    let added: Bool
    let add: (Int) -> Void
    let edit: () -> Void
    let openCart: () -> Void
    @State private var section = "材料"
    @State private var completedSteps: Set<Int> = []

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Text(recipe.tag).font(.caption.bold()).foregroundStyle(.tint)
                Text(recipe.title).font(.largeTitle.bold())
                if !recipe.memo.isEmpty { Text(recipe.memo).foregroundStyle(Color.secondary) }
                Stepper("\(servings) 人分", value: $servings, in: 1...12).font(.headline)
                Picker("表示", selection: $section) {
                    Text("材料").tag("材料"); Text("作り方").tag("作り方")
                }.pickerStyle(.segmented)
                if section == "材料" {
                    ForEach(recipe.ingredients, id: \.self) { ingredient in
                        HStack {
                            Text(ingredient.name); Spacer()
                            Text("\((ingredient.amount * Double(servings) / 2).formatted(.number.precision(.fractionLength(0...1)))) \(ingredient.unit)").monospacedDigit()
                        }.frame(minHeight: 44)
                        Divider()
                    }
                    Text("材料の量は 2 人分のレシピから換算しています。")
                        .font(.caption).foregroundStyle(Color.secondary)
                } else {
                    ForEach(Array(recipe.steps.enumerated()), id: \.offset) { index, step in
                        Button {
                            if completedSteps.contains(index) { completedSteps.remove(index) } else { completedSteps.insert(index) }
                        } label: {
                            HStack(alignment: .top, spacing: 16) {
                                Text(completedSteps.contains(index) ? "✓" : "\(index + 1)")
                                    .font(.headline).frame(width: 32, height: 32)
                                    .background(Color.accentColor.opacity(0.1), in: Circle())
                                Text(step).foregroundStyle(Color.primary).frame(maxWidth: .infinity, alignment: .leading)
                            }.padding(.vertical, 8)
                        }.accessibilityLabel("手順 \(index + 1)、\(step)、\(completedSteps.contains(index) ? "完了" : "未完了")")
                    }
                }
            }.padding(24)
        }
        .navigationTitle("レシピ").navigationBarTitleDisplayMode(.inline)
        .toolbar { Button("編集", action: edit) }
        .safeAreaInset(edge: .bottom) {
            VStack(spacing: 8) {
                Button { add(servings) } label: {
                    Label(added ? "\(servings) 人分で更新" : "\(servings) 人分をカートに追加", systemImage: added ? "checkmark" : "basket")
                        .frame(maxWidth: .infinity, minHeight: 44)
                }.buttonStyle(.borderedProminent)
                Button("カートを見る", action: openCart).frame(minHeight: 44)
                    .opacity(added ? 1 : 0).disabled(!added).accessibilityHidden(!added)
            }.padding(16).background(.bar)
        }
    }
}

private struct MyrecipeeEditor: View {
    var recipe: MyrecipeeRecipe?
    let save: (MyrecipeeRecipe) -> Void
    @Environment(\.dismiss) private var dismiss
    @State private var title = ""
    @State private var tag = "主菜"
    @State private var memo = ""
    @State private var ingredientName = ""
    @State private var amount = 100.0
    @State private var unit = "g"
    @State private var procedure = ""
    @State private var discard = false
    @State private var dirty = false

    var body: some View {
        NavigationStack {
            Form {
                Section("基本情報") {
                    TextField("レシピ名", text: $title)
                    Picker("タグ", selection: $tag) {
                        ForEach(["主食", "主菜", "副菜", "汁物"], id: \.self) { Text($0) }
                    }
                    TextField("メモ", text: $memo, axis: .vertical)
                }
                if recipe == nil {
                    Section("材料（2 人分）") {
                        TextField("材料名", text: $ingredientName)
                        TextField("数量", value: $amount, format: .number).keyboardType(.decimalPad)
                        TextField("単位", text: $unit)
                    }
                    Section("作り方") { TextField("手順", text: $procedure, axis: .vertical) }
                } else {
                    Section { Text("この試作では名前、タグ、メモを編集できます。材料と作り方は既存の内容を保ちます。").font(.caption) }
                }
            }
            .navigationTitle(recipe == nil ? "レシピを追加" : "レシピを編集")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("キャンセル") { if dirty { discard = true } else { dismiss() } } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") {
                        var result = recipe ?? .init(id: UUID().uuidString, title: title, tag: tag, memo: memo, symbol: "fork.knife", ingredients: [.init(name: ingredientName, amount: amount, unit: unit)], steps: [procedure])
                        result.title = title.trimmingCharacters(in: .whitespacesAndNewlines)
                        result.tag = tag; result.memo = memo
                        save(result); dismiss()
                    }.disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || (recipe == nil && (ingredientName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || procedure.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || amount <= 0)))
                }
            }
            .onAppear { if let recipe { title = recipe.title; tag = recipe.tag; memo = recipe.memo }; dirty = false }
            .onChange(of: title) { dirty = true }
            .onChange(of: tag) { dirty = true }
            .onChange(of: memo) { dirty = true }
            .onChange(of: ingredientName) { dirty = true }
            .onChange(of: amount) { dirty = true }
            .onChange(of: procedure) { dirty = true }
            .onChange(of: unit) { dirty = true }
            .interactiveDismissDisabled(dirty)
            .alert("変更を破棄しますか？", isPresented: $discard) {
                Button("編集を続ける", role: .cancel) {}
                Button("破棄する", role: .destructive) { dismiss() }
            }
        }
    }
}
