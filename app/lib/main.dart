import 'package:flutter/material.dart';
import 'core/config/environment.dart';
import 'core/config/build_config.dart';
import 'core/config/supabase_config.dart';
import 'core/di/service_locator.dart';
import 'core/navigation/app_router.dart';
import 'core/navigation/navigation_service.dart';
import 'core/theme/theme.dart';
import 'presentation/pages/onboarding/splash_page.dart';
import 'shared/services/auth_service.dart';

void main() async {
  // Garante que o binding do Flutter esteja inicializado antes da execução de tarefas assíncronas.
  WidgetsFlutterBinding.ensureInitialized();

  // Inicializa a configuração dinâmica do CHRONOS com base nas variáveis de ambiente.
  BuildConfig.initialize(
    env: const bool.fromEnvironment('dart.vm.product') ? Environment.production : Environment.development,
    supabaseUrl: const String.fromEnvironment(
      'SUPABASE_URL',
      defaultValue: 'https://nmoyrkhozsomnbqepfvs.supabase.co',
    ),
    supabaseAnonKey: const String.fromEnvironment(
      'SUPABASE_ANON_KEY',
      defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tb3lya2hvenNvbW5icWVwZnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyODU5NDUsImV4cCI6MjA5OTg2MTk0NX0.WycYAClfwx1ouhzS6gNA3hh4AOmuZvnY5dKpC4VFPFM',
    ),
    checkoutUrl: const String.fromEnvironment(
      'CHECKOUT_URL',
      defaultValue: 'https://checkout.chronos-app.internal',
    ),
  );

  // Inicializa a conexão com o Supabase de forma segura.
  await SupabaseConfig.initialize();

  // Inicializa o serviço de autenticação e perfil premium.
  await AuthService.instance.initialize();

  // Inicializa o Service Locator e registra todas as dependências da aplicação.
  setupServiceLocator();

  runApp(const ChronosApp());
}

class ChronosApp extends StatelessWidget {
  const ChronosApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CHRONOS',
      theme: ChronosTheme.darkTheme,
      navigatorKey: locate<NavigationService>().navigatorKey,
      home: const SplashPage(),
      routes: AppRouter.routes,
      onGenerateRoute: AppRouter.onGenerateRoute,
      debugShowCheckedModeBanner: false,
    );
  }
}
