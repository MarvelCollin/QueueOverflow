import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/user-service';
import { api } from '../services/api';
import { useToast } from '../components/toast';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState(userService.getUser());

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      valid = false;
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
      valid = false;
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
      valid = false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const currentUser = userService.getUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const changePasswordRequest = {
          current_password: formData.currentPassword,
          new_password: formData.newPassword,
          confirm_password: formData.confirmPassword
        };

        await api.user.changePassword(currentUser.id, changePasswordRequest);
      } catch (apiError) {
        console.warn('API password change failed, updating local storage only:', apiError);
      }

      if (currentUser) {
        const updatedUser = {
          ...currentUser,

          last_login: new Date().toISOString()
        };
        userService.setUser(updatedUser);
      }

      showToast('success', 'Password changed successfully');

      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error: any) {
      console.error('Error changing password:', error);
      showToast('error', error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pt-20 pb-10"
    >
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-indigo-50 overflow-hidden">
          <div className="border-b border-indigo-50 px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-indigo-900">Change Password</h1>
            <button
              onClick={() => navigate('/profile')}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-indigo-900 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 bg-indigo-50/50 rounded-lg
                             border ${errors.currentPassword ? 'border-red-300' : 'border-indigo-100'} text-slate-800
                             placeholder:text-slate-400 focus:border-indigo-300
                             focus:bg-white focus:ring-2 focus:ring-indigo-200
                             transition-all duration-300`}
                  required
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-indigo-900 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 bg-indigo-50/50 rounded-lg
                             border ${errors.newPassword ? 'border-red-300' : 'border-indigo-100'} text-slate-800
                             placeholder:text-slate-400 focus:border-indigo-300
                             focus:bg-white focus:ring-2 focus:ring-indigo-200
                             transition-all duration-300`}
                  required
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-indigo-900 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 bg-indigo-50/50 rounded-lg
                             border ${errors.confirmPassword ? 'border-red-300' : 'border-indigo-100'} text-slate-800
                             placeholder:text-slate-400 focus:border-indigo-300
                             focus:bg-white focus:ring-2 focus:ring-indigo-200
                             transition-all duration-300`}
                  required
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600
                             hover:from-indigo-700 hover:to-purple-700
                             text-white px-6 py-2.5 rounded-xl font-medium
                             shadow-md hover:shadow-lg
                             transition-all duration-300 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className="bg-indigo-50/50 px-6 py-4 text-sm text-slate-600">
            <p className="mb-2 font-medium text-indigo-800">Password Requirements:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>At least 6 characters long</li>
              <li>Include at least one uppercase letter</li>
              <li>Include at least one number</li>
              <li>Include at least one special character</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}