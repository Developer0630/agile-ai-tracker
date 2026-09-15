import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import MainApp from './pages/MainApp';
import { ArrowLeft } from 'lucide-react';

const THEME_STORAGE_KEY = 'fjra-theme';
const DENSITY_STORAGE_KEY = 'fjra-density';

const getStoredTheme = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system' ? savedTheme : 'system';
};

const getStoredDensity = () => {
  const savedDensity = localStorage.getItem(DENSITY_STORAGE_KEY);
  return savedDensity === 'comfortable' || savedDensity === 'standard' || savedDensity === 'compact' ? savedDensity : 'standard';
};

function AppRouter() {
  const { isAuthenticated } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [theme, setTheme] = useState(getStoredTheme);
  const [density, setDensity] = useState(getStoredDensity);

  useEffect(() => {
    const root = document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const resolvedTheme = theme === 'system' ? systemTheme : theme;

    root.dataset.theme = resolvedTheme;
    root.dataset.density = density;
    root.style.colorScheme = resolvedTheme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    localStorage.setItem(DENSITY_STORAGE_KEY, density);
  }, [theme, density]);

  useEffect(() => {
    if (theme !== 'system') return undefined;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      const resolvedTheme = mediaQuery.matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = resolvedTheme;
      document.documentElement.style.colorScheme = resolvedTheme;
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  if (!selectedProjectId) {
    return <DashboardPage onSelectProject={(id) => setSelectedProjectId(id)} />;
  }

  return (
    <div className="fjra-app-legacy-frame">
      

      <MainApp
        projectId={selectedProjectId}
        onBackToDashboard={() => setSelectedProjectId(null)}
        theme={theme}
        setTheme={setTheme}
        density={density}
        setDensity={setDensity}
      />
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