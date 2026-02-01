import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminDocuments from './pages/Admin/Documents';
import DebugPage from './pages/DebugPage';
import DocumentGenerator from './pages/DocumentGenerator';
import MainLayout from './components/MainLayout';
import React, { useEffect } from 'react';

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/debug" element={<DebugPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes with MainLayout */}
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/chat/:id?" element={<Chat />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/documents" element={<AdminDocuments />} />
                <Route path="/documents/create" element={<DocumentGenerator />} />
              </Route>
            </Routes>
          </Router>
          <ToastContainer position="top-right" autoClose={3000} />
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
