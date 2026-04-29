import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, hasAccess, getTrialDaysLeft, isSubscribed } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [yearLevel, setYearLevelState] = useState(5);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Load year level from localStorage
    const saved = localStorage.getItem('scholarprep_year_level');
    if (saved) setYearLevelState(parseInt(saved));

    return () => subscription.unsubscribe();
  }, []);

  const setYearLevel = (level) => {
    setYearLevelState(level);
    localStorage.setItem('scholarprep_year_level', level.toString());
  };

  const value = {
    user,
    loading,
    yearLevel,
    setYearLevel,
    hasAccess: user ? hasAccess(user) : false,
    isSubscribed: user ? isSubscribed(user) : false,
    trialDaysLeft: user ? getTrialDaysLeft(user) : 0,
    // For demo mode when Supabase isn't connected
    demoMode: !process.env.REACT_APP_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL === 'https://your-project.supabase.co'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
