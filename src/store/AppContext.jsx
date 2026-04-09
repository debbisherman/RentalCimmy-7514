import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabase/supabase';

const AppContext = createContext();
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

const SUPER_ADMIN_EMAIL = 'info@cimmeronstudios.com';

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renters, setRenters] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) await fetchProfile(currentUser.id, currentUser.email);
        else setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    initSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id, currentUser.email);
      else {
        setProfile(null);
        setRenters([]);
        setPayments([]);
        setLoading(false);
      }
    });

    return () => { if (subscription) subscription.unsubscribe(); };
  }, []);

  const fetchProfile = async (userId, userEmail) => {
    try {
      const { data } = await supabase.from('profiles_20240520').select('*').eq('id', userId).maybeSingle();
      let finalProfile = data || { id: userId, email: userEmail, role: 'renter', full_name: 'User' };
      if (userEmail === SUPER_ADMIN_EMAIL) finalProfile.role = 'super_admin';
      setProfile(finalProfile);
      await fetchData(finalProfile);
    } catch (err) {
      console.error('Profile Err:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (userProfile) => {
    if (!userProfile || !supabase) return;
    try {
      const isAdmin = userProfile.role === 'landlord' || userProfile.role === 'super_admin';
      if (isAdmin) {
        const [rRes, pRes] = await Promise.all([
          supabase.from('renters_20240520').select('*').order('name'),
          supabase.from('payments_20240520').select('*').order('received_date', { ascending: false })
        ]);
        setRenters(rRes.data || []);
        setPayments(pRes.data || []);
      } else {
        const { data: renterRecord } = await supabase.from('renters_20240520').select('*').eq('email', userProfile.email).maybeSingle();
        if (renterRecord) {
          const { data: pRes } = await supabase.from('payments_20240520').select('*').eq('renter_id', renterRecord.id).order('received_date', { ascending: false });
          setRenters([renterRecord]);
          setPayments(pRes || []);
        }
      }
    } catch (err) { console.error('Data Err:', err); }
  };

  const value = {
    user, profile, loading, error,
    role: profile?.role || (user?.email === SUPER_ADMIN_EMAIL ? 'super_admin' : 'renter'),
    renters, payments,
    addRenter: async (d) => {
      const { data: existingProfile } = await supabase.from('profiles_20240520').select('id').eq('email', d.email).maybeSingle();
      const r = await supabase.from('renters_20240520').insert([{ 
        ...d, 
        landlord_id: user.id,
        user_id: existingProfile?.id || null 
      }]).select();
      if (!r.error) await fetchData(profile);
      return r;
    },
    deleteRenter: async (id) => {
      const r = await supabase.from('renters_20240520').delete().eq('id', id);
      if (!r.error) await fetchData(profile);
      return r;
    },
    addPayment: async (d) => {
      // Send both column names for compatibility
      const r = await supabase.from('payments_20240520').insert([{
        ...d,
        received_date: d.received_date || d.date
      }]).select();
      if (!r.error) await fetchData(profile);
      return r;
    },
    signOut: () => supabase.auth.signOut(),
    refreshData: () => fetchData(profile)
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};