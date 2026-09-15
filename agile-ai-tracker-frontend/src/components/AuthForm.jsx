import { useState } from 'react';
import { FolderKanban } from 'lucide-react';
import { Input, Select, Button } from '../components/ui';

export default function AuthForm({ mode, loading, onSubmit, onSwitchMode }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MEMBER'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-[#FAFBFC] p-4">
      <div className="bg-white border border-[#DFE1E6] rounded-[3px] w-full max-w-sm p-6 space-y-5">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-10 h-10 rounded-[3px] bg-[#0052CC] flex items-center justify-center">
            <FolderKanban className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-[#172B4D]">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h1>
          <p className="text-xs text-[#626F86]">
            {mode === 'login'
              ? 'Enter your credentials to access FJra.'
              : 'Register to start managing projects.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <Input
              label="Full name"
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Nguyen Van A"
            />
          )}

          <Input
            label="Email"
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="you@company.com"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
          />

          {mode === 'register' && (
            <Select label="Role" name="role" value={formData.role} onChange={handleChange}>
              <option value="MEMBER">Member</option>
              <option value="PM">Project Manager</option>
              <option value="ADMIN">Administrator</option>
            </Select>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={loading}>
            {loading ? 'Processing...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <div className="pt-3 border-t border-[#DFE1E6] flex items-center justify-between text-xs">
          <span className="text-[#626F86]">
            {mode === 'login' ? 'No account?' : 'Already have an account?'}
          </span>
          <button
            type="button"
            onClick={onSwitchMode}
            className="text-[#0052CC] font-medium hover:underline cursor-pointer"
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
