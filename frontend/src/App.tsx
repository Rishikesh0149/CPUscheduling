import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import { DashboardPage } from './pages/DashboardPage';
import { ProcessManagementPage } from './pages/ProcessManagementPage';
import { SimulationPage } from './pages/SimulationPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { PagingSimulationPage } from './pages/PagingSimulationPage';
import { AIVerificationPage } from './pages/AIVerificationPage';
import { AboutPage } from './pages/AboutPage';

export const App: React.FC = () => {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Header />
          <main className="page-container">
            <Routes>
              <Route path="/" element={<DashboardPage onNotify={addToast} />} />
              <Route path="/processes" element={<ProcessManagementPage onNotify={addToast} />} />
              <Route path="/simulation" element={<SimulationPage onNotify={addToast} />} />
              <Route path="/compare" element={<ComparisonPage onNotify={addToast} />} />
              <Route path="/paging" element={<PagingSimulationPage onNotify={addToast} />} />
              <Route path="/ai-agent" element={<AIVerificationPage onNotify={addToast} />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </Router>
  );
};

export default App;
