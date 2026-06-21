import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Operations from './pages/Operations';
import Equipment from './pages/Equipment';
import TacticalMap from './pages/TacticalMap';
import AIInsights from './pages/AIInsights';
import FuelIntelligence from './pages/FuelIntelligence';
import SafetyCenter from './pages/SafetyCenter';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ShiftHandover from './pages/ShiftHandover';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes — memerlukan autentikasi */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/shift-handover" element={<ShiftHandover />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/tactical-map" element={<TacticalMap />} />
            <Route path="/ai-insights" element={<AIInsights />} />
            <Route path="/fuel-intelligence" element={<FuelIntelligence />} />
            <Route path="/safety-center" element={<SafetyCenter />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
