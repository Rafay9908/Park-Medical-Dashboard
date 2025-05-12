import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";


  const storedAuth = localStorage.getItem('authData');
  const initialAuth = storedAuth ? JSON.parse(storedAuth) : null;
  
  const [user, setUser] = useState(initialAuth?.user || null);
  const [token, setToken] = useState(initialAuth?.token || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('authData', JSON.stringify({ token, user }));
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('authData');
    }
    setLoading(false);
  }, [token, user]);

  const register = async (name, email, password, role) => {
    try {
      const res = await axios.post(`${API_URL}/users/register`, { name, email, password, role });
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/users/login`, { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };
console.log("Token", token)


  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!token;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);