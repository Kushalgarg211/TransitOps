import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { loginUser as apiLogin } from '../services/auth';

const AuthContext = createContext();

const ROLE_DETAILS = {
  'Fleet Manager': {
    name: 'Sarah Jenkins',
    email: 'sarah.manager@transitops.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    description: 'Manages vehicles, maintenance logs, and overall fleet utilization.',
  },
  'Dispatcher': {
    name: 'Marcus Brody',
    email: 'marcus.dispatch@transitops.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    description: 'Schedules trips, monitors driver shifts, and dispatches cargo.',
  },
  'Safety Officer': {
    name: 'Elena Rostova',
    email: 'elena.safety@transitops.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    description: 'Monitors driver safety scores, license expirations, and safety reports.',
  },
  'Financial Analyst': {
    name: 'David Vance',
    email: 'david.finance@transitops.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    description: 'Tracks operational expenses, fuel costs, ROI, and financial logs.',
  },
  'Super User': {
    name: 'Sarthak Sahu',
    email: 'sarthaksahu333@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    description: 'Administrator with full system privileges and analytical access.',
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiLogin(email, password);
      const { token, user: backendUser } = response;
      
      const details = ROLE_DETAILS[backendUser.role] || {};
      const loggedUser = {
        ...backendUser,
        avatar: details.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        description: details.description || '',
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      toast.success(`Logged in as ${loggedUser.role}!`);
      return loggedUser;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully.');
  };

  const switchRole = (newRole) => {
    if (!ROLE_DETAILS[newRole]) {
      toast.error(`Invalid role: ${newRole}`);
      return;
    }
    const details = ROLE_DETAILS[newRole];
    const updatedUser = {
      ...user,
      role: newRole,
      name: details.name,
      email: details.email,
      avatar: details.avatar,
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    toast.success(`Switched active view to ${newRole}`);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      switchRole,
      isAuthenticated: !!user,
      availableRoles: Object.keys(ROLE_DETAILS)
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
