import 'dart:math' as math;

import 'data.dart';

// 試作の遊んだ記録。製品の play_stats（calc_play_stats_profile_use_case など）が集計する値を、固定の記録から作る。
// query の user=new で初めての人、daily=done で今日の1問を済ませた状態にする。

class PlayRecord {
  const PlayRecord({required this.day, required this.player, required this.rank, required this.unveilPercent, required this.daily});

  /// 今日から何日前か。
  final int day;
  final QuizPlayer player;
  final Rank rank;
  final int unveilPercent;
  final bool daily;

  bool get correct => rank != Rank.miss;
}

class Profile {
  Profile._(this.records, {required this.dailyDone});

  factory Profile.fromQuery() {
    final q = Uri.base.queryParameters;
    final fresh = q['user'] == 'new';
    return Profile._(fresh ? const [] : _sample(), dailyDone: q['daily'] == 'done');
  }

  final List<PlayRecord> records;
  bool dailyDone;

  /// 今日の1問の番号。製品の初回配信からの日数に見立てる。
  final int dailyNumber = 812;

  int get plays => records.length;
  int get correct => records.where((r) => r.correct).length;

  /// 正解率を打率の形で。0 件なら .000。
  String get average => _rate(plays == 0 ? 0 : correct / plays);

  int count(Rank r) => records.where((e) => e.rank == r).length;

  /// 今週（月曜始まり）に遊んだ曜日。0 が月曜。試作では今日を木曜（3）にする。
  static const today = 3;
  Set<int> get weekDays => {
    for (final r in records)
      if (r.day <= today) today - r.day,
    if (dailyDone) today,
  };

  int get streak => records.isEmpty ? 0 : (dailyDone ? 6 : 5);
  int get bestStreak => records.isEmpty ? 0 : 12;

  /// 正解した選手を 2025 年の所属の球団で数える。
  Map<String, Set<String>> get collection {
    final map = {for (final t in teamOrder) t: <String>{}};
    for (final r in records.where((e) => e.correct)) {
      map[teamShort[r.player.team]]?.add(r.player.name);
    }
    return map;
  }

  /// 球団ごとの出題できる選手の数。
  static Map<String, int> get teamSize {
    final map = {for (final t in teamOrder) t: 0};
    for (final p in quizPlayers) {
      final t = teamShort[p.team];
      if (t != null) map[t] = map[t]! + 1;
    }
    return map;
  }

  /// 次の今日の1問（19 時）までの残り。試作では 16:48 に固定する。
  Duration get untilNext => const Duration(hours: 2, minutes: 12);

  static List<PlayRecord> _sample() {
    final random = math.Random(389);
    const ranks = [Rank.ss, Rank.s, Rank.s, Rank.a, Rank.a, Rank.a, Rank.b, Rank.b, Rank.c, Rank.miss, Rank.miss];
    final players = [...quizPlayers]..shuffle(random);
    return [
      for (var i = 0; i < 38; i++)
        PlayRecord(
          day: i ~/ 2,
          player: players[i % players.length],
          rank: ranks[random.nextInt(ranks.length)],
          unveilPercent: 4 + random.nextInt(60),
          daily: i.isEven,
        ),
    ];
  }
}

String _rate(double v) => v >= 1 ? '1.000' : '.${(v * 1000).round().toString().padLeft(3, '0')}';

/// 0〜1 を打率の形で書く。
String rateText(double v) => _rate(v);
