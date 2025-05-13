import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/layout/sidebar';
import { Dashboard } from '@/pages/dashboard';
import { SocketProvider } from '@/context/socket-context';
import { MOCK_TRANSACTIONS } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="mev-dashboard-theme">
      <SocketProvider initialTransactions={MOCK_TRANSACTIONS}>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar className="hidden md:flex w-64 flex-shrink-0" />
          <main className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Dashboard />
            )}
          </main>
        </div>
        <Toaster />
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;