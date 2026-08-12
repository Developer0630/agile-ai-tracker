import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import MainApp from './pages/MainApp';
import { ArrowLeft } from 'lucide-react';

function AppRouter() {
  const { isAuthenticated } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  if (!selectedProjectId) {
    return <DashboardPage onSelectProject={(id) => setSelectedProjectId(id)} />;
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Floating Button Quay lại Dashboard */}
      <button 
        onClick={() => setSelectedProjectId(null)}
        className="absolute top-2.5 right-4 z-50 bg-slate-900/90 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700/80 backdrop-blur-md shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Đổi dự án
      </button>
      <MainApp projectId={selectedProjectId} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}