import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ScrollToTop } from './components/ScrollToTop';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineDetector } from './components/OfflineDetector';
import { ToastContainer } from './components/ui/Toast';
import { QRScanner } from './components/scanner/QRScanner';
import { DocumentScanner } from './components/scanner/DocumentScanner';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(module => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(module => ({ default: module.ContactPage })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Analyze = lazy(() => import('./pages/Analyze').then(module => ({ default: module.Analyze })));
const Batch = lazy(() => import('./pages/Batch').then(module => ({ default: module.Batch })));
const History = lazy(() => import('./pages/History').then(module => ({ default: module.History })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const Help = lazy(() => import('./pages/Help').then(module => ({ default: module.Help })));
const EmailScan = lazy(() => import('./pages/EmailScan'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <OfflineDetector />
        <ToastContainer />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ================= PUBLIC ROUTES ================= */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* ================= PROTECTED ROUTES ================= */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />

              <Route path="dashboard" element={<Dashboard />} />
              <Route path="analyze" element={<Analyze />} />
              <Route path="batch" element={<Batch />} />
              <Route path="history" element={<History />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<Help />} />

              {/* Scanner Pages */}
              <Route path="email-scan" element={<EmailScan />} />
              <Route path="qr-scanner" element={<QRScanner />} />
              <Route path="document-scanner" element={<DocumentScanner />} />
            </Route>

            {/* ================= 404 ================= */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
