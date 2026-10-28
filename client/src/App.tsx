import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';

import { Home } from './pages/Home';
import { Report } from './pages/Report';
import { Analysis } from './pages/Analysis';
import { Case } from './pages/Case';
import { Submitted } from './pages/Submitted';
import { Dashboard } from './pages/Dashboard';
import { GroundIntelligence } from './pages/GroundIntelligence';
import { Admin } from './pages/Admin';
import { About } from './pages/About';
import { Metrics } from './pages/Metrics';
import { CivicProfile } from './pages/CivicProfile';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 15,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Ground Intelligence full-screen view (matching enterprise reference layout) */}
          <Route path="/ground-intelligence" element={<GroundIntelligence />} />

          {/* Standalone Login / Signin routes (no navbar, no footer) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<Login />} />

          {/* Standard CivicLens shell routes */}
          <Route
            path="*"
            element={
              <AppShell>
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/report" element={<Report />} />
                    <Route path="/report/analysis" element={<Analysis />} />
                    <Route path="/case/:caseId" element={<Case />} />
                    <Route path="/submitted/:caseId" element={<Submitted />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/profile" element={<CivicProfile />} />
                    <Route path="/civic-profile" element={<CivicProfile />} />
                    <Route path="/metrics" element={<Navigate to="/about" replace />} />
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ErrorBoundary>
              </AppShell>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
