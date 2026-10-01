// Baseball Player Journey のドメインの型と規則。
// 出典: salan70/baseball_player_journey 5e5fb44 の docs/specification/（domain_model.md、function_design/）と
// swift-packages/Domain/Sources/Domain/Features/（AtBatResultType.swift、Ability.swift、PlayerAbilities.swift）。
// 本体に無い状態や値は置かない。UI の都合で持つ値は store.dart に置き、永続化の対象にしない。

/// 打席結果の大分類。入力面の見出しに使う。
enum ResultGroup {
  onBase('出塁'),
  out('アウト'),
  other('その他');

  const ResultGroup(this.label);
  final String label;
}

/// 打席結果。上限と下限は AtBatResultType.swift の maxRbi、minRbi、maxStolenBases、maxRuns、minRuns を写した。
/// 敬遠は本体で打数に数えている（isAtBat）が、公認野球規則 9.02(a)(1) に従い数えない。README の製品への指摘に記録した。
enum AtBatResult {
  single('ヒット', '安', ResultGroup.onBase, bases: 1, maxRbi: 3, maxSteals: 3, maxRuns: 1),
  double_('二塁打', '二', ResultGroup.onBase, bases: 2, maxRbi: 3, maxSteals: 2, maxRuns: 1),
  triple('三塁打', '三', ResultGroup.onBase, bases: 3, maxRbi: 3, maxSteals: 1, maxRuns: 1),
  homeRun('ホームラン', '本', ResultGroup.onBase, bases: 4, maxRbi: 4, minRbi: 1, maxSteals: 0, maxRuns: 1, minRuns: 1),
  walk('四球', '四', ResultGroup.onBase, atBat: false, maxRbi: 1, maxSteals: 3, maxRuns: 1),
  hitByPitch('死球', '死', ResultGroup.onBase, atBat: false, maxRbi: 1, maxSteals: 3, maxRuns: 1),
  intentionalWalk('敬遠', '敬', ResultGroup.onBase, atBat: false, maxRbi: 1, maxSteals: 3, maxRuns: 1),
  swingOut('空振り三振', '振', ResultGroup.out, strikeout: true),
  missedStrikeout('見逃し三振', '見', ResultGroup.out, strikeout: true),
  groundOut('ゴロ', 'ゴ', ResultGroup.out, maxRbi: 1, maxSteals: 1, maxRuns: 1),
  flyOut('フライ', '飛', ResultGroup.out),
  lineOut('ライナー', '直', ResultGroup.out),
  doublePlay('併殺打', '併', ResultGroup.out),
  sacrificeFly('犠牲フライ', '犠飛', ResultGroup.other, atBat: false, maxRbi: 1),
  sacrificeBunt('犠打', '犠打', ResultGroup.other, atBat: false, maxRbi: 1),
  error('エラー', '失', ResultGroup.other, maxSteals: 3, maxRuns: 1),
  fielderChoice('野選', '野', ResultGroup.other, maxRbi: 1, maxSteals: 3, maxRuns: 1),
  buntOut('バントアウト', 'バ', ResultGroup.other),
  uncaughtThirdStrike('振り逃げ', '逃', ResultGroup.other, strikeout: true, maxSteals: 3, maxRuns: 1);

  const AtBatResult(
    this.label,
    this.mark,
    this.group, {
    this.bases = 0,
    this.atBat = true,
    this.strikeout = false,
    this.maxRbi = 0,
    this.minRbi = 0,
    this.maxSteals = 0,
    this.maxRuns = 0,
    this.minRuns = 0,
  });

  final String label;

  /// スコアブックの 1 字から 2 字の記号。
  final String mark;
  final ResultGroup group;
  final int bases;
  final bool atBat;
  final bool strikeout;
  final int maxRbi;
  final int minRbi;
  final int maxSteals;
  final int maxRuns;
  final int minRuns;

  bool get isHit => bases > 0;
  bool get isOnBase => group == ResultGroup.onBase;

  /// 盗塁死は、打者走者が塁に残る結果にだけ付く（allowsSubsequentCaughtStealing）。
  bool get allowsCaughtStealing => maxSteals > 0 && this != triple;
}

/// 出場区分。function_design/game_result_input.md の GameParticipation を写した。
enum ParticipationKind {
  starter('スタメン', hasOrder: true, hasPosition: true),
  pinchHitter('代打', hasOrder: true),
  pinchRunner('代走'),
  defensive('守備固め', hasPosition: true),
  none('欠場');

  const ParticipationKind(this.label, {this.hasOrder = false, this.hasPosition = false});
  final String label;
  final bool hasOrder;
  final bool hasPosition;

  bool get bats => this == starter || this == pinchHitter || this == defensive;
}

class Participation {
  const Participation(this.kind, {this.battingOrder, this.position});

  final ParticipationKind kind;
  final int? battingOrder;
  final Position? position;

  String get label => switch (kind) {
    ParticipationKind.starter => '${battingOrder ?? '-'} 番 ${position?.short ?? ''}',
    ParticipationKind.pinchHitter => '代打',
    ParticipationKind.pinchRunner => '代走',
    ParticipationKind.defensive => '守備 ${position?.short ?? ''}',
    ParticipationKind.none => '欠場',
  };
}

/// 守備位置。投手は対象外（function_design/game_result_input.md の非対象）。
enum Position {
  catcher('捕手', '捕', PositionGroup.catcher),
  first('一塁手', '一', PositionGroup.infield),
  second('二塁手', '二', PositionGroup.infield),
  third('三塁手', '三', PositionGroup.infield),
  shortstop('遊撃手', '遊', PositionGroup.infield),
  left('左翼手', '左', PositionGroup.outfield),
  center('中堅手', '中', PositionGroup.outfield),
  right('右翼手', '右', PositionGroup.outfield);

  const Position(this.label, this.short, this.group);
  final String label;
  final String short;
  final PositionGroup group;
}

enum PositionGroup {
  catcher('捕手'),
  infield('内野手'),
  outfield('外野手');

  const PositionGroup(this.label);
  final String label;
}

enum Hand {
  right('右'),
  left('左'),
  both('両');

  const Hand(this.label);
  final String label;
}

enum CareerBackground {
  highSchool('高卒', 18),
  university('大卒', 22),
  society('社会人', 24),
  independent('独立リーグ', 23),
  other('その他', 25);

  const CareerBackground(this.label, this.defaultAge);
  final String label;
  final int defaultAge;
}

enum JoiningRoute {
  draft('ドラフト'),
  developmentDraft('育成ドラフト'),
  tryout('テスト入団'),
  other('その他');

  const JoiningRoute(this.label);
  final String label;
}

enum PlayerStatus { active, retired }

/// 能力値のランク。Ability.swift の AbilityRank.fromValue を写した。
String abilityRank(int value) {
  if (value >= 95) return 'S+';
  if (value >= 90) return 'S';
  if (value >= 80) return 'A';
  if (value >= 70) return 'B';
  if (value >= 60) return 'C';
  if (value >= 50) return 'D';
  if (value >= 40) return 'E';
  if (value >= 30) return 'F';
  return 'G';
}

class Ability {
  const Ability(this.name, this.value);
  final String name;

  /// 1〜99。画面設計書の範囲に合わせた（Ability.swift は 1〜100）。
  final int value;

  String get rank => abilityRank(value);
  Ability copyWith({String? name, int? value}) => Ability(name ?? this.name, value ?? this.value);
}

/// 能力は 3〜10 個で、名前は重複しない（PlayerAbilities.swift）。
const minAbilities = 3;
const maxAbilities = 10;
const defaultAbilityNames = ['ミート', 'パワー', '選球眼', 'メンタル', 'スピード', '肩', '守備'];

class Team {
  const Team({required this.name, required this.abbreviation, required this.league, required this.country, required this.teamCount});
  final String name;
  final String abbreviation;
  final String league;
  final String country;
  final int teamCount;
}

class PlayerOrigin {
  const PlayerOrigin({required this.route, required this.joiningYear, this.draftRound, this.memo});
  final JoiningRoute route;
  final int joiningYear;
  final int? draftRound;
  final String? memo;
}

/// 1 打席。走塁は打席に結び付けて持つ（BaseRunningAction.relatedAtBatActionId）。
class AtBat {
  const AtBat(this.result, {this.rbi = 0, this.steals = 0, this.caughtStealing = false, this.scored = false});

  final AtBatResult result;
  final int rbi;
  final int steals;
  final bool caughtStealing;
  final bool scored;

  /// 結果を替えたとき、上限を超える値を上限へ丸める。ホームランは盗塁を 0 に戻す（AC-017）。
  AtBat withResult(AtBatResult next) => AtBat(
    next,
    rbi: rbi.clamp(next.minRbi, next.maxRbi),
    steals: steals.clamp(0, next.maxSteals),
    caughtStealing: caughtStealing && next.allowsCaughtStealing,
    scored: next.minRuns > 0 || (scored && next.maxRuns > 0),
  );

  AtBat copyWith({int? rbi, int? steals, bool? caughtStealing, bool? scored}) => AtBat(
    result,
    rbi: rbi ?? this.rbi,
    steals: steals ?? this.steals,
    caughtStealing: caughtStealing ?? this.caughtStealing,
    scored: scored ?? this.scored,
  );
}

/// 代走で出た走者の走塁。打席に結び付かない走塁（relatedAtBatActionId が null）。
class RunnerLine {
  const RunnerLine({this.steals = 0, this.caughtStealing = false, this.scored = false});
  final int steals;
  final bool caughtStealing;
  final bool scored;

  /// 代走は一塁から出る前提で、二盗と三盗の 2 回を上限にする。
  static const maxSteals = 2;
}

class GameRecord {
  const GameRecord({
    required this.number,
    required this.participation,
    this.atBats = const [],
    this.runner,
    this.myScore,
    this.opponentScore,
    this.teamRank,
    this.teamOutcome,
    this.stint = 0,
    this.memo,
  });

  final int number;

  /// 所属期間（Stint.id）。季の途中で移籍したら、移籍の後の試合は新しい所属期間に入る（D-23）。
  final int stint;

  /// 試合後の短いメモ（D-19、U-7）。その年の 1 ページに出す。
  final String? memo;
  final Participation participation;
  final List<AtBat> atBats;
  final RunnerLine? runner;

  /// 欠場で進めた試合はスコアを持たない（skip_games_dialog.md）。
  final int? myScore;
  final int? opponentScore;
  final int? teamRank;

  /// 欠場の試合のチームの勝敗。スコアを持たないので、勝敗だけを任意で入れる。
  final GameOutcome? teamOutcome;

  GameRecord withTeamRank(int value) => copyWith(teamRank: value);

  GameRecord copyWith({int? number, int? teamRank, GameOutcome? Function()? teamOutcome, int? stint, String? Function()? memo}) => GameRecord(
    number: number ?? this.number,
    participation: participation,
    atBats: atBats,
    runner: runner,
    myScore: myScore,
    opponentScore: opponentScore,
    teamRank: teamRank ?? this.teamRank,
    teamOutcome: teamOutcome == null ? this.teamOutcome : teamOutcome(),
    stint: stint ?? this.stint,
    memo: memo == null ? this.memo : memo(),
  );

  bool get played => participation.kind != ParticipationKind.none;
  int get rbi => atBats.fold(0, (s, a) => s + a.rbi);

  GameOutcome? get outcome {
    if (myScore == null || opponentScore == null) return teamOutcome;
    if (myScore! > opponentScore!) return GameOutcome.win;
    if (myScore! < opponentScore!) return GameOutcome.loss;
    return GameOutcome.draw;
  }
}

enum GameOutcome {
  win('勝ち', '○'),
  loss('負け', '●'),
  draw('引き分け', '△');

  const GameOutcome(this.label, this.mark);
  final String label;
  final String mark;
}

/// 通算の節目（domain_rules.md R-4、D-28）。before から after までに越えた節目を、越えた順に返す。
List<String> milestonesBetween(BattingLine before, BattingLine after) {
  final out = <String>[];
  String grouped(int v) => v >= 1000 ? '${v ~/ 1000},${(v % 1000).toString().padLeft(3, '0')}' : '$v';
  void check(String first, int b, int a, List<int> marks, String unit) {
    for (final m in marks) {
      if (b < m && a >= m) out.add(m == 1 ? 'プロ初$first' : '通算 ${grouped(m)} $unit');
    }
  }

  check('出場', before.games, after.games, [1, 100, 500, 1000, 2000], '試合出場');
  check('安打', before.hits, after.hits, [1, 100, 500, 1000, 1500, 2000], '安打');
  check('ホームラン', before.homeRuns, after.homeRuns, [1, 50, 100, 200, 300, 400, 500], '本塁打');
  check('打点', before.rbi, after.rbi, [1, 100, 500, 1000, 1500], '打点');
  check('盗塁', before.steals, after.steals, [1, 100, 200, 300], '盗塁');
  return out;
}

/// リーグ内順位を入れる成績の項目（StatItemName）。
enum StatItem {
  average('打率', '首位打者'),
  homeRuns('本塁打', '本塁打王'),
  rbi('打点', '打点王'),
  hits('安打', '最多安打'),
  obp('出塁率', '最高出塁率'),
  steals('盗塁', '盗塁王');

  const StatItem(this.label, this.title);
  final String label;

  /// 1 位のときに候補として先に選ぶタイトル。
  final String title;
}

const defaultTitles = ['首位打者', '本塁打王', '打点王', '最多安打', '最高出塁率', '盗塁王', 'MVP', '新人王', 'ベストナイン', 'ゴールデングラブ'];

/// 所属期間。季の途中で移籍すると季を所属期間に分ける（D-23）。
class Stint {
  Stint({required this.id, required this.team, required this.uniformNumber, this.startRank = 1});

  final int id;
  Team team;
  String uniformNumber;

  /// 所属期間の最初の試合の順位の初期値。開幕は 1 位、移籍では移籍のときに入れた順位（R-7-3）。
  int startRank;
}

class Season {
  Season({
    required this.year,
    required Team team,
    required String uniformNumber,
    required this.salary,
    required this.abilities,
    this.totalGames = 143,
    List<GameRecord>? games,
    List<String>? titles,
    Map<StatItem, int>? ranks,
    this.transferred = false,
  }) : games = games ?? [],
       titles = titles ?? [],
       ranks = ranks ?? {},
       stints = [Stint(id: 0, team: team, uniformNumber: uniformNumber)];

  final int year;
  final List<Stint> stints;
  Stint get stint => stints.last;
  Stint stintOf(int id) => stints.firstWhere((s) => s.id == id);
  Team get team => stint.team;

  /// 文字で持つ。支配下の 0 と 00、育成の 012 のような 0 始まりを区別する。
  String get uniformNumber => stint.uniformNumber;

  /// 万円。
  final int salary;
  final List<Ability> abilities;
  final int totalGames;
  final List<GameRecord> games;
  final List<String> titles;
  final Map<StatItem, int> ranks;

  /// この季の前に移籍した。経歴の球団の変遷に使う。
  final bool transferred;

  int get playedCount => games.length;

  /// 季の途中で移籍した。
  bool get hasTransfer => stints.length > 1;

  /// 今の所属期間の試合。チームの勝敗と順位は所属期間ごとに数える（R-7-3）。
  List<GameRecord> get stintGames => [for (final g in games) if (g.stint == stint.id) g];

  /// 次の試合の前の順位。開幕は全球団が 0 勝 0 敗で並ぶので 1 位から始める。
  int get teamRank => stintGames.lastOrNull?.teamRank ?? stint.startRank;
  int rankBefore(int index) {
    final g = games[index];
    if (index == 0 || games[index - 1].stint != g.stint) return stintOf(g.stint).startRank;
    return games[index - 1].teamRank ?? 1;
  }

  int get wins => stintGames.where((g) => g.outcome == GameOutcome.win).length;
  int get losses => stintGames.where((g) => g.outcome == GameOutcome.loss).length;
  int get draws => stintGames.where((g) => g.outcome == GameOutcome.draw).length;
  bool get isComplete => games.length >= totalGames;

  /// 規定打席。年間試合数 × 3.1 の端数を切り捨てる。季の途中は消化した試合数 × 3.1 とする（R-3-a、D-34）。
  int get qualifyingPlateAppearances => (games.length * 31) ~/ 10;
  bool get qualified => games.isNotEmpty && line.plateAppearances >= qualifyingPlateAppearances;
  BattingLine get line => BattingLine.of(games);
}

class Player {
  Player({
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
    required this.seasons,
    this.status = PlayerStatus.active,
    this.lastPlayedOrder = 0,
  });

  final String id;
  String name;
  final CareerBackground background;
  final Hand throws;
  Hand bats;

  /// 先頭がメインの守備位置。
  List<Position> positions;
  final int height;
  final int weight;
  final int birthYear;
  final PlayerOrigin origin;
  final List<Season> seasons;
  PlayerStatus status;

  /// 最後に遊んだ順。「つづきから」の並びに使う。
  int lastPlayedOrder;

  /// 通算のリーグ内順位（CareerLeagueRanking）。引退のときに入れる。
  final Map<StatItem, int> careerRanks = {};

  Season get current => seasons.last;
  bool get isActive => status == PlayerStatus.active;
  Position get mainPosition => positions.first;
  int get age => current.year - birthYear;
  int get proYears => seasons.length;
  BattingLine get career => BattingLine.of([for (final s in seasons) ...s.games]);
  List<String> get allTitles => [for (final s in seasons) ...s.titles.map((t) => '${s.year} $t')];
  String get handedness => '${throws.label}投${bats.label}打';
}

/// 打撃成績。BattingStatsValues の項目と計算式を写した。
class BattingLine {
  const BattingLine({
    this.games = 0,
    this.plateAppearances = 0,
    this.atBats = 0,
    this.hits = 0,
    this.doubles = 0,
    this.triples = 0,
    this.homeRuns = 0,
    this.rbi = 0,
    this.runs = 0,
    this.steals = 0,
    this.caughtStealing = 0,
    this.walks = 0,
    this.hitByPitch = 0,
    this.strikeouts = 0,
    this.sacrificeBunts = 0,
    this.sacrificeFlies = 0,
    this.doublePlays = 0,
  });

  factory BattingLine.of(Iterable<GameRecord> games) {
    var g = 0, pa = 0, ab = 0, h = 0, d2 = 0, d3 = 0, hr = 0, rbi = 0, r = 0;
    var sb = 0, cs = 0, bb = 0, hbp = 0, so = 0, sh = 0, sf = 0, dp = 0;
    for (final game in games) {
      if (!game.played) continue;
      g++;
      final runner = game.runner;
      if (runner != null) {
        sb += runner.steals;
        cs += runner.caughtStealing ? 1 : 0;
        r += runner.scored ? 1 : 0;
      }
      for (final a in game.atBats) {
        final res = a.result;
        pa++;
        if (res.atBat) ab++;
        if (res.isHit) h++;
        if (res == AtBatResult.double_) d2++;
        if (res == AtBatResult.triple) d3++;
        if (res == AtBatResult.homeRun) hr++;
        if (res == AtBatResult.walk || res == AtBatResult.intentionalWalk) bb++;
        if (res == AtBatResult.hitByPitch) hbp++;
        if (res.strikeout) so++;
        if (res == AtBatResult.sacrificeBunt) sh++;
        if (res == AtBatResult.sacrificeFly) sf++;
        if (res == AtBatResult.doublePlay) dp++;
        rbi += a.rbi;
        sb += a.steals;
        cs += a.caughtStealing ? 1 : 0;
        r += a.scored ? 1 : 0;
      }
    }
    return BattingLine(
      games: g,
      plateAppearances: pa,
      atBats: ab,
      hits: h,
      doubles: d2,
      triples: d3,
      homeRuns: hr,
      rbi: rbi,
      runs: r,
      steals: sb,
      caughtStealing: cs,
      walks: bb,
      hitByPitch: hbp,
      strikeouts: so,
      sacrificeBunts: sh,
      sacrificeFlies: sf,
      doublePlays: dp,
    );
  }

  final int games;
  final int plateAppearances;
  final int atBats;
  final int hits;
  final int doubles;
  final int triples;
  final int homeRuns;
  final int rbi;
  final int runs;
  final int steals;
  final int caughtStealing;
  final int walks;
  final int hitByPitch;
  final int strikeouts;
  final int sacrificeBunts;
  final int sacrificeFlies;
  final int doublePlays;

  int get totalBases => hits + doubles + 2 * triples + 3 * homeRuns;
  double? get average => atBats == 0 ? null : hits / atBats;
  double? get onBase {
    final d = atBats + walks + hitByPitch + sacrificeFlies;
    return d == 0 ? null : (hits + walks + hitByPitch) / d;
  }

  double? get slugging => atBats == 0 ? null : totalBases / atBats;
  double? get ops => onBase == null || slugging == null ? null : onBase! + slugging!;

  num? valueOf(StatItem item) => switch (item) {
    StatItem.average => average,
    StatItem.homeRuns => homeRuns,
    StatItem.rbi => rbi,
    StatItem.hits => hits,
    StatItem.obp => onBase,
    StatItem.steals => steals,
  };
}
