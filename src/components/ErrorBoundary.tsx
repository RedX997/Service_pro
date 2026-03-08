import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { LocalStorage } from '@/lib/storage';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Auto-clear localStorage if we're in API mode and there's an error
    const useApi = import.meta.env.VITE_USE_API === 'true';
    if (useApi) {
      console.log('🧹 Auto-clearing localStorage due to error in API mode...');
      LocalStorage.clearAppData();
    }
  }

  handleReset = () => {
    // Clear all localStorage data
    LocalStorage.clearAppData();
    
    // Reset the error state
    this.setState({ hasError: false, error: undefined });
    
    // Reload the page to start fresh
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                The application encountered an error. This might be due to corrupted data in your browser's storage.
              </p>
              
              {this.state.error?.message.includes('JSON') && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground">
                    <strong>Technical details:</strong> Invalid JSON data detected. This usually happens when browser storage gets corrupted.
                  </p>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleReset} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Application Data
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()} 
                  className="w-full"
                >
                  Reload Page
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Resetting will clear all stored data and return the app to its initial state.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}