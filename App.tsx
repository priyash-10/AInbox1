import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Inbox from "./pages/Inbox";
import Settings from "./pages/Settings";
import EmailSummaryPage from "./pages/EmailSummaryPage";
import DraftsPage from "./pages/DraftsPage";
import Sent from "./pages/Sent";
import SentEmailPage from "./pages/SentEmailPage";
import Calendar from "./pages/Calendar";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/inbox/:emailId" element={<EmailSummaryPage />} />
            <Route path="/sent" element={<Sent />} />
            <Route path="/sent/:emailId" element={<SentEmailPage />} />
            <Route path="/drafts" element={<DraftsPage />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
