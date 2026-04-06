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
  const [properties, setProperties] = useState([]);
  const [renters, setRenters] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) await fetchProfile(session.user.id, session.user.email);
      else setLoading(false);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id, currentUser.email);
      else {
        setProfile(null);
        setProperties([]);
        setRenters([]);
        setPayments([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId, userEmail) => {
    try {
      const { data, error } = await supabase.from('profiles_20240520').select('*').eq('id', userId).maybeSingle();
      
      let finalProfile = data || { 
        id: userId, 
        email: userEmail, 
        role: userEmail === SUPER_ADMIN_EMAIL ? 'super_admin' : 'renter', 
        full_name: 'User' 
      };

      if (userEmail === SUPER_ADMIN_EMAIL) finalProfile.role = 'super_admin';
      
      setProfile(finalProfile);
      await fetchData(finalProfile);
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (userProfile) => {
    if (!userProfile) return;
    
    const isAdmin = userProfile.role === 'landlord' || userProfile.role === 'super_admin';
    
    try {
      if (isAdmin) {
        const [propRes, rentRes, payRes] = await Promise.all([
          supabase.from('properties_20240520').select('*').order('name'),
          supabase.from('renters_20240520').select('*').order('name'),
          supabase.from('payments_20240520').select('*').order('date', { ascending: false })
        ]);
        setProperties(propRes.data || []);
        setRenters(rentRes.data || []);
        setPayments(payRes.data || []);
      } else {
        // Renter view: Find them by email
        const { data: renterRecord } = await supabase.from('renters_20240520').select('*').eq('email', userProfile.email).maybeSingle();
        
        if (renterRecord) {
          const [propRes, payRes] = await Promise.all([
            supabase.from('properties_20240520').select('*'),
            supabase.from('payments_20240520').select('*').eq('renter_id', renterRecord.id).order('date', { ascending: false })
          ]);
          setRenters([renterRecord]);
          setPayments(payRes.data || []);
          setProperties(propRes.data || []);
        } else {
          // Renter exists as user but not yet in landlord's renter table
          setRenters([]);
          setPayments([]);
          setProperties([]);
        }
      }
    } catch (err) {
      console.error("Data fetch critical error:", err);
    }
  };

  const value = {
    user,
    profile,
    loading,
    properties,
    renters,
    payments,
    role: profile?.role || (user?.email === SUPER_ADMIN_EMAIL ? 'super_admin' : 'renter'),
    addProperty: async (d) => {
      const r = await supabase.from('properties_20240520').insert([{ ...d, landlord_id: user.id }]).select();
      fetchData(profile);
      return r;
    },
    updateProperty: async (id, d) => {
      const r = await supabase.from('properties_20240520').update(d).eq('id', id).select();
      fetchData(profile);
      return r;
    },
    deleteProperty: async (id) => {
      const r = await supabase.from('properties_20240520').delete().eq('id', id);
      fetchData(profile);
      return r;
    },
    addRenter: async (d) => {
      const r = await supabase.from('renters_20240520').insert([{ ...d, landlord_id: user.id }]).select();
      fetchData(profile);
      return r;
    },
    updateRenter: async (id, d) => {
      const r = await supabase.from('renters_20240520').update(d).eq('id', id).select();
      fetchData(profile);
      return r;
    },
    deleteRenter: async (id) => {
      const r = await supabase.from('renters_20240520').delete().eq('id', id);
      fetchData(profile);
      return r;
    },
    addPayment: async (d) => {
      const r = await supabase.from('payments_20240520').insert([d]).select();
      fetchData(profile);
      return r;
    },
    updatePayment: async (id, d) => {
      const r = await supabase.from('payments_20240520').update(d).eq('id', id).select();
      fetchData(profile);
      return r;
    },
    deletePayment: async (id) => {
      const r = await supabase.from('payments_20240520').delete().eq('id', id);
      fetchData(profile);
      return r;
    },
    signOut: () => supabase.auth.signOut(),
    refreshData: () => fetchData(profile)
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};