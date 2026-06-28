import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PageLoader from './components/common/PageLoader';
import ErrorBoundary from './components/common/ErrorBoundary';

// ── Eager load: auth route (perlu cepat, tidak di-lazy) ──────────────────────
import LoginPage from './pages/LoginPage';
import NotFound  from './pages/NotFound';

// ── Lazy load: semua page di dalam protected layout ───────────────────────────
const Dashboard              = lazy(() => import('./pages/Dashboard'));
const Operations             = lazy(() => import('./pages/Operations'));
const Equipment              = lazy(() => import('./pages/Equipment'));
const TacticalMap            = lazy(() => import('./pages/TacticalMap'));
const AIInsights             = lazy(() => import('./pages/AIInsights'));
const FuelIntelligence       = lazy(() => import('./pages/FuelIntelligence'));
const SafetyCenter           = lazy(() => import('./pages/SafetyCenter'));
const Analytics              = lazy(() => import('./pages/Analytics'));
const Reports                = lazy(() => import('./pages/Reports'));
const Settings               = lazy(() => import('./pages/Settings'));
const ShiftHandover          = lazy(() => import('./pages/ShiftHandover'));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — tidak di-lazy karena perlu muncul instan */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes — semua page di-lazy untuk code splitting */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ErrorBoundary><Layout /></ErrorBoundary>}>
            <Route
              path="/"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="/shift-handover"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ShiftHandover />
                </Suspense>
              }
            />
            <Route
              path="/operations"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Operations />
                </Suspense>
              }
            />
            <Route
              path="/equipment"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Equipment />
                </Suspense>
              }
            />
            <Route
              path="/tactical-map"
              element={
                <Suspense fallback={<PageLoader />}>
                  <TacticalMap />
                </Suspense>
              }
            />
            <Route
              path="/ai-insights"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AIInsights />
                </Suspense>
              }
            />
            <Route
              path="/fuel-intelligence"
              element={
                <Suspense fallback={<PageLoader />}>
                  <FuelIntelligence />
                </Suspense>
              }
            />
            <Route
              path="/safety-center"
              element={
                <Suspense fallback={<PageLoader />}>
                  <SafetyCenter />
                </Suspense>
              }
            />
            <Route
              path="/analytics"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Analytics />
                </Suspense>
              }
            />
            <Route
              path="/reports"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Reports />
                </Suspense>
              }
            />
            <Route
              path="/settings"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Settings />
                </Suspense>
              }
            />
          </Route>
        </Route>

        {/* 404 — catch-all untuk URL yang tidak dikenali */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
