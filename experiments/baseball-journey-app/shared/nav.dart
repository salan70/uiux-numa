import 'package:flutter/material.dart';

import 'creation.dart';
import 'directory.dart';
import 'model.dart';
import 'player_detail.dart';
import 'season_end.dart';
import 'settings.dart';
import 'store.dart';
import 'year_page.dart';

// 3 案が同じ行き先へ移る処理。どこから開いても、閉じると元の画面へ戻る。

Future<void> openDetail(BuildContext context, Player player, {VoidCallback? onPlay}) {
  return Navigator.of(context).push(
    MaterialPageRoute<void>(
      builder: (_) => PlayerDetailScreen(player: player, onPlay: onPlay),
    ),
  );
}

Future<void> openCreation(BuildContext context) {
  final navigator = Navigator.of(context);
  return navigator.push(
    MaterialPageRoute<void>(
      fullscreenDialog: true,
      builder: (_) => PlayerCreationScreen(onCreated: (_) => navigator.popUntil((r) => r.isFirst)),
    ),
  );
}

/// シーズンを終える。引退したら true を返す。
Future<bool> openSeasonEnd(BuildContext context, Player player) async {
  final navigator = Navigator.of(context);
  var retired = false;
  await navigator.push(
    MaterialPageRoute<void>(
      fullscreenDialog: true,
      builder: (_) => SeasonEndScreen(
        player: player,
        onFinished: (r) {
          retired = r;
          navigator.popUntil((route) => route.isFirst);
        },
      ),
    ),
  );
  return retired;
}

Future<void> openSettings(BuildContext context) =>
    Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => const SettingsScreen()));

/// 試合の一覧。openEditor を渡すと、行を押して試合を直せる。
Future<void> openHistory(BuildContext context, Player player, {VoidCallback? openEditor}) => Navigator.of(
  context,
).push(MaterialPageRoute<void>(builder: (_) => GameHistoryScreen(player: player, openEditor: openEditor)));

/// 起動引数の route のうち、3 案で同じ行き先のもの。行き先を開いたら true。
bool openSharedRoute(BuildContext context, AppStore store) {
  final player = store.current;
  switch (store.options.route) {
    case 'create':
      openCreation(context);
    case 'seasonEnd' when player != null:
      openSeasonEnd(context, player);
    case 'nextSeason' when player != null:
      Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => NextSeasonScreen(player: player, onClose: () {})));
    case 'farewell' when player != null:
      Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => RetiredScreen(player: player, onClose: () {})));
    case 'settings':
      openSettings(context);
    case 'year' when player != null:
      // 前の年（新人なら今年）の 1 ページ。
      final seasons = player.seasons;
      final season = seasons.length > 1 ? seasons[seasons.length - 2] : seasons.last;
      Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => YearPageScreen(player: player, season: season)));
    case 'history' when player != null:
      openHistory(context, player);
    case 'retired':
      final retired = store.players.where((p) => !p.isActive).firstOrNull;
      if (retired != null) openDetail(context, retired);
    default:
      return false;
  }
  return true;
}
