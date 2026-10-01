import 'dart:math';

import 'model.dart';

// 固定データ。選手、球団、リーグはこの Experiment のために作った架空のもので、実在の人物や球団を指さない。
// 試合の記録は選手ごとに固定の種から作るので、起動のたびに同じになる。

enum Fixture {
  /// 選手がいない。初回の起動。
  empty,

  /// 4 年目の途中（57 / 143 試合）。既定。
  midseason,

  /// 作ったばかりの新人（0 / 143 試合）。
  rookie,

  /// 全試合を終え、シーズンの終了だけが残る。
  seasonEnd,

  /// 4 年目の途中で、第 31 戦から季の途中の移籍先にいる（D-23）。
  transferred;

  static Fixture parse(String? value) => Fixture.values.where((f) => f.name == value).firstOrNull ?? Fixture.midseason;
}

const _hokuto = Team(name: '北斗ライナーズ', abbreviation: '北斗', league: '東リーグ', country: '日本', teamCount: 6);
const _wangan = Team(name: '湾岸ドルフィンズ', abbreviation: '湾岸', league: '西リーグ', country: '日本', teamCount: 6);
const _aoba = Team(name: '青葉スターズ', abbreviation: '青葉', league: '東リーグ', country: '日本', teamCount: 6);
const _sunset = Team(name: 'サンセット・ウェーブス', abbreviation: 'SSW', league: 'パシフィック・カンファレンス', country: 'アメリカ', teamCount: 15);

const fixtureTeams = [_hokuto, _wangan, _aoba, _sunset];

class _Talent {
  const _Talent({
    required this.contact,
    required this.power,
    required this.eye,
    required this.speed,
    required this.order,
  });
  final int contact;
  final int power;
  final int eye;
  final int speed;
  final int order;
}

class _Spec {
  const _Spec({
    required this.id,
    required this.name,
    required this.background,
    required this.throws,
    required this.bats,
    required this.positions,
    required this.height,
    required this.weight,
    required this.birthYear,
    required this.origin,
    required this.talent,
    required this.firstYear,
    required this.seasonCount,
    required this.teams,
    required this.lastSeasonGames,
    this.retired = false,
    this.titles = const {},
  });

  final String id;
  final String name;
  final CareerBackground background;
  final Hand throws;
  final Hand bats;
  final List<Position> positions;
  final int height;
  final int weight;
  final int birthYear;
  final PlayerOrigin origin;
  final _Talent talent;
  final int firstYear;
  final int seasonCount;

  /// 季の番号（0 始まり）から球団を返す。
  final Team Function(int season) teams;

  /// 最後の季に終えた試合数。143 なら全試合を終えている。
  final int lastSeasonGames;
  final bool retired;
  final Map<int, List<String>> titles;
}

final _specs = [
  _Spec(
    id: 'sora',
    name: '大空 翔',
    background: CareerBackground.university,
    throws: Hand.right,
    bats: Hand.left,
    positions: [Position.shortstop, Position.second],
    height: 178,
    weight: 76,
    birthYear: 2004,
    origin: const PlayerOrigin(route: JoiningRoute.draft, joiningYear: 2026, draftRound: 1),
    talent: const _Talent(contact: 72, power: 48, eye: 64, speed: 80, order: 1),
    firstYear: 2026,
    seasonCount: 4,
    teams: (_) => _hokuto,
    lastSeasonGames: 57,
    titles: {
      0: ['新人王'],
      2: ['盗塁王', 'ベストナイン'],
    },
  ),
  _Spec(
    id: 'iwaki',
    name: '岩城 剛',
    background: CareerBackground.highSchool,
    throws: Hand.right,
    bats: Hand.right,
    positions: [Position.catcher],
    height: 183,
    weight: 92,
    birthYear: 2011,
    origin: const PlayerOrigin(route: JoiningRoute.draft, joiningYear: 2029, draftRound: 3),
    talent: const _Talent(contact: 44, power: 62, eye: 40, speed: 38, order: 8),
    firstYear: 2029,
    seasonCount: 1,
    teams: (_) => _aoba,
    lastSeasonGames: 0,
  ),
  _Spec(
    id: 'kinjo',
    name: 'ミゲル 金城',
    background: CareerBackground.independent,
    throws: Hand.right,
    bats: Hand.right,
    positions: [Position.first, Position.right],
    height: 188,
    weight: 101,
    birthYear: 2000,
    origin: const PlayerOrigin(route: JoiningRoute.tryout, joiningYear: 2024, memo: '独立リーグで本塁打王を取り、入団テストで合格した。'),
    talent: const _Talent(contact: 60, power: 86, eye: 58, speed: 40, order: 4),
    firstYear: 2024,
    seasonCount: 6,
    teams: (i) => i < 3 ? _wangan : _hokuto,
    lastSeasonGames: 143,
    titles: {
      3: ['本塁打王'],
      4: ['本塁打王', '打点王', 'MVP'],
    },
  ),
  _Spec(
    id: 'kazama',
    name: '風間 迅',
    background: CareerBackground.highSchool,
    throws: Hand.left,
    bats: Hand.left,
    positions: [Position.center, Position.left],
    height: 174,
    weight: 70,
    birthYear: 1995,
    origin: const PlayerOrigin(route: JoiningRoute.draft, joiningYear: 2013, draftRound: 2),
    talent: const _Talent(contact: 78, power: 40, eye: 70, speed: 92, order: 1),
    firstYear: 2013,
    seasonCount: 14,
    teams: (i) => i < 8 ? _aoba : (i < 11 ? _sunset : _aoba),
    lastSeasonGames: 143,
    retired: true,
    titles: {
      2: ['盗塁王'],
      3: ['盗塁王', 'ゴールデングラブ'],
      4: ['首位打者', '盗塁王', 'ゴールデングラブ'],
      5: ['最多安打', '盗塁王'],
      6: ['盗塁王', 'ベストナイン'],
    },
  ),
  _Spec(
    id: 'hayase',
    name: '早瀬 桃太郎',
    background: CareerBackground.society,
    throws: Hand.right,
    bats: Hand.both,
    positions: [Position.second, Position.third],
    height: 170,
    weight: 68,
    birthYear: 1993,
    origin: const PlayerOrigin(route: JoiningRoute.draft, joiningYear: 2017, draftRound: 6),
    talent: const _Talent(contact: 66, power: 32, eye: 60, speed: 66, order: 2),
    firstYear: 2017,
    seasonCount: 8,
    teams: (_) => _wangan,
    lastSeasonGames: 143,
    retired: true,
  ),
  _Spec(
    id: 'tachibana',
    name: '橘 レオ',
    background: CareerBackground.university,
    throws: Hand.right,
    bats: Hand.right,
    positions: [Position.third],
    height: 185,
    weight: 90,
    birthYear: 1994,
    origin: const PlayerOrigin(route: JoiningRoute.draft, joiningYear: 2016, draftRound: 1),
    talent: const _Talent(contact: 64, power: 74, eye: 52, speed: 50, order: 5),
    firstYear: 2016,
    seasonCount: 10,
    teams: (i) => i < 6 ? _hokuto : _wangan,
    lastSeasonGames: 143,
    retired: true,
    titles: {
      5: ['打点王', 'ベストナイン'],
    },
  ),
];

List<Player> makeFixturePlayers(Fixture fixture) {
  if (fixture == Fixture.empty) return [];
  final players = [for (final spec in _specs) _build(spec)];
  final currentId = switch (fixture) {
    Fixture.rookie => 'iwaki',
    Fixture.seasonEnd => 'kinjo',
    _ => 'sora',
  };
  if (fixture == Fixture.transferred) {
    final season = players.firstWhere((p) => p.id == currentId).current;
    season.stints.add(Stint(id: 1, team: _aoba, uniformNumber: '5', startRank: 4));
    for (var i = 30; i < season.games.length; i++) {
      season.games[i] = season.games[i].copyWith(stint: 1);
    }
  }
  // 「つづきから」の並び。現在の選手を最後に遊んだことにする。
  var order = 1;
  for (final p in players) {
    p.lastPlayedOrder = p.id == currentId ? 100 : order++;
  }
  return players;
}

/// 見本の選手の顔。id から決めた顔を基にし、年を重ねると口ひげを、6 年目からは髪を白くする（季ごとに直せる見本）。
Face _face(_Spec spec, int season) {
  final random = Random(spec.id.codeUnits.fold<int>(11, (a, c) => a * 37 + c));
  final base = Face.random(random.nextInt).copyWith(beard: Beard.none, glasses: Glasses.none);
  if (season >= 8) return base.copyWith(beard: Beard.full, hairColor: 4);
  if (season >= 3) return base.copyWith(beard: Beard.mustache);
  return base;
}

Player _build(_Spec spec) {
  final random = Random(spec.id.codeUnits.fold<int>(7, (a, c) => a * 31 + c));
  final seasons = <Season>[];
  for (var i = 0; i < spec.seasonCount; i++) {
    final year = spec.firstYear + i;
    final age = year - spec.birthYear;
    final growth = _growth(age);
    final t = spec.talent;
    final abilities = [
      Ability('ミート', _ability(t.contact + growth)),
      Ability('パワー', _ability(t.power + growth)),
      Ability('選球眼', _ability(t.eye + growth ~/ 2)),
      Ability('メンタル', _ability(50 + i * 3)),
      Ability('スピード', _ability(t.speed + (age > 31 ? -(age - 31) * 3 : 0))),
      Ability('肩', _ability(55 + growth)),
      Ability('守備', _ability(52 + growth + i)),
    ];
    final last = i == spec.seasonCount - 1;
    final count = last ? spec.lastSeasonGames : 143;
    final team = spec.teams(i);
    // 順位はその時点の勝率から決める。勝率 .500 なら中位、勝ち越すほど上になり、成績と順位が食い違わない。
    var wins = 0;
    var losses = 0;
    final games = [
      for (var n = 1; n <= count; n++)
        () {
          final game = _game(random, n, abilities, spec);
          if (game.outcome == GameOutcome.win) wins++;
          if (game.outcome == GameOutcome.loss) losses++;
          final pct = wins + losses == 0 ? 1.0 : wins / (wins + losses);
          return game.withTeamRank(1 + ((1 - pct) * (team.teamCount - 1)).round());
        }(),
    ];
    final season = Season(
      year: year,
      team: team,
      uniformNumber:
          '${i < 2
              ? 36 + spec.talent.order
              : spec.talent.order == 1
              ? 1
              : 7 + spec.talent.order}',
      salary: _salary(i, spec.talent),
      abilities: abilities,
      games: games,
      titles: [...?spec.titles[i]],
      transferred: i > 0 && spec.teams(i - 1) != team,
      face: _face(spec, i),
    );
    if (season.isComplete) {
      for (final title in season.titles) {
        final item = StatItem.values.where((s) => s.title == title).firstOrNull;
        if (item != null) season.ranks[item] = 1;
      }
    }
    seasons.add(season);
  }
  return Player(
    id: spec.id,
    name: spec.name,
    background: spec.background,
    throws: spec.throws,
    bats: spec.bats,
    positions: spec.positions,
    height: spec.height,
    weight: spec.weight,
    birthYear: spec.birthYear,
    origin: spec.origin,
    seasons: seasons,
    status: spec.retired ? PlayerStatus.retired : PlayerStatus.active,
  );
}

int _growth(int age) => age <= 28 ? (age - 20) * 3 : 24 - (age - 28) * 4;
int _ability(int v) => v.clamp(1, 99);
int _salary(int season, _Talent t) => (440 + season * season * (t.power + t.contact) * 3).clamp(440, 60000);

GameRecord _game(Random r, int number, List<Ability> abilities, _Spec spec) {
  int value(String name) => abilities.firstWhere((a) => a.name == name).value;
  final roll = r.nextDouble();
  final kind = roll < 0.04
      ? ParticipationKind.none
      : roll < 0.07
      ? ParticipationKind.pinchHitter
      : ParticipationKind.starter;
  if (kind == ParticipationKind.none) {
    return GameRecord(number: number, participation: const Participation(ParticipationKind.none));
  }
  final participation = kind == ParticipationKind.starter
      ? Participation(kind, battingOrder: spec.talent.order, position: spec.positions.first)
      : Participation(kind, battingOrder: spec.talent.order);
  final plateAppearances = kind == ParticipationKind.starter ? 3 + r.nextInt(3) : 1;
  final atBats = [
    for (var i = 0; i < plateAppearances; i++) _atBat(r, value('ミート'), value('パワー'), value('選球眼'), value('スピード')),
  ];
  final rbi = atBats.fold(0, (s, a) => s + a.rbi);
  final my = max(rbi, r.nextInt(9));
  final homeRuns = atBats.where((a) => a.result == AtBatResult.homeRun).length;
  final hits = atBats.where((a) => a.result.isHit).length;
  return GameRecord(
    number: number,
    participation: participation,
    atBats: atBats,
    myScore: my,
    opponentScore: r.nextInt(9),
    memo: homeRuns >= 2
        ? '1 試合 2 本。どちらも初球を振った'
        : homeRuns == 1 && rbi >= 3
        ? '逆転の $rbi 点。スタンドが揺れた'
        : hits >= 4
        ? '猛打賞のうえにもう 1 本'
        : null,
  );
}

AtBat _atBat(Random r, int contact, int power, int eye, int speed) {
  final x = r.nextDouble();
  final walk = 0.05 + eye * 0.0006;
  final hbp = walk + 0.008;
  final strikeout = hbp + 0.25 - contact * 0.0012;
  final hit = strikeout + 0.16 + contact * 0.0011;
  AtBatResult result;
  if (x < walk) {
    result = r.nextDouble() < power * 0.0008 ? AtBatResult.intentionalWalk : AtBatResult.walk;
  } else if (x < hbp) {
    result = AtBatResult.hitByPitch;
  } else if (x < strikeout) {
    result = r.nextDouble() < 0.7 ? AtBatResult.swingOut : AtBatResult.missedStrikeout;
  } else if (x < hit) {
    final y = r.nextDouble();
    final hr = power * 0.0024;
    final triple = hr + 0.01 + speed * 0.0003;
    final double = triple + 0.19;
    result = y < hr
        ? AtBatResult.homeRun
        : y < triple
        ? AtBatResult.triple
        : y < double
        ? AtBatResult.double_
        : AtBatResult.single;
  } else {
    final y = r.nextDouble();
    result = y < 0.03
        ? AtBatResult.sacrificeFly
        : y < 0.05
        ? AtBatResult.error
        : y < 0.07
        ? AtBatResult.fielderChoice
        : y < 0.11
        ? AtBatResult.doublePlay
        : y < 0.55
        ? AtBatResult.groundOut
        : y < 0.87
        ? AtBatResult.flyOut
        : AtBatResult.lineOut;
  }
  // アウトの打点は、走者を返す内野ゴロや外野フライのような珍しい場面だけにする。
  final rbi = result.maxRbi == 0
      ? 0
      : !result.isOnBase && result.minRbi == 0
      ? (r.nextDouble() < 0.06 ? 1 : 0)
      : (result.minRbi + (r.nextDouble() < 0.35 ? r.nextInt(result.maxRbi - result.minRbi + 1) : 0)).clamp(
          result.minRbi,
          result.maxRbi,
        );
  // ゴロ、犠飛、犠打で打者が塁に残るのは珍しいので、走塁はほとんど付けない。
  final reached = result.isOnBase || result == AtBatResult.error || result == AtBatResult.fielderChoice || result == AtBatResult.uncaughtThirdStrike;
  final chance = reached ? 1.0 : 0.05;
  final steals = result.maxSteals > 0 && r.nextDouble() < speed * 0.0025 * chance ? 1 : 0;
  final caught = steals == 0 && result.maxSteals > 0 && r.nextDouble() < 0.03 * chance;
  final scored = result.minRuns > 0 || (result.maxRuns > 0 && r.nextDouble() < (0.33 + speed * 0.002) * chance);
  return AtBat(result, rbi: rbi, steals: steals, caughtStealing: caught, scored: scored);
}
