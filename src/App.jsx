import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import FormBuilder from './pages/FormBuilder';
import ApplicationForm from './pages/ApplicationForm';
import Success from './pages/Success';

import FormManagement from './pages/FormManagement';
import PrintPoster from './pages/PrintPoster';
import { useStore } from './store/useStore';

function App() {
  const checkUser = useStore(state => state.checkUser);

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* User Facing Routes */}
        <Route path="/form/:formId" element={<ApplicationForm />} />
        <Route path="/form/:formId/success" element={<Success />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/builder/:formId?" element={<FormBuilder />} />
        <Route path="/admin/manage/:formId" element={<FormManagement />} />
        <Route path="/admin/print/:formId" element={<PrintPoster />} />

        
        {/* Default route redirecting to admin login for now */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
