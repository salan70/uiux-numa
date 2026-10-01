import 'dart:math' show max, min;

import 'package:flutter/material.dart';

import 'model.dart';
import 'number_inputs.dart';
import 'parts.dart';
import 'pixel.dart';
import 'store.dart';
import 'theme.dart';
import 'widgets.dart';

// 試合の入力の部品。3 案は同じ部品を、置き場所だけ変えて使う。
// 高頻度の記録入力の調査（GameChanger の入力面の改修）に従い、主な結果と取り消しを入力面に常設し、
// 打席を足すとその打席が選ばれて、打点と走塁をすぐ直せるようにした。
// 製品の「履歴を押して編集モードに入る」は、選択を常に 1 つ持つ形にまとめ、モードを無くした。

/// 常に見せる 12 の結果。残りは「ほかの結果」から選ぶ。
const _mainResults = [
  AtBatResult.single,
  AtBatResult.double_,
  AtBatResult.triple,
  AtBatResult.homeRun,
  AtBatResult.walk,
  AtBatResult.hitByPitch,
  AtBatResult.swingOut,
  AtBatResult.missedStrikeout,
  AtBatResult.groundOut,
  AtBatResult.flyOut,
  AtBatResult.lineOut,
  AtBatResult.doublePlay,
];

final _moreResults = AtBatResult.values.where((r) => !_mainResults.contains(r)).toList();

/// 打席結果を選ぶ格子。見出しで出塁とアウトを分け、色だけで区別しない。
class ResultPad extends StatelessWidget {
  const ResultPad({super.key, required this.onPick, this.enabled = true});

  final ValueChanged<AtBatResult> onPick;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    Widget group(ResultGroup g, List<AtBatResult> results) => Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: Space.s100),
          child: Text(g.label, style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
        ),
        _grid(context, results),
      ],
    );
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        group(ResultGroup.onBase, _mainResults.where((r) => r.group == ResultGroup.onBase).toList()),
        const SizedBox(height: Space.s200),
        group(ResultGroup.out, _mainResults.where((r) => r.group == ResultGroup.out).toList()),
        const SizedBox(height: Space.s200),
        PressButton(
          label: 'ほかの結果',
          dense: true,
          icon: Icons.more_horiz,
          semanticsHint: '犠打や敬遠などを選べます',
          onPressed: enabled
              ? () async {
                  final picked = await pickResult(context, title: 'ほかの結果', results: _moreResults);
                  if (picked != null) onPick(picked);
                }
              : null,
        ),
      ],
    );
  }

  Widget _grid(BuildContext context, List<AtBatResult> results) {
    final p = Palette.of(context);
    return LayoutBuilder(
      builder: (context, c) {
        final scale = MediaQuery.textScalerOf(context).scale(1);
        final columns = c.maxWidth / scale < 260 ? 2 : 3;
        final width = (c.maxWidth - Space.s100 * (columns - 1)) / columns;
        return Wrap(
          spacing: Space.s100,
          runSpacing: Space.s100,
          children: [
            for (final r in results)
              SizedBox(
                width: width,
                child: Semantics(
                  button: true,
                  enabled: enabled,
                  label: r.label,
                  hint: '打席を足します',
                  excludeSemantics: true,
                  child: Material(
                    color: r.isOnBase ? p.primaryContainer : p.surface,
                    shape: RoundedRectangleBorder(
                      side: BorderSide(color: enabled ? p.ink : p.outline, width: Borders.thick),
                      borderRadius: BorderRadius.circular(Radii.control),
                    ),
                    child: InkWell(
                      onTap: enabled ? () => onPick(r) : null,
                      borderRadius: BorderRadius.circular(Radii.control),
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(minHeight: Sizes.target),
                        child: Center(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: Space.s100, vertical: Space.s150),
                            child: Text(r.label, textAlign: TextAlign.center, style: Txt.control),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}

Future<AtBatResult?> pickResult(BuildContext context, {required String title, List<AtBatResult>? results}) {
  return showModalBottomSheet<AtBatResult>(
    context: context,
    sheetAnimationStyle: sheetAnimation(context),
    isScrollControlled: true,
    builder: (context) => SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(Space.page, 0, Space.page, Space.s400),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Semantics(header: true, child: Text(title, style: Txt.heading)),
            const SizedBox(height: Space.s300),
            for (final group in ResultGroup.values)
              if ((results ?? AtBatResult.values).any((r) => r.group == group)) ...[
                Text(group.label, style: Txt.caption.copyWith(color: Palette.of(context).onSurfaceVariant)),
                const SizedBox(height: Space.s100),
                ChoiceWrap<AtBatResult>(
                  values: (results ?? AtBatResult.values).where((r) => r.group == group).toList(),
                  label: (r) => r.label,
                  isSelected: (_) => false,
                  onSelected: (r) => Navigator.pop(context, r),
                ),
                const SizedBox(height: Space.s300),
              ],
          ],
        ),
      ),
    ),
  );
}

/// 入力した打席の列。押した打席が打点と走塁の編集先になる。
class AtBatStrip extends StatelessWidget {
  const AtBatStrip({super.key});

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final d = store.draft!;
    final p = Palette.of(context);
    final items = <Widget>[
      if (d.runner != null)
        _Chip(
          title: '代走',
          detail: _runnerDetail(d.runner!),
          selected: d.selected == null,
          onTap: () => store.selectAtBat(null),
        ),
      for (var i = 0; i < d.atBats.length; i++)
        _Chip(
          title: '第 ${i + 1} 打席',
          detail: _atBatDetail(d.atBats[i]),
          mark: d.atBats[i].result.label,
          selected: d.selected == i,
          onTap: () => store.selectAtBat(i),
        ),
    ];
    if (items.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: Space.s300),
        child: Text('下の結果を押すと、打席が並びます。', style: Txt.ui.copyWith(color: p.onSurfaceVariant)),
      );
    }
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      reverse: true,
      child: Row(children: items),
    );
  }
}

String _atBatDetail(AtBat a) => [
  if (a.rbi > 0) '${a.rbi} 打点',
  if (a.steals > 0) '${a.steals} 盗塁',
  if (a.caughtStealing) '盗塁死',
  if (a.scored) '得点',
].join(' ');

String _runnerDetail(RunnerLine r) =>
    [if (r.steals > 0) '${r.steals} 盗塁', if (r.caughtStealing) '盗塁死', if (r.scored) '得点'].join(' ');

class _Chip extends StatelessWidget {
  const _Chip({required this.title, required this.detail, required this.selected, required this.onTap, this.mark});

  final String title;
  final String detail;
  final String? mark;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Padding(
      padding: const EdgeInsets.only(right: Space.s200, bottom: Space.s200),
      child: Semantics(
        button: true,
        selected: selected,
        label: '$title ${mark ?? ''} $detail',
        hint: '打点と走塁を直せます',
        excludeSemantics: true,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(Radii.control),
          child: Container(
            constraints: const BoxConstraints(minWidth: 96, minHeight: Sizes.target),
            padding: const EdgeInsets.symmetric(horizontal: Space.s300, vertical: Space.s150),
            decoration: BoxDecoration(
              color: selected ? p.secondaryContainer : p.surface,
              borderRadius: BorderRadius.circular(Radii.control),
              // 選んだ打席は面の色に加え、線を太くせず下線の帯で示す。寸法は変えない。
              border: Border.all(color: selected ? p.ink : p.outline, width: Borders.thick),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(title, style: Txt.caption.copyWith(color: selected ? p.onSecondaryContainer : p.onSurfaceVariant)),
                if (mark != null)
                  Text(mark!, style: Txt.control.copyWith(color: selected ? p.onSecondaryContainer : p.onSurface)),
                Text(
                  detail.isEmpty ? '—' : detail,
                  style: Txt.caption.copyWith(color: selected ? p.onSecondaryContainer : p.onSurface),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// 選んだ打席の打点と走塁。上限は結果ごとに決まる（AC-005、AC-013、AC-014）。
class AtBatEditor extends StatelessWidget {
  const AtBatEditor({super.key});

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final d = store.draft!;
    final p = Palette.of(context);
    final i = d.selected;
    if (i == null && d.runner != null) return _RunnerEditor(line: d.runner!);
    if (i == null || i >= d.atBats.length) return const SizedBox.shrink();
    final a = d.atBats[i];
    final r = a.result;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          children: [
            Expanded(child: Text('第 ${i + 1} 打席 ${r.label}', style: Txt.control)),
            TextButton(
              onPressed: () async {
                final next = await pickResult(context, title: '第 ${i + 1} 打席の結果');
                if (next != null) store.replaceResult(i, next);
              },
              child: const Text('結果を変える'),
            ),
            IconButton(
              tooltip: '第 ${i + 1} 打席を消す',
              onPressed: () => store.removeAtBat(i),
              icon: Icon(Icons.delete_outline, color: p.error),
            ),
          ],
        ),
        if (r.maxRbi > 0)
          NumberStepper(
            label: '打点',
            value: a.rbi,
            min: r.minRbi,
            max: r.maxRbi,
            onChanged: store.setRbi,
            limitNote: '${r.label}の打点は ${r.maxRbi} までです。',
            floorNote: r.minRbi > 0 ? '${r.label}は ${r.minRbi} 打点以上です。' : null,
          ),
        if (a.maxSteals > 0)
          NumberStepper(
            label: '盗塁',
            value: a.steals,
            min: 0,
            max: a.maxSteals,
            onChanged: store.setSteals,
            limitNote: '${r.label}の後の盗塁は ${a.maxSteals} までです。',
          ),
        if (a.maxRuns > 0 || a.allowsCaughtStealing)
          Wrap(
            spacing: Space.s200,
            children: [
              if (a.maxRuns > 0)
                FilterChip(
                  label: const Text('得点'),
                  selected: a.scored,
                  onSelected: r.minRuns > 0 ? null : store.setScored,
                ),
              if (a.allowsCaughtStealing)
                FilterChip(label: const Text('盗塁死'), selected: a.caughtStealing, onSelected: store.setCaughtStealing),
            ],
          ),
        if (r.maxRbi == 0 && r.maxSteals == 0 && r.maxRuns == 0)
          Text('${r.label}では打点も走塁も付きません。', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
      ],
    );
  }
}

class _RunnerEditor extends StatelessWidget {
  const _RunnerEditor({required this.line});

  final RunnerLine line;

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        const Text('代走の走塁', style: Txt.control),
        NumberStepper(
          label: '盗塁',
          value: line.steals,
          min: 0,
          max: RunnerLine.maxSteals,
          onChanged: (v) =>
              store.setRunner(RunnerLine(steals: v, caughtStealing: line.caughtStealing, scored: line.scored)),
          limitNote: '代走の盗塁は二盗と三盗の 2 つまでです。',
        ),
        Wrap(
          spacing: Space.s200,
          children: [
            FilterChip(
              label: const Text('得点'),
              selected: line.scored,
              onSelected: (v) =>
                  store.setRunner(RunnerLine(steals: line.steals, caughtStealing: line.caughtStealing, scored: v)),
            ),
            FilterChip(
              label: const Text('盗塁死'),
              selected: line.caughtStealing,
              onSelected: (v) =>
                  store.setRunner(RunnerLine(steals: line.steals, caughtStealing: v, scored: line.scored)),
            ),
          ],
        ),
      ],
    );
  }
}

/// 入力面の下端。取り消しと、スコアへ進む操作を常に同じ位置に置く。
class GameActionBar extends StatelessWidget {
  const GameActionBar({super.key, required this.onFinish});

  final VoidCallback onFinish;

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final d = store.draft!;
    return Row(
      children: [
        Expanded(
          child: PressButton(
            label: '取り消す',
            icon: Icons.undo,
            semanticsHint: '最後の入力を消します',
            onPressed: d.canUndo ? store.undo : null,
          ),
        ),
        const SizedBox(width: Space.s300),
        Expanded(
          child: PressButton(
            label: '試合を終える',
            kind: PressKind.primary,
            semanticsHint: 'スコアを入れて保存します',
            onPressed: d.canSave ? onFinish : null,
          ),
        ),
      ],
    );
  }
}

/// スコアを入れて保存する（score_input_dialog.md）。保存したら true を返す。
Future<bool> showScoreSheet(BuildContext context) async {
  final saved = await showModalBottomSheet<bool>(
    context: context,
    sheetAnimationStyle: sheetAnimation(context),
    isScrollControlled: true,
    isDismissible: false,
    builder: (_) => StoreScope(store: StoreScope.read(context), child: const _ScoreSheet()),
  );
  return saved ?? false;
}

class _ScoreSheet extends StatefulWidget {
  const _ScoreSheet();

  @override
  State<_ScoreSheet> createState() => _ScoreSheetState();
}

class _ScoreSheetState extends State<_ScoreSheet> {
  /// 新しい試合はどちらも未選択から始め、両方を選ぶまで保存できない（D-19、U-4）。
  int? _my;
  int? _opponent;

  @override
  void initState() {
    super.initState();
    final d = StoreScope.read(context).draft!;
    if (d.initialScores case (final my, final opponent)) {
      _my = max(d.minScore, my);
      _opponent = opponent;
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final p = Palette.of(context);
    final d = store.draft;
    if (d == null) return const SizedBox.shrink();
    final my = _my, opponent = _opponent;
    final outcome = my == null || opponent == null
        ? null
        : my > opponent
        ? GameOutcome.win
        : my < opponent
        ? GameOutcome.loss
        : GameOutcome.draw;
    final saving = store.saveState == SaveState.saving;
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(Space.page, 0, Space.page, Space.s400),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Semantics(header: true, child: const Text('スコア', style: Txt.heading)),
            Text(d.line, style: Txt.ui.copyWith(color: p.onSurfaceVariant)),
            const SizedBox(height: Space.s300),
            _ScoreBoard(my: my, opponent: opponent, outcome: outcome),
            const SizedBox(height: Space.s300),
            _ScorePicker(
              label: '自チーム',
              value: my,
              min: d.minScore,
              onChanged: (v) => setState(() => _my = v),
              note: d.minScore > 0 ? '自チームの得点は、打点の合計と本人の得点の多い方の ${d.minScore} 点以上です。' : null,
            ),
            const SizedBox(height: Space.s300),
            _ScorePicker(label: '相手', value: opponent, min: 0, onChanged: (v) => setState(() => _opponent = v)),

            // 失敗の文言の行は常に確保し、出ても保存ボタンを動かさない。
            SizedBox(
              height: 48,
              child: store.saveState == SaveState.failed
                  ? Semantics(
                      liveRegion: true,
                      child: Text('保存できませんでした。入力は残っているので、もう一度保存してください。', style: Txt.caption.copyWith(color: p.error)),
                    )
                  : null,
            ),
            Row(
              children: [
                Expanded(
                  child: PressButton(label: '入力に戻る', onPressed: saving ? null : () => Navigator.pop(context, false)),
                ),
                const SizedBox(width: Space.s300),
                Expanded(
                  child: PressButton(
                    label: '保存',
                    kind: PressKind.primary,
                    busy: saving,
                    semanticsHint: outcome == null ? '自チームと相手の得点を選ぶと保存できます' : null,
                    onPressed: outcome == null
                        ? null
                        : () async {
                      final ok = await store.saveGame(my!, opponent!);
                      if (ok && context.mounted) Navigator.pop(context, true);
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// スコアの札。0〜10 を 6 列 2 段に常に並べ、1 回押して決める。1 季に 143 回入れる入力なので、増減で数えさせない。
/// プロ野球の 1 試合の得点はほとんど 10 点以下に収まるので、11 点以上だけを「11+」から数字パッドで入れる。
/// 下限（自チームは打点の合計）より小さい札は押せず、理由の行は常に確保して札を動かさない。
class _ScorePicker extends StatelessWidget {
  const _ScorePicker({required this.label, required this.value, required this.min, required this.onChanged, this.note});

  final String label;

  /// 未選択なら null。
  final int? value;
  final int min;
  final ValueChanged<int> onChanged;
  final String? note;

  static const _many = 11;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    Widget key(String text, {required bool selected, VoidCallback? onPressed, String? semantics}) => Expanded(
      child: KeyButton(
        label: text,
        oneLine: true,
        textStyle: Txt.figureSm,
        fill: selected ? p.primary : null,
        semanticsLabel: semantics ?? '$label $text 点',
        semanticsHint: selected ? '選択中' : null,
        onPressed: onPressed,
      ),
    );
    Widget row(List<Widget> keys) => Row(
      children: [
        for (var i = 0; i < keys.length; i++) ...[if (i > 0) const SizedBox(width: Space.s150), keys[i]],
      ],
    );
    final value = this.value;
    Widget n(int v) => key('$v', selected: v == value, onPressed: v < min ? null : () => onChanged(v));
    final many = value != null && value >= _many;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(value == null ? '$label（未選択）' : label, style: Txt.control),
        const SizedBox(height: Space.s100),
        row([for (var v = 0; v <= 5; v++) n(v)]),
        const SizedBox(height: Space.s150),
        row([
          for (var v = 6; v <= 10; v++) n(v),
          key(
            many ? '$value' : '$_many+',
            selected: many,
            semantics: many ? '$label $value 点、変える' : '$label $_many 点以上を入れる',
            onPressed: () async {
              final t = await showNumberPadSheet(
                context,
                title: '$labelの得点',
                initial: many ? '$value' : '',
                maxLength: 2,
                maxValue: 99,
                hint: '$_many〜99 点を打ちます。',
                validate: (t) => (int.tryParse(t) ?? 0) < _many ? '$_many 点以上を打ちます。10 点以下は札から選びます。' : null,
                preview: (t) => Text('${t.isEmpty ? '−' : t} 点', style: Txt.figure.copyWith(color: p.onSurface)),
              );
              if (t != null) onChanged(max(min, int.parse(t)));
            },
          ),
        ]),
        if (note != null) Text(note!, style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
      ],
    );
  }
}

/// スコアの掲示板。選手トップと試合の掲示板と同じ暗い面にドット文字で得点を灯し、勝敗を札で添える。
class _ScoreBoard extends StatelessWidget {
  const _ScoreBoard({required this.my, required this.opponent, required this.outcome});

  /// 未選択の側は null で、「−」を灯す。
  final int? my;
  final int? opponent;
  final GameOutcome? outcome;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final label = Txt.caption.copyWith(color: Night.ink);
    Widget side(String name, int? score) => Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(name, style: label),
        const SizedBox(height: Space.s100),
        DotText([score == null ? '-' : '$score'], pitch: 4, offColor: Night.ledOff),
      ],
    );
    return Semantics(
      liveRegion: true,
      label: outcome == null ? 'スコアは未選択' : '$my 対 $opponent で${outcome!.label}',
      excludeSemantics: true,
      child: BoldBox(
        color: Night.board,
        padding: const EdgeInsets.symmetric(horizontal: Space.s400, vertical: Space.s200),
        child: Row(
          children: [
            Expanded(child: side('自チーム', my)),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: Space.s300, vertical: Space.s50),
              decoration: BoxDecoration(
                color: outcome == GameOutcome.win ? p.primary : Night.board,
                borderRadius: BorderRadius.circular(Radii.control),
                border: Border.all(color: outcome == GameOutcome.win ? p.ink : Night.ink, width: Borders.thick),
              ),
              child: Text(
                outcome?.label ?? '−',
                style: Txt.control.copyWith(color: outcome == GameOutcome.win ? p.onPrimary : Night.ink),
              ),
            ),
            Expanded(child: side('相手', opponent)),
          ],
        ),
      ),
    );
  }
}

/// 次の試合の出場を選ぶ。欠場なら進める試合数を選ぶ（skip_games_dialog.md を統合した）。
class NextGameChoice {
  const NextGameChoice.play(Participation this.participation) : skip = 0, wins = 0, losses = 0, draws = 0, rank = null;
  const NextGameChoice.skip(this.skip, {this.wins = 0, this.losses = 0, this.draws = 0, this.rank}) : participation = null;

  final Participation? participation;
  final int skip;

  /// 欠場で進める試合のチームの勝敗の数。入れなかった分は未記録になる。
  final int wins;
  final int losses;
  final int draws;

  /// 進めた後のチーム順位。
  final int? rank;
}

class ParticipationForm extends StatefulWidget {
  const ParticipationForm({
    super.key,
    required this.player,
    required this.onDecided,
    this.dense = false,
    this.initialKind = ParticipationKind.starter,
    this.initial,
  });

  final Player player;
  final ValueChanged<NextGameChoice> onDecided;
  final bool dense;

  /// 入力の途中で出場を選び直すときの今の出場。あれば欠場と「前と同じ」を出さない（D-17）。
  final Participation? initial;

  /// 最初に選んでおく出場のしかた。「欠場で進める」から開くときは欠場にする。
  final ParticipationKind initialKind;

  @override
  State<ParticipationForm> createState() => _ParticipationFormState();
}

class _ParticipationFormState extends State<ParticipationForm> {
  late ParticipationKind _kind = widget.initial?.kind ?? widget.initialKind;
  late int _order =
      widget.initial?.battingOrder ??
      widget.player.current.games.reversed.map((g) => g.participation.battingOrder).whereType<int>().firstOrNull ??
      1;

  /// 守備位置の初期値は前の試合の守備位置、無ければメイン。
  late Position _position =
      widget.initial?.position ??
      widget.player.current.games.reversed.map((g) => g.participation.position).whereType<Position>().firstOrNull ??
      widget.player.mainPosition;

  /// 前の試合の出場。欠場だったり今季の最初の試合だったりすれば無い（D-19、U-2）。
  Participation? get _previous {
    final last = widget.player.current.games.lastOrNull;
    return last == null || !last.played ? null : last.participation;
  }
  int _skip = 1;
  int _wins = 0;
  int _losses = 0;
  int _draws = 0;
  late int _rank = widget.player.current.teamRank;

  /// 進める試合を減らしたら、勝敗の数を収まるように削る。後から足した引き分け、負け、勝ちの順に削る。
  void _setSkip(int v) {
    _skip = v;
    var over = max(0, _wins + _losses + _draws - v);
    final cutDraws = min(over, _draws);
    _draws -= cutDraws;
    over -= cutDraws;
    final cutLosses = min(over, _losses);
    _losses -= cutLosses;
    over -= cutLosses;
    _wins -= over;
  }

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final season = widget.player.current;
    final remaining = season.totalGames - season.playedCount;
    final previous = widget.initial == null ? _previous : null;
    // スタメンは選手の守備位置と指名打者、守備固めは選手の守備位置だけから選ぶ（D-18）。
    final positions = [
      ...widget.player.positions,
      if (_kind == ParticipationKind.starter) Position.designatedHitter,
    ];
    if (!positions.contains(_position)) _position = widget.player.mainPosition;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (previous != null) ...[
          // 1 季に 143 回選ぶので、前と同じ出場は 1 回押して始める。
          PressButton(
            label: '前と同じ（${_describe(previous)}）',
            icon: Icons.replay,
            semanticsHint: 'この出場で試合を始めます',
            onPressed: () => widget.onDecided(NextGameChoice.play(previous)),
          ),
          const SizedBox(height: Space.s200),
          Text('ほかの出場', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
          const SizedBox(height: Space.s100),
        ],
        ChoiceWrap<ParticipationKind>(
          semanticsLabel: '出場',
          values: [
            for (final k in ParticipationKind.values)
              if (widget.initial == null || k != ParticipationKind.none) k,
          ],
          label: (k) => k.label,
          isSelected: (k) => k == _kind,
          onSelected: (k) => setState(() => _kind = k),
        ),
        const SizedBox(height: Space.s300),
        if (_kind.hasOrder) ...[
          Text('打順', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
          const SizedBox(height: Space.s100),
          ChoiceWrap<int>(
            semanticsLabel: '打順',
            values: [for (var i = 1; i <= 9; i++) i],
            label: (i) => '$i',
            isSelected: (i) => i == _order,
            onSelected: (i) => setState(() => _order = i),
          ),
          const SizedBox(height: Space.s300),
        ],
        if (_kind.hasPosition) ...[
          Text('守備位置', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
          const SizedBox(height: Space.s100),
          ChoiceWrap<Position>(
            semanticsLabel: '守備位置',
            values: positions,
            label: (pos) => pos.short,
            isSelected: (pos) => pos == _position,
            onSelected: (pos) => setState(() => _position = pos),
          ),
          const SizedBox(height: Space.s300),
        ],
        if (_kind == ParticipationKind.none) ...[
          NumberStepper(
            label: '進める試合',
            value: _skip,
            min: 1,
            max: remaining,
            unit: ' 試合',
            onChanged: (v) => setState(() => _setSkip(v)),
            limitNote: '残りは $remaining 試合です。',
          ),
          Text('第 ${season.playedCount + _skip} 戦まで進みます。', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
          const SizedBox(height: Space.s300),
          // 欠場の間もチームの勝敗と順位は動くので、任意で入れる。入れなければ未記録として残す。
          Text('チームの結果（任意）', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
          const SizedBox(height: Space.s100),
          if (_skip == 1)
            // 1 試合なら、どれか 1 つを選ぶ札にする。数の増減より 1 回で決まる。
            ChoiceWrap<GameOutcome?>(
              semanticsLabel: 'チームの勝敗',
              values: const [null, GameOutcome.win, GameOutcome.loss, GameOutcome.draw],
              label: (o) => o?.label ?? '未記録',
              isSelected: (o) => o == (_wins > 0 ? GameOutcome.win : _losses > 0 ? GameOutcome.loss : _draws > 0 ? GameOutcome.draw : null),
              onSelected: (o) => setState(() {
                _wins = o == GameOutcome.win ? 1 : 0;
                _losses = o == GameOutcome.loss ? 1 : 0;
                _draws = o == GameOutcome.draw ? 1 : 0;
              }),
            )
          else ...[
            for (final (label, value, set) in [
              ('勝ち', _wins, (int v) => _wins = v),
              ('負け', _losses, (int v) => _losses = v),
              ('引き分け', _draws, (int v) => _draws = v),
            ])
              NumberStepper(
                label: label,
                value: value,
                min: 0,
                max: _skip - (_wins + _losses + _draws - value),
                unit: ' 試合',
                onChanged: (v) => setState(() => set(v)),
              ),
            Text(
              '未記録 ${_skip - _wins - _losses - _draws} 試合',
              style: Txt.caption.copyWith(color: p.onSurfaceVariant),
            ),
          ],
          const SizedBox(height: Space.s200),
          NumberStepper(
            label: 'チーム順位',
            value: _rank,
            min: 1,
            max: season.team.teamCount,
            unit: ' 位',
            limitNote: '最下位です',
            floorNote: '首位です',
            onChanged: (v) => setState(() => _rank = v),
          ),
          const SizedBox(height: Space.s300),
        ],
        PressButton(
          label: _kind == ParticipationKind.none
              ? '$_skip 試合を進める'
              : widget.initial != null
              ? 'この出場にする'
              : '試合を始める',
          kind: PressKind.primary,
          onPressed: () => widget.onDecided(
            _kind == ParticipationKind.none
                ? NextGameChoice.skip(_skip, wins: _wins, losses: _losses, draws: _draws, rank: _rank)
                : NextGameChoice.play(
                    Participation(
                      _kind,
                      battingOrder: _kind.hasOrder ? _order : null,
                      position: _kind.hasPosition ? _position : null,
                    ),
                  ),
          ),
        ),
      ],
    );
  }
}

/// 「1 番・遊」「代打・5 番」の短い形。札に 1 行で収める。
String _describe(Participation p) => switch (p.kind) {
  ParticipationKind.starter => '${p.battingOrder} 番・${p.position?.short ?? ''}',
  ParticipationKind.pinchHitter => '代打・${p.battingOrder} 番',
  ParticipationKind.defensive => '守備固め・${p.position?.short ?? ''}',
  _ => p.kind.label,
};

Future<NextGameChoice?> showParticipationSheet(
  BuildContext context,
  Player player, {
  ParticipationKind initialKind = ParticipationKind.starter,
  Participation? initial,
}) {
  return showModalBottomSheet<NextGameChoice>(
    context: context,
    sheetAnimationStyle: sheetAnimation(context),
    isScrollControlled: true,
    builder: (context) => SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(Space.page, 0, Space.page, Space.s400),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Semantics(
              header: true,
              child: Text(initial != null ? '出場を選び直す' : '第 ${player.current.playedCount + 1} 戦', style: Txt.heading),
            ),
            if (initial != null)
              Text('入力した打席は残ります。', style: Txt.caption.copyWith(color: Palette.of(context).onSurfaceVariant)),
            const SizedBox(height: Space.s300),
            ParticipationForm(
              player: player,
              initialKind: initialKind,
              initial: initial,
              onDecided: (c) => Navigator.pop(context, c),
            ),
          ],
        ),
      ),
    ),
  );
}

/// 出場を決めた後の共通処理。欠場なら進め、出場なら入力を始める。入力を始めたら true。
bool applyChoice(AppStore store, NextGameChoice choice) {
  if (choice.participation == null) {
    store.skipGames(choice.skip, wins: choice.wins, losses: choice.losses, draws: choice.draws, rank: choice.rank);
    return false;
  }
  store.startGame(choice.participation!);
  return true;
}

/// 下端の入力面の器。文字を拡大しても画面の 6 割を超えず、中をスクロールさせる。
/// 上に並ぶ打席の列と打点の編集を、入力面が押し出さないようにする。
class InputDock extends StatelessWidget {
  const InputDock({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Container(
      decoration: BoxDecoration(
        color: p.surfaceContainer,
        border: Border(
          top: BorderSide(color: p.ink, width: Borders.thick),
        ),
      ),
      child: SafeArea(
        child: ConstrainedBox(
          constraints: BoxConstraints(maxHeight: MediaQuery.sizeOf(context).height * 0.6),
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(Space.page, Space.s300, Space.page, Space.s300),
            child: child,
          ),
        ),
      ),
    );
  }
}
