
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(
    () => localStorage.getItem('token') || ''
  );

  // 1. Quản lý thông tin đăng nhập
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
  }, [token, user]);

  // 2. Xử lý lỗi xác thực từ API
  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response?.status === 403 &&
          error.response?.data?.message?.includes('tạm khóa')
        ) {
          alert(error.response.data.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.reload();
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, []);

  // 3. Heartbeat: gửi tín hiệu duy trì phiên đăng nhập
  useEffect(() => {
    if (!token) return;

    const sendHeartbeat = () => {
      axios.post(
        `${API_BASE}/system-settings/heartbeat`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      ).catch((error) => {
        console.warn('Heartbeat failed:', error.message);
      });
    };

    sendHeartbeat();

    const interval = setInterval(sendHeartbeat, 60 * 1000);

    return () => clearInterval(interval);
  }, [token]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const logout = () => {
    setUser(null);
    setToken('');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
