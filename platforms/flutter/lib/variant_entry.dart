import 'package:flutter/widgets.dart';

class VariantEntry {
  const VariantEntry(this.experiment, this.variant, this.build);

  final String experiment;
  final String variant;
  final Widget Function() build;

  String get id => '$experiment/$variant';
}
