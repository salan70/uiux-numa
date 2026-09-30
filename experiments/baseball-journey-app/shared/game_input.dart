import 'package:flutter/material.dart';

import 'model.dart';
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
        if (r.maxSteals > 0)
          NumberStepper(
            label: '盗塁',
            value: a.steals,
            min: 0,
            max: r.maxSteals,
            onChanged: store.setSteals,
            limitNote: '${r.label}の後の盗塁は ${r.maxSteals} までです。',
          ),
        if (r.maxRuns > 0 || r.allowsCaughtStealing)
          Wrap(
            spacing: Space.s200,
            children: [
              if (r.maxRuns > 0)
                FilterChip(
                  label: const Text('得点'),
                  selected: a.scored,
                  onSelected: r.minRuns > 0 ? null : store.setScored,
                ),
              if (r.allowsCaughtStealing)
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
            onPressed: d.isEmpty ? null : store.undo,
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
  late int _my;
  int _opponent = 0;

  @override
  void initState() {
    super.initState();
    final rbi = StoreScope.read(context).draft!.rbi;
    _my = rbi;
  }

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final p = Palette.of(context);
    final d = store.draft;
    if (d == null) return const SizedBox.shrink();
    final outcome = _my > _opponent
        ? GameOutcome.win
        : _my < _opponent
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
            _ScoreBoard(my: _my, opponent: _opponent, outcome: outcome),
            const SizedBox(height: Space.s300),
            NumberStepper(
              label: '自チーム',
              value: _my,
              min: d.rbi,
              max: 99,
              unit: ' 点',
              onChanged: (v) => setState(() => _my = v),
              floorNote: d.rbi > 0 ? '自チームの得点は、打点の合計の ${d.rbi} 点以上です。' : null,
            ),
            NumberStepper(
              label: '相手',
              value: _opponent,
              min: 0,
              max: 99,
              unit: ' 点',
              onChanged: (v) => setState(() => _opponent = v),
            ),

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
                    onPressed: () async {
                      final ok = await store.saveGame(_my, _opponent);
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

/// スコアの掲示板。選手トップと試合の掲示板と同じ暗い面にドット文字で得点を灯し、勝敗を札で添える。
class _ScoreBoard extends StatelessWidget {
  const _ScoreBoard({required this.my, required this.opponent, required this.outcome});

  final int my;
  final int opponent;
  final GameOutcome outcome;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final label = Txt.caption.copyWith(color: Night.ink);
    Widget side(String name, int score) => Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(name, style: label),
        const SizedBox(height: Space.s100),
        DotText(['$score'], pitch: 4, offColor: Night.ledOff),
      ],
    );
    return Semantics(
      liveRegion: true,
      label: '$my 対 $opponent で${outcome.label}',
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
                outcome.label,
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
  const NextGameChoice.play(Participation this.participation) : skip = 0;
  const NextGameChoice.skip(this.skip) : participation = null;

  final Participation? participation;
  final int skip;
}

class ParticipationForm extends StatefulWidget {
  const ParticipationForm({
    super.key,
    required this.player,
    required this.onDecided,
    this.dense = false,
    this.initialKind = ParticipationKind.starter,
  });

  final Player player;
  final ValueChanged<NextGameChoice> onDecided;
  final bool dense;

  /// 最初に選んでおく出場のしかた。「欠場で進める」から開くときは欠場にする。
  final ParticipationKind initialKind;

  @override
  State<ParticipationForm> createState() => _ParticipationFormState();
}

class _ParticipationFormState extends State<ParticipationForm> {
  late ParticipationKind _kind = widget.initialKind;
  late int _order =
      widget.player.current.games.reversed.map((g) => g.participation.battingOrder).whereType<int>().firstOrNull ?? 1;
  late Position _position = widget.player.mainPosition;
  int _skip = 1;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final season = widget.player.current;
    final remaining = season.totalGames - season.playedCount;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        ChoiceWrap<ParticipationKind>(
          semanticsLabel: '出場',
          values: ParticipationKind.values,
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
            values: Position.values,
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
            onChanged: (v) => setState(() => _skip = v),
            limitNote: '残りは $remaining 試合です。',
          ),
          Text('第 ${season.playedCount + _skip} 戦まで進みます。', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
          const SizedBox(height: Space.s300),
        ],
        PressButton(
          label: _kind == ParticipationKind.none ? '$_skip 試合を進める' : '試合を始める',
          kind: PressKind.primary,
          onPressed: () => widget.onDecided(
            _kind == ParticipationKind.none
                ? NextGameChoice.skip(_skip)
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

Future<NextGameChoice?> showParticipationSheet(
  BuildContext context,
  Player player, {
  ParticipationKind initialKind = ParticipationKind.starter,
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
            Semantics(header: true, child: Text('第 ${player.current.playedCount + 1} 戦', style: Txt.heading)),
            const SizedBox(height: Space.s300),
            ParticipationForm(player: player, initialKind: initialKind, onDecided: (c) => Navigator.pop(context, c)),
          ],
        ),
      ),
    ),
  );
}

/// 出場を決めた後の共通処理。欠場なら進め、出場なら入力を始める。入力を始めたら true。
bool applyChoice(AppStore store, NextGameChoice choice) {
  if (choice.participation == null) {
    store.skipGames(choice.skip);
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
