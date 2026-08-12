import { useState } from 'react';
import axios from 'axios';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' hoặc 'register'
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleAuthSubmit = async (formData) => {
    setLoading(true);
    const endpoint = mode === 'register' ? `${API_BASE}/auth/register` : `${API_BASE}/auth/login`;

    try {
      const res = await axios.post(endpoint, formData);
      const { user, token } = res.data.data || res.data;

      if (mode === 'register') {
        alert('Đăng ký thành công! Hãy đăng nhập bằng tài khoản mới.');
        setMode('login');
      } else {
        login(user, token);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      mode={mode}
      loading={loading}
      onSubmit={handleAuthSubmit}
      onSwitchMode={() => setMode(mode === 'login' ? 'register' : 'login')}
    />
  );
}