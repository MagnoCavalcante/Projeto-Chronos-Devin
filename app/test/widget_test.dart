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

    // Avança o relógio simulado além do atraso de auto-navegação da SplashPage
    // (3s) para que o Timer interno seja disparado e finalizado dentro do teste.
    await tester.pump(const Duration(seconds: 4));

    expect(tester.takeException(), isNull);
  });
}
