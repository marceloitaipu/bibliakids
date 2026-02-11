import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import PrimaryButton from './PrimaryButton';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary para capturar erros em componentes filhos.
 * Exibe uma interface amigável em vez de crash.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log do erro para analytics/debugging
    console.error('ErrorBoundary caught error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Aqui você pode enviar para um serviço de monitoramento
    // Ex: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      const {
        fallbackTitle = 'Ops! Algo deu errado',
        fallbackMessage = 'Não se preocupe, você pode tentar novamente!',
        onGoBack,
      } = this.props;

      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>😅</Text>
          <Text style={styles.title}>{fallbackTitle}</Text>
          <Text style={styles.message}>{fallbackMessage}</Text>
          
          <View style={styles.buttons}>
            <PrimaryButton
              title="🔄 Tentar novamente"
              onPress={this.handleRetry}
            />
            {onGoBack && (
              <PrimaryButton
                title="🔙 Voltar"
                onPress={onGoBack}
                variant="accent"
              />
            )}
          </View>

          {__DEV__ && this.state.error && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText}>
                {this.state.error.message}
              </Text>
            </View>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: theme.colors.bg,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.muted,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  buttons: {
    gap: 12,
    width: '100%',
    maxWidth: 280,
  },
  debugContainer: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: theme.radius.md,
    maxWidth: '100%',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.bad,
    marginBottom: 4,
  },
  debugText: {
    fontSize: 11,
    color: theme.colors.bad,
    fontFamily: 'monospace',
  },
});
