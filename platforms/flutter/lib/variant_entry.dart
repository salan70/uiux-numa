import 'package:flutter/widgets.dart';

class VariantEntry {
  const VariantEntry(this.experiment, this.variant, this.build, {this.panel});

  final String experiment;
  final String variant;
  final Widget Function() build;

  /// 端末の枠の外に置く操作盤。確かめるための操作（画面の移動など）を、端末の中の UI に重ねずに置く。
  final Widget Function()? panel;

  String get id => '$experiment/$variant';
}
