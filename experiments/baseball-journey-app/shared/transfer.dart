import 'package:flutter/material.dart';

import 'creation.dart';
import 'model.dart';
import 'number_inputs.dart';
import 'store.dart';
import 'team_candidates.dart';
import 'theme.dart';
import 'widgets.dart';

// シーズン途中の移籍（mid_season_transfer.md、D-23）。
// 項目が多くシートに収まらないので全画面で開く。移籍は次の試合から効き、季を所属期間に分ける。
// 年俸と年間試合数は季の値のまま変えない（R-7-4）。

class TransferScreen extends StatefulWidget {
  const TransferScreen({super.key, required this.player});

  final Player player;

  @override
  State<TransferScreen> createState() => _TransferScreenState();
}

class _TransferScreenState extends State<TransferScreen> {
  late final Season _season = widget.player.current;

  /// 移籍した後にまだ試合が無いときは、その移籍を直す。
  late final bool _editing = StoreScope.read(context).canUndoTransfer;

  /// 移籍の前の所属。直すときは 1 つ前の所属期間、新しい移籍なら今の所属期間。
  late final Stint _from = _editing ? _season.stints[_season.stints.length - 2] : _season.stint;
  late final _team = TextEditingController(text: _editing ? _season.team.name : '');
  late final _league = TextEditingController(text: _editing ? _season.team.league : '');
  late final _country = TextEditingController(text: _editing ? _season.team.country : '');
  late int _teamCount = _season.team.teamCount;
  late int _rank = _editing ? _season.stint.startRank : 1;
  late String _uniform = _season.uniformNumber;
  bool _tried = false;

  @override
  void dispose() {
    _team.dispose();
    _league.dispose();
    _country.dispose();
    super.dispose();
  }

  bool get _sameTeam => _team.text.trim() == _from.team.name;

  List<String> _errors() => [
    if (_team.text.trim().isEmpty) '移籍先の球団名を入力してください。',
    if (_sameTeam) '今の球団です。',
    if (_league.text.trim().isEmpty) '移籍先のリーグ名を入力してください。',
    if (_country.text.trim().isEmpty) '移籍先の国名を入力してください。',
    ?UniformRule.either.check(_uniform),
  ];

  void _pick(Team t) => setState(() {
    _team.text = t.name;
    _league.text = t.league;
    _country.text = t.country;
    _teamCount = t.teamCount;
    _rank = _rank.clamp(1, _teamCount);
  });

  void _submit() {
    setState(() => _tried = true);
    if (_errors().isNotEmpty) return;
    final name = _team.text.trim();
    StoreScope.read(context).transfer(
      team: Team(
        name: name,
        abbreviation: name.characters.take(3).toString(),
        league: _league.text.trim(),
        country: _country.text.trim(),
        teamCount: _teamCount,
      ),
      uniformNumber: _uniform,
      startRank: _rank,
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    StoreScope.of(context);
    final errors = _tried ? _errors() : const <String>[];
    // 移籍の前の試合が最後。直すときも、移籍の後の最初の試合は次の試合になる。
    final from = _season.playedCount + 1;
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(tooltip: '閉じる', icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
        title: Text(_editing ? '移籍先を直す' : 'シーズン途中の移籍'),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Space.page, Space.s200, Space.page, Space.s1000),
        children: [
          if (errors.isNotEmpty) InputErrorSummary(errors: errors),
          Panel(
            child: Text(
              '第 $from 戦から、移籍先の試合として記録します。年俸と今季の試合数（${_season.totalGames} 試合）は変わりません。',
              style: Txt.body.copyWith(color: p.onSurface),
            ),
          ),
          FieldLabel('移籍先', note: '今: ${_from.team.name}'),
          TeamCandidates(
            selectedTeam: _team.text.trim(),
            selectedLeague: _league.text.trim(),
            exclude: _from.team.name,
            onTeam: (t) => _pick(t.team),
            onLeague: (l) => setState(() {
              _league.text = l.league;
              _country.text = l.country;
              _teamCount = l.teamCount;
              _rank = _rank.clamp(1, _teamCount);
            }),
          ),
          TextField(
            controller: _team,
            decoration: InputDecoration(
              hintText: '球団名',
              errorText: !_tried
                  ? null
                  : _team.text.trim().isEmpty
                  ? '移籍先の球団名を入力してください。'
                  : _sameTeam
                  ? '今の球団です。'
                  : null,
            ),
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: Space.s200),
          TextField(
            controller: _league,
            decoration: InputDecoration(
              hintText: 'リーグ名',
              errorText: _tried && _league.text.trim().isEmpty ? '移籍先のリーグ名を入力してください。' : null,
            ),
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: Space.s200),
          TextField(
            controller: _country,
            decoration: InputDecoration(
              hintText: '国名',
              errorText: _tried && _country.text.trim().isEmpty ? '移籍先の国名を入力してください。' : null,
            ),
            onChanged: (_) => setState(() {}),
          ),
          // MLB の全球団数を上限にする。
          NumberStepper(
            label: 'リーグの球団数',
            value: _teamCount,
            min: 2,
            max: 30,
            unit: ' 球団',
            onChanged: (v) => setState(() {
              _teamCount = v;
              _rank = _rank.clamp(1, v);
            }),
          ),
          FieldLabel('移籍先での順位', note: '第 $from 戦の前の順位'),
          NumberStepper(
            label: 'チーム順位',
            value: _rank,
            min: 1,
            max: _teamCount,
            unit: ' 位',
            onChanged: (v) => setState(() => _rank = v),
          ),
          FieldLabel('背番号', note: '今: ${_from.uniformNumber}'),
          UniformNumberField(value: _uniform, rule: UniformRule.either, onChanged: (v) => setState(() => _uniform = v)),
        ],
      ),
      bottomNavigationBar: _Bar(
        child: PressButton(label: _editing ? '直す' : '移籍する', kind: PressKind.primary, onPressed: _submit),
      ),
    );
  }
}

class _Bar extends StatelessWidget {
  const _Bar({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Container(
      decoration: BoxDecoration(
        color: p.background,
        border: Border(top: BorderSide(color: p.ink, width: Borders.thick)),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(Space.page, Space.s300, Space.page, Space.s200),
          child: child,
        ),
      ),
    );
  }
}

/// 移籍した後にまだ試合が無いときの「途中の移籍を取り消す」。確認してから前の球団に戻す。
Future<void> confirmUndoTransfer(BuildContext context) async {
  final store = StoreScope.read(context);
  final season = store.current!.current;
  final back = season.stints[season.stints.length - 2].team.name;
  final ok = await confirmDialog(
    context,
    title: '途中の移籍を取り消しますか？',
    message: '${season.team.name}への移籍を取り消し、$backの所属に戻します。',
    confirm: '取り消す',
    cancel: 'やめる',
    destructive: true,
  );
  if (ok) store.undoTransfer();
}
