import 'package:flutter/material.dart';

import '../variants/atbat/index.dart' as atbat;
import '../variants/collection/index.dart' as collection;
import '../variants/scoreboard/index.dart' as scoreboard;
import 'app.dart';

// 端末の枠の外に操作盤を置けない配布先（claude.ai の Artifact をスマホで開くなど）で、案を替えられるようにする。
// 案ごとの殻（QuizApp）を作り直すので、画面の積み重ねは捨ててホームから開く。

final _apps = <String, Widget Function()>{'scoreboard': scoreboard.buildApp, 'atbat': atbat.buildApp, 'collection': collection.buildApp};

/// 選んだ案の殻を描く。variantRequest が変わると、その案に替える。
class VariantHost extends StatefulWidget {
  const VariantHost({required this.initial, super.key});

  final String initial;

  @override
  State<VariantHost> createState() => _VariantHostState();
}

class _VariantHostState extends State<VariantHost> {
  late String _id = widget.initial;

  @override
  void initState() {
    super.initState();
    variantRequest.addListener(_switch);
  }

  @override
  void dispose() {
    variantRequest.removeListener(_switch);
    super.dispose();
  }

  void _switch() {
    final id = variantRequest.value;
    if (id == null || !_apps.containsKey(id)) return;
    setState(() => _id = id);
    variantRequest.value = null;
  }

  @override
  Widget build(BuildContext context) => KeyedSubtree(key: ValueKey(_id), child: _apps[_id]!());
}
