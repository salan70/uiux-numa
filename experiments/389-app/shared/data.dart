import 'dart:math' as math;

import 'package:flutter/foundation.dart';

part 'data.g.dart';

// .389 のドメインの規則を写す。出典は salan70/389-app 10adac47 の packages/domain。
// 開示の順は年度 × 項目のマスに乱数で振る（infra/.../hitter_converter.dart の _createStatsListForUi）。
// ランクは開示の割合と誤答の数で決める（domain/.../quiz_result.dart の resultRank）。

/// 出題できる選手。rows は 1 行が 1 年度で、先頭が年度、続きが statColumns の順の値。
@immutable
class QuizPlayer {
  const QuizPlayer(this.id, this.name, this.team, this.rows);

  final String id;
  final String name;

  /// 2025 年シーズン終了時の所属。
  final String team;
  final List<List<String>> rows;

  /// 姓だけ。札や見出しで短く呼ぶときに使う。
  String get family => name.split(' ').first;

  /// 通算の値。条件の下限と比べるときに使う。
  int career(String stat) {
    final total = rows.where((r) => r[0] == '通算').firstOrNull;
    return total == null ? 0 : int.tryParse(total[statColumns.indexOf(stat) + 1]) ?? 0;
  }

  /// 2025 年シーズン終了時の所属の短い名。
  String get teamName => teamShort[team] ?? team;
}

/// クイズ設定の条件。製品の SearchCondition を写す（domain/.../search_condition.dart）。
/// 球団は 1 つ以上、出題する成績はちょうど 4 つ。下限の候補とタイマーの間隔の範囲も製品に合わせた。
class QuizCondition {
  QuizCondition({required this.teams, required this.minGames, required this.minHits, required this.minHr, required this.slots, this.timer = false, this.interval = 1.0});

  factory QuizCondition.standard() => QuizCondition(teams: {...teamOrder}, minGames: 300, minHits: 300, minHr: 50, slots: [...defaultStats]);

  Set<String> teams;
  int minGames;
  int minHits;
  int minHr;

  /// 出題する成績の 4 つの枠。左から表の列になる。空きは null。
  List<String?> slots;
  bool timer;

  List<String> get stats => slots.whereType<String>().toList();

  /// タイマーで次の成績を出すまでの秒数。
  double interval;

  static const statCount = 4;
  static const gamesOptions = [0, 100, 300, 500, 1000];
  static const hitsOptions = [0, 100, 300, 500, 1000];
  static const hrOptions = [0, 10, 50, 100, 200];
  static const minInterval = 0.3;
  static const maxInterval = 5.0;

  /// いまの条件。試作の中だけで持つ。
  static final current = QuizCondition.standard();

  bool get valid => teams.isNotEmpty && slots.every((s) => s != null);

  /// 条件に合う選手。
  List<QuizPlayer> get players => [
    for (final p in quizPlayers)
      if (teams.contains(p.teamName) && p.career('試合') >= minGames && p.career('安打') >= minHits && p.career('本塁打') >= minHr) p,
  ];
}

/// 製品の既定の出題項目（domain/.../search_condition.dart の defaultSearchCondition）。
const defaultStats = <String>['球団', '打率', '本塁打', 'OPS'];

enum Rank {
  ss('SS', 0.1, 0),
  s('S', 0.2, 2),
  a('A', 0.5, 4),
  b('B', 0.7, 9),
  c('C', 1, 1 << 30),
  miss('×', 0, 0);

  const Rank(this.label, this.maxRate, this.maxIncorrect);

  final String label;

  /// このランクに残れる開示の割合の上限。
  final double maxRate;

  /// このランクに残れる誤答の数の上限。
  final int maxIncorrect;

  /// 正解したときのランク。製品の resultRank と同じ判定。
  static Rank of({required int unveil, required int total, required int incorrect}) {
    final rate = unveil / total;
    for (final r in const [Rank.ss, Rank.s, Rank.a, Rank.b]) {
      if (incorrect <= r.maxIncorrect && rate <= r.maxRate) return r;
    }
    return Rank.c;
  }

  /// このランクに残れる開示の数の上限。
  int maxUnveil(int total) => (total * maxRate).floor();
}

enum QuizMode { normal, daily }

enum QuizStatus { playing, correct, gaveUp, failed }

enum GuessOutcome { correct, wrong, failed }

/// 1 問ぶんの状態。画面は this を listen して描き直す。
class QuizSession extends ChangeNotifier {
  QuizSession({required this.player, this.stats = defaultStats, this.mode = QuizMode.normal, int? seed}) {
    final random = math.Random(seed ?? player.id.hashCode);
    final cells = [
      for (var r = 0; r < player.rows.length; r++)
        for (var c = 0; c < stats.length; c++) (r, c),
    ]..shuffle(random);
    _order = cells;
  }

  final QuizPlayer player;
  final List<String> stats;
  final QuizMode mode;

  /// 今日の1問で答えられる回数。
  static const dailyLives = 3;

  late final List<(int, int)> _order;
  int _unveil = 0;
  int _incorrect = 0;
  QuizStatus _status = QuizStatus.playing;
  final List<String> _wrongNames = [];

  int get unveil => _unveil;
  int get incorrect => _incorrect;
  int get total => _order.length;
  int get yearCount => player.rows.length;
  QuizStatus get status => _status;
  bool get isOver => _status != QuizStatus.playing;
  List<String> get wrongNames => List.unmodifiable(_wrongNames);
  double get rate => _unveil / total;
  int get livesLeft => dailyLives - _incorrect;

  String year(int row) => player.rows[row][0];

  String value(int row, int col) {
    final index = statColumns.indexOf(stats[col]);
    return player.rows[row][index + 1];
  }

  /// マスの開く順。0 から始まる。
  int orderOf(int row, int col) => _order.indexOf((row, col));

  bool isRevealed(int row, int col) => isOver || opened(row, col);

  /// 遊んでいる間に開いたマスか。終わった後に全部を見せるときも、開いたマスと分けて描くために使う。
  bool opened(int row, int col) => orderOf(row, col) < _unveil;

  /// 直前に開いたマス。
  (int, int)? get lastRevealed => _unveil == 0 ? null : _order[_unveil - 1];

  /// いま正解したときのランク。
  Rank get rankNow => Rank.of(unveil: _unveil, total: total, incorrect: _incorrect);

  /// 正解したときのランク。終わっていなければ rankNow と同じ。
  Rank get finalRank => switch (_status) {
    QuizStatus.correct || QuizStatus.playing => rankNow,
    _ => Rank.miss,
  };

  /// いまのランクに残れるあと何マス開けられるか。開けるとランクが落ちるなら 0。C なら null。
  int? get cellsBeforeDrop {
    final r = rankNow;
    if (r == Rank.c) return null;
    return r.maxUnveil(total) - _unveil;
  }

  (int, int)? revealNext() {
    if (isOver || _unveil >= total) return null;
    _unveil++;
    notifyListeners();
    return _order[_unveil - 1];
  }

  void revealAll() {
    if (isOver) return;
    _unveil = total;
    notifyListeners();
  }

  GuessOutcome guess(String name) {
    if (isOver) return GuessOutcome.failed;
    if (name == player.name) {
      _status = QuizStatus.correct;
      notifyListeners();
      return GuessOutcome.correct;
    }
    _incorrect++;
    _wrongNames.add(name);
    if (mode == QuizMode.daily && livesLeft <= 0) {
      _status = QuizStatus.failed;
      notifyListeners();
      return GuessOutcome.failed;
    }
    notifyListeners();
    return GuessOutcome.wrong;
  }

  void giveUp() {
    if (isOver) return;
    _status = QuizStatus.gaveUp;
    notifyListeners();
  }
}

/// 名前の候補。空白を無視した部分一致。製品の search_hitter_list_use_case と同じく、全選手から探す。
List<String> searchNames(String query, {int limit = 8}) {
  final q = query.replaceAll(RegExp(r'\s'), '');
  if (q.isEmpty) return const [];
  return allHitterNames.where((n) => n.replaceAll(' ', '').contains(q)).take(limit).toList();
}

QuizPlayer playerNamed(String name) => quizPlayers.firstWhere((p) => p.name == name);

/// 球団の短い名と、試作で使う色。色は球団の印象から選んだ識別用で、公式の色ではない。
const teamShort = <String, String>{
  '読売ジャイアンツ': '巨人',
  '阪神タイガース': '阪神',
  '中日ドラゴンズ': '中日',
  '広島東洋カープ': '広島',
  '横浜DeNAベイスターズ': 'DeNA',
  '東京ヤクルトスワローズ': 'ヤクルト',
  'オリックス・バファローズ': 'オリックス',
  '福岡ソフトバンクホークス': 'ソフトバンク',
  '埼玉西武ライオンズ': '西武',
  '東北楽天ゴールデンイーグルス': '楽天',
  '千葉ロッテマリーンズ': 'ロッテ',
  '北海道日本ハムファイターズ': '日本ハム',
};

const teamOrder = <String>[
  '巨人', '阪神', 'DeNA', '広島', 'ヤクルト', '中日', //
  'ソフトバンク', '日本ハム', 'ロッテ', '楽天', 'オリックス', '西武',
];
