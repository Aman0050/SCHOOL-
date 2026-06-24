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
const DataHealthDashboard = React.lazy(() => import('./features/super-admin/DataHealthDashboard').then(m => ({ default: m.DataHealthDashboard })));
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
                      <Route path="/dashboard" element={<DashboardHome />} />
                      
                      {/* Available to School Admin & Teachers (Legacy fallback) */}
                      <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN']} />}>
                        <Route path="/dashboard/academics" element={<AcademicManagement />} />
                        <Route path="/dashboard/students" element={<StudentManagement />} />
                        <Route path="/dashboard/attendance" element={<AttendanceManagement />} />
                        <Route path="/dashboard/examinations" element={<ExaminationManagement />} />
                        <Route path="/dashboard/fees" element={<FeeManagement />} />
                      </Route>
                      

                      {/* Intelligence & Analytics */}
                      <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'PRINCIPAL']} />}>
                        <Route path="/dashboard/analytics/attendance" element={<AttendanceIntelligence />} />
                        <Route path="/dashboard/analytics/fees" element={<FeeIntelligence />} />
                        <Route path="/dashboard/analytics/exams" element={<ExamIntelligence />} />
                        <Route path="/dashboard/analytics/teacher" element={<TeacherAnalytics />} />
                        <Route path="/dashboard/analytics/parents" element={<ParentEngagement />} />

                        {/* Platform & Billing Layer */}
                        <Route path="/dashboard/platform/revenue" element={<RevenueDashboard />} />
                        <Route path="/dashboard/platform/sales" element={<SalesCrmDashboard />} />
                        <Route path="/dashboard/platform/success" element={<CustomerSuccessDashboard />} />
                        <Route path="/dashboard/billing" element={<BillingDashboard />} />
                      </Route>
                    </Route>

                    {/* Self-Serve Onboarding */}
                    <Route path="/onboarding" element={<Suspense fallback={<TopBarLoader />}><SchoolSetupWizard /></Suspense>} />

                    {/* Super Admin / Platform Owner Layout */}
                    <Route path="/superadmin" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                      <Route element={<SuperAdminLayout />}>
                        <Route path="dashboard" element={<SuperDashboard />} />
                        <Route path="schools" element={<SchoolsManager />} />
                        <Route path="billing" element={<SubscriptionBilling />} />
                        <Route path="subscriptions" element={<div>Subscriptions Management</div>} />
                        <Route path="settings" element={<div>System Settings</div>} />
                        <Route path="intelligence" element={<SuperAdminIntelligence />} />
                        <Route path="support" element={<SupportPortal />} />
                        <Route path="audit" element={<AuditLogs />} />
                        <Route path="demo-requests" element={<DemoRequestsView />} />
                        <Route path="data-health" element={<DataHealthDashboard />} />
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
