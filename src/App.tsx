import { useState } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivySetup } from '@/components/PrivySetup';
import { DemoInterface } from '@/components/DemoInterface';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [appId, setAppId] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  // Show setup screen if no app ID is configured
  if (!appId && !showDemo) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PrivySetup 
            onAppIdSet={setAppId}
            onDemoMode={() => setShowDemo(true)}
          />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show demo mode if selected
  if (showDemo && !appId) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <DemoInterface onSetupWallet={() => setShowDemo(false)} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show full app with Privy integration
  return (
    <PrivyProvider
      appId={appId!}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#3b82f6',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets'
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
};

export default App;
