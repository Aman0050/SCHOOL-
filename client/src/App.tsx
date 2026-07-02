import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/authContext';
import { SocketProvider } from './contexts/SocketContext';
import { QueryProvider } from './providers/QueryProvider';
import ProtectedRoute from './routes/ProtectedRoutes';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import './lib/i18n';
import { TopBarLoader } from './components/ui/TopBarLoader';

// Lazy loaded feature views
const Login = React.lazy(() => import('./features/auth/Login'));
const Unauthorized = React.lazy(() => import('./features/auth/Unauthorized'));
import DashboardLayout from './components/shared/DashboardLayout';
const DashboardHome = React.lazy(() => import('./features/dashboard/DashboardHome'));
const AcademicManagement = React.lazy(() => import('./features/academics/AcademicManagement'));
const StudentManagement = React.lazy(() => import('./features/academics/StudentManagement'));
const AttendanceManagement = React.lazy(() => import('./features/academics/AttendanceManagement'));
const AuditLogsView = React.lazy(() => import('./features/dashboard/AuditLogsView'));
const ExaminationManagement = React.lazy(() => import('./features/examinations/ExaminationManagement').then(m => ({ default: m.ExaminationManagement })));
const FeeManagement = React.lazy(() => import('./features/fees/FeeManagement').then(m => ({ default: m.FeeManagement })));
const SchoolSettings = React.lazy(() => import('./features/settings/SchoolSettings'));
const SupportCenter = React.lazy(() => import('./features/support/SupportCenter'));



// Analytics Imports
const AttendanceIntelligence = React.lazy(() => import('./features/analytics/AttendanceIntelligence'));
const FeeIntelligence = React.lazy(() => import('./features/analytics/FeeIntelligence'));
const ExamIntelligence = React.lazy(() => import('./features/analytics/ExamIntelligence'));
const TeacherAnalytics = React.lazy(() => import('./features/analytics/TeacherAnalytics'));
const ParentEngagement = React.lazy(() => import('./features/analytics/ParentEngagement'));
const SuperAdminIntelligence = React.lazy(() => import('./features/analytics/SuperAdminIntelligence'));




// Platform & Commercial Imports
const RevenueDashboard = React.lazy(() => import('./features/platform/RevenueDashboard'));
const SalesCrmDashboard = React.lazy(() => import('./features/platform/SalesCrmDashboard'));
const CustomerSuccessDashboard = React.lazy(() => import('./features/platform/CustomerSuccessDashboard'));
const BillingDashboard = React.lazy(() => import('./features/billing/BillingDashboard'));
const SchoolSetupWizard = React.lazy(() => import('./features/onboarding/SchoolSetupWizard'));


// Super Admin Imports
const SuperAdminLayout = React.lazy(() => import('./features/super-admin/SuperAdminLayout'));
const SuperDashboard = React.lazy(() => import('./features/super-admin/SuperDashboard').then(m => ({ default: m.SuperDashboard })));
const SchoolsManager = React.lazy(() => import('./features/super-admin/SchoolsManager').then(m => ({ default: m.SchoolsManager })));
const SubscriptionBilling = React.lazy(() => import('./features/super-admin/SubscriptionBilling').then(m => ({ default: m.SubscriptionBilling })));
const SupportPortal = React.lazy(() => import('./features/super-admin/SupportPortal').then(m => ({ default: m.SupportPortal })));
const AuditLogs = React.lazy(() => import('./features/super-admin/AuditLogs').then(m => ({ default: m.AuditLogs })));
const DemoRequestsView = React.lazy(() => import('./features/super-admin/DemoRequestsView'));

// Marketing
import { LandingPage } from './features/marketing/LandingPage';
import EnterprisePage from './features/marketing/EnterprisePage';
import DocumentationPage from './features/marketing/DocumentationPage';
import HelpCenterPage from './features/marketing/HelpCenterPage';
import ApiReferencePage from './features/marketing/ApiReferencePage';
import BlogPage from './features/marketing/BlogPage';
import PrivacyPolicyPage from './features/marketing/PrivacyPolicyPage';
import TermsOfServicePage from './features/marketing/TermsOfServicePage';
import CookiePolicyPage from './features/marketing/CookiePolicyPage';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <SocketProvider>
            <BrowserRouter>
              <Toaster position="top-right" />
              {/* Root level fallback removed to prevent unmounting the App Shell on lazy route change */}
              <Routes>
                  {/* Public Marketing Route */}
                  <Route path="/" element={
                    <Suspense fallback={<TopBarLoader />}>
                      <LandingPage />
                    </Suspense>
                  } />
                  <Route path="/enterprise" element={<Suspense fallback={<TopBarLoader />}><EnterprisePage /></Suspense>} />
                  <Route path="/security" element={<Suspense fallback={<TopBarLoader />}><DocumentationPage /></Suspense>} />
                  <Route path="/documentation" element={<Suspense fallback={<TopBarLoader />}><DocumentationPage /></Suspense>} />
                  <Route path="/help-center" element={<Suspense fallback={<TopBarLoader />}><HelpCenterPage /></Suspense>} />
                  <Route path="/api-reference" element={<Suspense fallback={<TopBarLoader />}><ApiReferencePage /></Suspense>} />
                  <Route path="/blog" element={<Suspense fallback={<TopBarLoader />}><BlogPage /></Suspense>} />
                  <Route path="/privacy" element={<Suspense fallback={<TopBarLoader />}><PrivacyPolicyPage /></Suspense>} />
                  <Route path="/terms" element={<Suspense fallback={<TopBarLoader />}><TermsOfServicePage /></Suspense>} />
                  <Route path="/cookies" element={<Suspense fallback={<TopBarLoader />}><CookiePolicyPage /></Suspense>} />

                  {/* Public Entry Routes */}
                  <Route path="/login" element={<Suspense fallback={<TopBarLoader />}><Login /></Suspense>} />
                  <Route path="/unauthorized" element={<Suspense fallback={<TopBarLoader />}><Unauthorized /></Suspense>} />

                  {/* Core Protected App Layout (Checks Tenant Resolution & Auth) */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                      {/* Available to all authenticated Tenant users */}
                      <Route path="/dashboard" element={<Suspense fallback={<TopBarLoader />}><DashboardHome /></Suspense>} />
                      
                      <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER', 'PRINCIPAL']} />}>
                        <Route path="/dashboard/academics" element={<Suspense fallback={<TopBarLoader />}><AcademicManagement /></Suspense>} />
                        <Route path="/dashboard/students" element={<Suspense fallback={<TopBarLoader />}><StudentManagement /></Suspense>} />
                        <Route path="/dashboard/attendance" element={<Suspense fallback={<TopBarLoader />}><AttendanceManagement /></Suspense>} />
                        <Route path="/dashboard/examinations" element={<Suspense fallback={<TopBarLoader />}><ExaminationManagement /></Suspense>} />
                      </Route>
                      
                      <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'PRINCIPAL']} />}>
                        <Route path="/dashboard/fees" element={<Suspense fallback={<TopBarLoader />}><FeeManagement /></Suspense>} />
                        <Route path="/dashboard/settings" element={<Suspense fallback={<TopBarLoader />}><SchoolSettings /></Suspense>} />
                      </Route>
                      
                      {/* Available to all tenant users */}
                      <Route path="/dashboard/support" element={<Suspense fallback={<TopBarLoader />}><SupportCenter /></Suspense>} />
                      

                      {/* Intelligence & Analytics */}
                      <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'PRINCIPAL']} />}>
                        <Route path="/dashboard/analytics/attendance" element={<Suspense fallback={<TopBarLoader />}><AttendanceIntelligence /></Suspense>} />
                        <Route path="/dashboard/analytics/fees" element={<Suspense fallback={<TopBarLoader />}><FeeIntelligence /></Suspense>} />
                        <Route path="/dashboard/analytics/exams" element={<Suspense fallback={<TopBarLoader />}><ExamIntelligence /></Suspense>} />
                        <Route path="/dashboard/analytics/teacher" element={<Suspense fallback={<TopBarLoader />}><TeacherAnalytics /></Suspense>} />
                        <Route path="/dashboard/analytics/parents" element={<Suspense fallback={<TopBarLoader />}><ParentEngagement /></Suspense>} />

                        {/* Platform & Billing Layer */}
                        <Route path="/dashboard/platform/revenue" element={<Suspense fallback={<TopBarLoader />}><RevenueDashboard /></Suspense>} />
                        <Route path="/dashboard/platform/sales" element={<Suspense fallback={<TopBarLoader />}><SalesCrmDashboard /></Suspense>} />
                        <Route path="/dashboard/platform/success" element={<Suspense fallback={<TopBarLoader />}><CustomerSuccessDashboard /></Suspense>} />
                        <Route path="/dashboard/billing" element={<Suspense fallback={<TopBarLoader />}><BillingDashboard /></Suspense>} />
                      </Route>
                    </Route>

                    {/* Self-Serve Onboarding */}
                    <Route path="/onboarding" element={<Suspense fallback={<TopBarLoader />}><SchoolSetupWizard /></Suspense>} />

                    {/* Super Admin / Platform Owner Layout */}
                    <Route path="/superadmin" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                      <Route element={<Suspense fallback={<TopBarLoader />}><SuperAdminLayout /></Suspense>}>
                        <Route path="dashboard" element={<Suspense fallback={<TopBarLoader />}><SuperDashboard /></Suspense>} />
                        <Route path="schools" element={<Suspense fallback={<TopBarLoader />}><SchoolsManager /></Suspense>} />
                        <Route path="billing" element={<Suspense fallback={<TopBarLoader />}><SubscriptionBilling /></Suspense>} />
                        <Route path="subscriptions" element={<div>Subscriptions Management</div>} />
                        <Route path="settings" element={<div>System Settings</div>} />
                        <Route path="intelligence" element={<Suspense fallback={<TopBarLoader />}><SuperAdminIntelligence /></Suspense>} />
                        <Route path="support" element={<Suspense fallback={<TopBarLoader />}><SupportPortal /></Suspense>} />
                        <Route path="audit" element={<Suspense fallback={<TopBarLoader />}><AuditLogs /></Suspense>} />
                        <Route path="demo-requests" element={<Suspense fallback={<TopBarLoader />}><DemoRequestsView /></Suspense>} />
                      </Route>
                    </Route>
                  </Route>

                  {/* Fallbacks */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
          </SocketProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
};

export default App;
