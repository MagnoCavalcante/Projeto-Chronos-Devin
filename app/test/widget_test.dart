// Teste de smoke básico do CHRONOS.
//
// Garante que o widget raiz da aplicação (ChronosApp) é construído
// sem lançar exceções durante a inicialização, com o Service Locator
// e o BuildConfig previamente configurados para o ambiente de testes.

import 'package:flutter_test/flutter_test.dart';

import 'package:chronos/core/config/build_config.dart';
import 'package:chronos/core/config/environment.dart';
import 'package:chronos/core/di/service_locator.dart';
import 'package:chronos/main.dart';

void main() {
  setUpAll(() {
    BuildConfig.initialize(
      env: Environment.development,
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'test-anon-key',
    );
    setupServiceLocator();
  });

  tearDownAll(() {
    ServiceLocator.instance.reset();
  });

  testWidgets('ChronosApp builds without throwing', (WidgetTester tester) async {
    await tester.pumpWidget(const ChronosApp());
    await tester.pump();

    expect(tester.takeException(), isNull);
  });
}
