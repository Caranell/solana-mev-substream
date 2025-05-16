import { useState, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/layout/sidebar";
import { Dashboard } from "@/pages/dashboard";
import { SocketProvider } from "@/context/socket-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  console.log("app");
  return (
    <div>
      <ThemeProvider defaultTheme="light" storageKey="mev-dashboard-theme">
        <QueryClientProvider client={queryClient}>
          <SocketProvider>
            <div className="flex h-screen overflow-hidden bg-background">
              <Sidebar className="hidden md:flex w-64 flex-shrink-0" />
              <main className="flex-1 overflow-y-auto">
                <Dashboard />
              </main>
            </div>
            <Toaster />
          </SocketProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
