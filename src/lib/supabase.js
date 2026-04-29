import { createClient } from '@supabase/supabase-js';

// These will be replaced with real values when deploying
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth helpers
export const signUp = async (email, password, name) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, trial_start: new Date().toISOString() }
    }
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Trial helpers
export const isTrialActive = (user) => {
  if (!user?.user_metadata?.trial_start) return false;
  const trialStart = new Date(user.user_metadata.trial_start);
  const now = new Date();
  const diffDays = (now - trialStart) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
};

export const isSubscribed = (user) => {
  return user?.user_metadata?.subscribed === true;
};

export const hasAccess = (user) => {
  return isTrialActive(user) || isSubscribed(user);
};

export const getTrialDaysLeft = (user) => {
  if (!user?.user_metadata?.trial_start) return 0;
  const trialStart = new Date(user.user_metadata.trial_start);
  const now = new Date();
  const diffDays = (now - trialStart) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(7 - diffDays));
};
