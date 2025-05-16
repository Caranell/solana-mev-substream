import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Dashboard } from "@/pages/dashboard";
import { SocketProvider } from "@/context/socket-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="mev-dashboard-theme">
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <div className="flex flex-col h-screen bg-background w-screen">
            <Header />
            <main className="flex-1 overflow-y-auto w-full pl-20 pr-20 p-4">
              <Dashboard />
            </main>
          </div>
          <Toaster />
        </SocketProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
