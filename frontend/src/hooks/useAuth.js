import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setLoading, setError, loginSuccess, registerSuccess, logout } from '../store/authSlice';
import { authService } from '../services/authService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, loading, error } = useSelector((state) => state.auth);

  const login = async (email, password) => {
    dispatch(setLoading(true));
    try {
      console.log('useAuth: Calling authService.login');
      const response = await authService.login(email, password);
      console.log('useAuth: Login response:', response);
      dispatch(loginSuccess(response));
      console.log('useAuth: Navigating to', response.user.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard');
      navigate(response.user.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard');
      return response;
    } catch (err) {
      console.error('useAuth: Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const register = async (data) => {
    dispatch(setLoading(true));
    try {
      const response = await authService.register(data);
      dispatch(registerSuccess(response));
      navigate(response.user.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard');
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout: handleLogout,
    isAuthenticated: !!token,
  };
};
