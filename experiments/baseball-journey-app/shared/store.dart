import 'dart:math';

import 'package:flutter/material.dart';

import 'fixture.dart';
import 'model.dart';

// 3 案が共有する状態と操作。永続化しない。起動のたびに固定データから作り直す。
// 入力中の試合（GameDraft）と試合後のまとめ（GameSummary）は画面の状態で、本体の永続化の項目を増やさない。

/// URL の query から読む起動条件。実行基盤の platforms/flutter/lib/main.dart が URL を渡す。
class LaunchOptions {
  LaunchOptions(Map<String, String> query)
    : fixture = Fixture.parse(query['fixture']),
      route = query['route'],
      saveFailure = query['saveFailure'] == '1',
      launchTop = query['launchTop'] == '1';

  final Fixture fixture;

  /// 起動直後に開く画面（撮影用）。値は variant ごとに README に書く。
  final String? route;

  /// 次の試合の保存を 1 回だけ失敗させる。
  final bool saveFailure;

  /// 「起動したら選手トップを開く」をオンにして起動する。試作は設定を保存しないので、起動の動きはこれで確かめる。
  final bool launchTop;
}

enum SaveState { idle, saving, failed }

class AppStore extends ChangeNotifier {
  AppStore(this.options) : players = makeFixturePlayers(options.fixture) {
    _failNextSave = options.saveFailure;
    final active = players.where((p) => p.isActive).toList()
      ..sort((a, b) => b.lastPlayedOrder.compareTo(a.lastPlayedOrder));
    currentId = active.firstOrNull?.id;
    if (const ['input', 'score', 'afterGame', 'topAfterGame'].contains(options.route)) {
      startGame(const Participation(ParticipationKind.starter, battingOrder: 1, position: Position.shortstop));
      addResult(AtBatResult.double_);
      setRbi(1);
      addResult(AtBatResult.swingOut);
      addResult(AtBatResult.single);
      setSteals(1);
      setScored(true);
    }
  }

  final LaunchOptions options;
  final List<Player> players;
  String? currentId;
  final List<String> customTitles = [];
  bool _failNextSave = false;

  // 設定（settings.md）。文字の大きさは端末の設定に従い、アプリでは持たない。
  ThemeMode themeMode = ThemeMode.system;
  bool haptics = true;
  bool sound = true;

  /// 起動したら最後に遊んだ現役の選手の選手トップを開く（D-19、U-11）。初期値はオフ。
  late bool openTopOnLaunch = options.launchTop;

  /// 最後に書き出した日時（D-19、U-10）。
  DateTime? lastExportedAt;

  /// 名鑑全体（全選手と足したタイトル）を書き出す。試作はファイルを作らず、日時だけを残す。
  void exportAll() {
    lastExportedAt = DateTime.now();
    notifyListeners();
  }

  /// 書き出したファイルで今のデータを置き換える。試作は見本のデータで置き換える。
  void importAll() {
    players
      ..clear()
      ..addAll(makeFixturePlayers(Fixture.midseason));
    customTitles.clear();
    currentId = activePlayers.firstOrNull?.id;
    draft = null;
    lastSummary = null;
    notifyListeners();
  }

  Player? get current => players.where((p) => p.id == currentId).firstOrNull;
  List<Player> get activePlayers =>
      players.where((p) => p.isActive).toList()..sort((a, b) => b.lastPlayedOrder.compareTo(a.lastPlayedOrder));

  /// 現役（プレイできる選手）の上限。save_select.md の「セーブデータは最大 10 個」を読み替えた。
  static const maxActivePlayers = 10;
  bool get canCreatePlayer => activePlayers.length < maxActivePlayers;

  void changed() => notifyListeners();

  void select(Player player) {
    if (!player.isActive) return;
    currentId = player.id;
    player.lastPlayedOrder = players.fold(0, (m, p) => p.lastPlayedOrder > m ? p.lastPlayedOrder : m) + 1;
    draft = null;
    lastSummary = null;
    notifyListeners();
  }

  // ---- 試合の入力（function_design/game_result_input.md） ----

  GameDraft? draft;
  SaveState saveState = SaveState.idle;
  GameSummary? lastSummary;

  /// 記録済みの試合を入力画面で開き直す。新しい試合を入力している間は開かず、false を返す。
  /// season を渡すと、終えた季の試合を直す（D-17）。
  bool editGame(int index, {Season? season}) {
    final d = draft;
    if (d != null && d.editIndex == null) return false;
    final s = season ?? current!.current;
    final g = s.games[index];
    draft = GameDraft(g.participation, editIndex: index, editSeason: s, initialScores: (g.myScore ?? 0, g.opponentScore ?? 0))
      ..atBats.addAll(g.atBats)
      ..runner = g.runner
      ..selected = g.atBats.isEmpty ? null : g.atBats.length - 1;
    saveState = SaveState.idle;
    lastSummary = null;
    notifyListeners();
    return true;
  }

  /// 試合を消し、後ろの試合の番号を詰める。試合が無くなった前の所属期間は消す（D-23）。
  void deleteGame(int index, {Season? season}) {
    final target = season ?? current!.current;
    final games = target.games;
    games.removeAt(index);
    for (var i = index; i < games.length; i++) {
      games[i] = games[i].copyWith(number: i + 1);
    }
    target.stints.removeWhere((s) => s != target.stint && !games.any((g) => g.stint == s.id));
    lastSummary = null;
    notifyListeners();
  }

  /// 欠場の試合のチームの勝敗を直す。
  void setSkippedOutcome(int index, GameOutcome? outcome, {Season? season}) {
    final games = (season ?? current!.current).games;
    games[index] = games[index].copyWith(teamOutcome: () => outcome);
    notifyListeners();
  }

  void startGame(Participation participation) {
    draft = GameDraft(participation);
    saveState = SaveState.idle;
    lastSummary = null;
    notifyListeners();
  }

  /// 入力の途中で出場を選び直す（D-17、D-5）。打席は残し、代走から他の出場に変えたら代走の走塁を捨てる。
  void changeParticipation(Participation p) {
    final d = draft!;
    d.participation = p;
    if (p.kind == ParticipationKind.pinchRunner) {
      d.runner ??= const RunnerLine();
    } else {
      d.runner = null;
    }
    d.undoStack.clear();
    d.redoStack.clear();
    notifyListeners();
  }

  void discardGame() {
    draft = null;
    saveState = SaveState.idle;
    notifyListeners();
  }

  void addResult(AtBatResult result) {
    final d = draft!;
    _record();
    // 結果で必ず決まる値だけを初期値にする（R-1-b、D-32）。
    d.atBats.add(AtBat(result, rbi: result.minRbi, scored: result.minRuns > 0));
    d.selected = d.atBats.length - 1;
    notifyListeners();
  }

  void replaceResult(int index, AtBatResult result) {
    final d = draft!;
    _record();
    d.atBats[index] = d.atBats[index].withResult(result);
    notifyListeners();
  }

  void selectAtBat(int? index) {
    draft!.selected = index;
    notifyListeners();
  }

  void removeAtBat(int index) {
    final d = draft!;
    _record();
    d.atBats.removeAt(index);
    d.selected = d.atBats.isEmpty ? null : d.atBats.length - 1;
    notifyListeners();
  }

  /// 直前の操作（打席を足す、結果を変える、打点・走塁を変える、打席を消す）を 1 つ戻す（D-19、U-5）。
  void undo() {
    final d = draft!;
    if (d.undoStack.isEmpty) return;
    d.redoStack.add(d.snapshot());
    d.restore(d.undoStack.removeLast());
    notifyListeners();
  }

  /// 取り消した操作を 1 つ戻す。新しい操作をしたら、やり直せる操作は消える。
  void redo() {
    final d = draft!;
    if (d.redoStack.isEmpty) return;
    d.undoStack.add(d.snapshot());
    d.restore(d.redoStack.removeLast());
    notifyListeners();
  }

  void _record() {
    final d = draft!;
    d.undoStack.add(d.snapshot());
    d.redoStack.clear();
  }

  void setRbi(int value) => _editSelected((a) => a.copyWith(rbi: value.clamp(a.result.minRbi, a.result.maxRbi)));
  void setSteals(int value) => _editSelected((a) => a.copyWith(steals: value.clamp(0, a.maxSteals)));
  void setCaughtStealing(bool value) => _editSelected((a) => a.copyWith(caughtStealing: value));
  void setScored(bool value) => _editSelected((a) => a.copyWith(scored: a.result.minRuns > 0 || (value && a.maxRuns > 0)));
  void setStayed(bool value) => _editSelected((a) => a.result.canStay ? a.withStayed(value) : a);

  void setRunner(RunnerLine line) {
    _record();
    draft!.runner = line;
    notifyListeners();
  }

  void _editSelected(AtBat Function(AtBat) edit) {
    final d = draft!;
    final i = d.selected;
    if (i == null) return;
    final next = edit(d.atBats[i]);
    _record();
    d.atBats[i] = next;
    notifyListeners();
  }

  /// 試合を保存する。自チームの得点は打点の合計以上（AC-009）。
  Future<bool> saveGame(int myScore, int opponentScore) async {
    final player = current!;
    final d = draft!;
    saveState = SaveState.saving;
    notifyListeners();
    await Future<void>.delayed(const Duration(milliseconds: 450));
    if (_failNextSave) {
      _failNextSave = false;
      saveState = SaveState.failed;
      notifyListeners();
      return false;
    }
    final season = d.editSeason ?? player.current;
    if (d.editIndex case final i?) {
      final was = season.games[i];
      season.games[i] = GameRecord(
        number: was.number,
        participation: d.participation,
        atBats: List.of(d.atBats),
        runner: d.runner,
        myScore: myScore,
        opponentScore: opponentScore,
        teamRank: was.teamRank,
        stint: was.stint,
        memo: was.memo,
      );
      draft = null;
      saveState = SaveState.idle;
      notifyListeners();
      return true;
    }
    final seasonBefore = season.line;
    final careerBefore = player.career;
    season.games.add(
      GameRecord(
        number: season.playedCount + 1,
        participation: d.participation,
        atBats: List.of(d.atBats),
        runner: d.runner,
        myScore: myScore,
        opponentScore: opponentScore,
        teamRank: season.teamRank,
        stint: season.stint.id,
      ),
    );
    lastSummary = GameSummary(
      game: season.games.last,
      seasonBefore: seasonBefore,
      seasonAfter: season.line,
      careerBefore: careerBefore,
      careerAfter: player.career,
    );
    draft = null;
    saveState = SaveState.idle;
    notifyListeners();
    return true;
  }

  void dismissSummary() {
    lastSummary = null;
    notifyListeners();
  }

  void setTeamRank(int value) {
    final summary = lastSummary;
    if (summary == null) return;
    final season = current!.current;
    final game = summary.game.withTeamRank(value.clamp(1, season.team.teamCount));
    season.games[season.games.length - 1] = game;
    lastSummary = GameSummary(
      game: game,
      seasonBefore: summary.seasonBefore,
      seasonAfter: summary.seasonAfter,
      careerBefore: summary.careerBefore,
      careerAfter: summary.careerAfter,
    );
    notifyListeners();
  }

  /// 試合後のメモ（D-19、U-7）。新しく保存した試合に付ける。空なら外す。
  void setMemo(String text) {
    final summary = lastSummary;
    if (summary == null) return;
    final season = current!.current;
    final trimmed = text.trim();
    final game = summary.game.copyWith(memo: () => trimmed.isEmpty ? null : trimmed);
    season.games[season.games.length - 1] = game;
    lastSummary = GameSummary(
      game: game,
      seasonBefore: summary.seasonBefore,
      seasonAfter: summary.seasonAfter,
      careerBefore: summary.careerBefore,
      careerAfter: summary.careerAfter,
    );
    notifyListeners();
  }

  /// 出場せずに日程を進める（skip_games_dialog.md）。
  /// チームの勝敗は任意で数だけ受け、勝ち、負け、引き分けの順に割り当てる。連続した欠場の中の勝敗の順は持たない。
  /// 順位は進めた最後の試合の後の順位として記録する。
  void skipGames(int count, {int wins = 0, int losses = 0, int draws = 0, int? rank}) {
    final season = current!.current;
    final outcomes = [
      for (var i = 0; i < wins; i++) GameOutcome.win,
      for (var i = 0; i < losses; i++) GameOutcome.loss,
      for (var i = 0; i < draws; i++) GameOutcome.draw,
    ];
    for (var i = 0; i < count && !season.isComplete; i++) {
      final last = i == count - 1;
      season.games.add(
        GameRecord(
          number: season.playedCount + 1,
          participation: const Participation(ParticipationKind.none),
          teamRank: last ? (rank ?? season.teamRank) : season.teamRank,
          teamOutcome: i < outcomes.length ? outcomes[i] : null,
          stint: season.stint.id,
        ),
      );
    }
    lastSummary = null;
    notifyListeners();
  }

  // ---- シーズン途中の移籍（screen_design/mid_season_transfer.md） ----

  /// 季の途中で移籍できるか。今季に試合があり、全試合を終えておらず、新しい試合の入力中でなく、移籍の後に試合があるとき。
  bool get canTransfer {
    final player = current;
    if (player == null || !player.isActive) return false;
    final season = player.current;
    return season.games.isNotEmpty && !season.isComplete && draft == null && !canUndoTransfer;
  }

  /// 移籍した後にまだ試合が無い。移籍先を直すか、移籍を取り消せる。
  bool get canUndoTransfer {
    final player = current;
    if (player == null || !player.isActive || draft != null) return false;
    final season = player.current;
    return season.hasTransfer && season.stintGames.isEmpty;
  }

  /// 次の試合から移籍先の所属にする。移籍先が今の所属期間と同じ移籍を直すときは、その所属期間を書き換える。
  void transfer({required Team team, required String uniformNumber, required int startRank}) {
    final season = current!.current;
    if (canUndoTransfer) {
      season.stint
        ..team = team
        ..uniformNumber = uniformNumber
        ..startRank = startRank;
    } else {
      season.stints.add(
        Stint(id: season.stint.id + 1, team: team, uniformNumber: uniformNumber, startRank: startRank),
      );
    }
    lastSummary = null;
    notifyListeners();
  }

  void undoTransfer() {
    if (!canUndoTransfer) return;
    current!.current.stints.removeLast();
    notifyListeners();
  }

  /// どの選手かが一度でも使った球団。作成、移籍、季の終わりで候補の札に出す（D-35）。
  /// 選ぶと値を写すだけで、写した後は選手ごとに持つ。新しく使った季の値を優先する。
  List<TeamOption> get teamOptions {
    final out = <String, TeamOption>{};
    for (final pl in players) {
      for (final s in pl.seasons) {
        for (final st in s.stints) {
          final was = out[st.team.name];
          if (was == null || was.year <= s.year) out[st.team.name] = (team: st.team, games: s.totalGames, year: s.year);
        }
      }
    }
    return out.values.toList()..sort((a, b) => b.year.compareTo(a.year));
  }

  /// どの選手かが一度でも使ったリーグ。リーグだけを選ぶと、リーグ名、国名、球団数、年間試合数を写す（D-35）。
  List<LeagueOption> get leagueOptions {
    final out = <String, LeagueOption>{};
    for (final t in teamOptions.reversed) {
      out[t.team.league] = (league: t.team.league, country: t.team.country, teamCount: t.team.teamCount, games: t.games);
    }
    return out.values.toList().reversed.toList();
  }

  // ---- シーズン終了と引退（function_design/season_end_process.md） ----

  void addCustomTitle(String name) {
    if (!customTitles.contains(name) && !defaultTitles.contains(name)) customTitles.add(name);
    notifyListeners();
  }

  void endSeason(SeasonEndInput input) {
    final player = current!;
    final season = player.current;
    season.ranks
      ..clear()
      ..addAll(input.ranks);
    season.titles
      ..clear()
      ..addAll(input.titles);
    player.positions = input.positions;
    player.bats = input.bats;
    player.seasons.add(
      Season(
        year: season.year + 1,
        team: input.team ?? season.team,
        uniformNumber: input.uniformNumber,
        salary: input.salary,
        abilities: input.abilities,
        transferred: input.team != null,
        totalGames: input.totalGames,
      ),
    );
    notifyListeners();
  }

  void retire(SeasonEndInput input) {
    final player = current!;
    final season = player.current;
    season.ranks
      ..clear()
      ..addAll(input.ranks);
    season.titles
      ..clear()
      ..addAll(input.titles);
    player.careerRanks
      ..clear()
      ..addAll(input.careerRanks);
    player.status = PlayerStatus.retired;
    currentId = activePlayers.firstOrNull?.id;
    notifyListeners();
  }

  // ---- 選手の作成（screen_design/player_creation.md） ----

  Player createPlayer(PlayerDraft input) {
    final player = Player(
      id: 'p${players.length + 1}',
      name: input.name,
      background: input.background,
      throws: input.throws,
      bats: input.bats,
      positions: input.positions,
      height: input.height,
      weight: input.weight,
      birthYear: input.joiningYear - input.age,
      origin: PlayerOrigin(
        route: input.route,
        joiningYear: input.joiningYear,
        draftRound: input.route == JoiningRoute.draft ? input.draftRound : null,
        memo: input.memo.isEmpty ? null : input.memo,
      ),
      seasons: [
        Season(
          year: input.joiningYear,
          team: Team(
            name: input.teamName,
            abbreviation: input.teamName.characters.take(2).toString(),
            league: input.league,
            country: input.country,
            teamCount: input.teamCount,
          ),
          uniformNumber: input.uniformNumber,
          salary: input.salary,
          abilities: List.of(input.abilities),
          totalGames: input.totalGames,
        ),
      ],
    );
    players.add(player);
    select(player);
    return player;
  }

  /// 選手を消す（D-22）。足したタイトルの定義は残す。遊んでいた選手なら、次に遊んだ現役の選手へ移す。
  void deletePlayer(Player player) {
    players.remove(player);
    if (currentId == player.id) {
      currentId = activePlayers.firstOrNull?.id;
      draft = null;
      lastSummary = null;
    }
    notifyListeners();
  }

  /// データの初期化（settings.md の二段階の確認の後）。
  void resetAll() {
    players.clear();
    customTitles.clear();
    currentId = null;
    draft = null;
    lastSummary = null;
    notifyListeners();
  }
}

typedef TeamOption = ({Team team, int games, int year});
typedef LeagueOption = ({String league, String country, int teamCount, int games});

typedef DraftSnapshot = ({List<AtBat> atBats, RunnerLine? runner, int? selected});

class GameDraft {
  GameDraft(this.participation, {this.editIndex, this.editSeason, this.initialScores})
    : runner = participation.kind == ParticipationKind.pinchRunner ? const RunnerLine() : null;

  Participation participation;

  /// 記録済みの試合を直しているときの位置。新しい試合なら null。
  final int? editIndex;

  /// 直している試合の季。今季なら null でもよい。
  final Season? editSeason;

  /// 直す試合のスコア（自チーム、相手）。スコアの入力の初期値にする。
  final (int, int)? initialScores;
  final List<AtBat> atBats = [];

  /// 代走の走塁。代走のときだけ持つ（AC-003）。
  RunnerLine? runner;

  /// 打点と走塁を直す対象の打席。打席を足すと、その打席を選ぶ。
  int? selected;

  bool get isEmpty =>
      atBats.isEmpty && (runner == null || (runner!.steals == 0 && !runner!.caughtStealing && !runner!.scored));
  /// 打席が無くても、代打・代走・守備固めなら保存できる（D-31）。スタメンは打席が要る。
  bool get canSave => atBats.isNotEmpty || participation.kind != ParticipationKind.starter;

  /// 取り消しとやり直しの履歴。入力の途中だけ持ち、保存しない。
  final undoStack = <DraftSnapshot>[];
  final redoStack = <DraftSnapshot>[];
  bool get canUndo => undoStack.isNotEmpty;
  bool get canRedo => redoStack.isNotEmpty;

  DraftSnapshot snapshot() => (atBats: List.of(atBats), runner: runner, selected: selected);
  void restore(DraftSnapshot s) {
    atBats
      ..clear()
      ..addAll(s.atBats);
    runner = s.runner;
    selected = s.selected;
  }
  int get rbi => atBats.fold(0, (s, a) => s + a.rbi);

  /// 本人の得点。打席と代走の走塁から数える。
  int get runs => atBats.where((a) => a.scored).length + ((runner?.scored ?? false) ? 1 : 0);

  /// 自チームの得点の下限。打点の合計と本人の得点の多い方（R-2-2、R-2-3）。
  int get minScore => max(rbi, runs);
  int get hits => atBats.where((a) => a.result.isHit).length;
  int get atBatCount => atBats.where((a) => a.result.atBat).length;

  /// 「4 打数 2 安打 1 打点」の形の 1 行。
  String get line {
    final parts = <String>[];
    if (atBats.isNotEmpty) parts.add('$atBatCount 打数 $hits 安打');
    if (rbi > 0) parts.add('$rbi 打点');
    final steals = atBats.fold(0, (s, a) => s + a.steals) + (runner?.steals ?? 0);
    if (steals > 0) parts.add('$steals 盗塁');
    return parts.isEmpty ? '記録なし' : parts.join(' ');
  }
}

/// 試合後のまとめ。直前との差と節目を導出するだけで、保存しない。
class GameSummary {
  GameSummary({
    required this.game,
    required this.seasonBefore,
    required this.seasonAfter,
    required this.careerBefore,
    required this.careerAfter,
  });

  final GameRecord game;
  final BattingLine seasonBefore;
  final BattingLine seasonAfter;
  final BattingLine careerBefore;
  final BattingLine careerAfter;

  /// 通算の節目。base_concepts.md の「記録達成モーメント」を、入力の結果から導く。
  List<String> get milestones => milestonesBetween(careerBefore, careerAfter);
}

class SeasonEndInput {
  SeasonEndInput({
    required this.ranks,
    required this.titles,
    required this.uniformNumber,
    required this.salary,
    required this.abilities,
    required this.positions,
    required this.bats,
    this.team,
    this.careerRanks = const {},
    this.totalGames = 143,
  });

  final Map<StatItem, int> ranks;
  final List<String> titles;
  final String uniformNumber;
  final int salary;
  final List<Ability> abilities;
  final List<Position> positions;
  final Hand bats;

  /// 移籍先。残留なら null。
  final Team? team;
  final Map<StatItem, int> careerRanks;

  /// 来季の年間試合数。
  final int totalGames;
}

class PlayerDraft {
  String name = '';
  CareerBackground background = CareerBackground.highSchool;
  int age = CareerBackground.highSchool.defaultAge;
  Hand throws = Hand.right;
  Hand bats = Hand.right;
  List<Position> positions = [];
  int height = 180;
  int weight = 85;
  List<Ability> abilities = [for (final n in defaultAbilityNames) Ability(n, 50)];
  String country = '日本';
  /// 日本のプロ野球は 1 リーグ 6 球団なので、それを初期値にする。
  int teamCount = 6;

  /// 年間試合数（D-14）。リーグの値で、季の始まりに季へ写す。
  int totalGames = 143;
  String league = '';
  String teamName = '';
  JoiningRoute route = JoiningRoute.draft;
  int draftRound = 1;
  int joiningYear = 2029;
  String uniformNumber = '10';
  int salary = 1500;
  String memo = '';
}

/// 画面から AppStore を引く。
class StoreScope extends InheritedNotifier<AppStore> {
  const StoreScope({super.key, required AppStore store, required super.child}) : super(notifier: store);

  static AppStore of(BuildContext context) => context.dependOnInheritedWidgetOfExactType<StoreScope>()!.notifier!;
  static AppStore read(BuildContext context) => context.getInheritedWidgetOfExactType<StoreScope>()!.notifier!;
}
