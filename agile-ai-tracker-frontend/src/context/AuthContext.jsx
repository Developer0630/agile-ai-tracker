import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 403 && error.response?.data?.message?.includes('tạm khóa')) {
          alert(error.response.data.message);
          localStorage.removeItem('token');
          window.location.reload();
        }
        return Promise.reject(error);
      }
    );
    axios.post('http://localhost:5000/api/system-settings/heartbeat', {}, {
    headers: { Authorization: `Bearer ${token}` }
  }).catch(() => {});

  // Cứ mỗi 60 giây gửi ping 1 lần
  const interval = setInterval(() => {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      axios.post('http://localhost:5000/api/system-settings/heartbeat', {}, {
        headers: { Authorization: `Bearer ${currentToken}` }
      }).catch(() => {});
    }
  }, 60 * 1000);
  return () => clearInterval(interval);
  }, [token, user]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const logout = () => {
    setUser(null);
    setToken('');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);