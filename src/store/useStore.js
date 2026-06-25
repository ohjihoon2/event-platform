import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useStore = create((set, get) => ({
  isAdmin: false,
  adminUser: null,
  forms: [],
  applications: [],

  // --- Auth Actions ---
  checkUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      set({ isAdmin: true, adminUser: session.user });
      get().fetchForms(); // Fetch forms on login
      get().fetchAllAdminApplications();
    }
  },
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    set({ isAdmin: true, adminUser: data.user });
    get().fetchForms();
    get().fetchAllAdminApplications();
  },
  signup: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { name }
      }
    });
    if (error) throw error;
    // Auto-login after signup
    set({ isAdmin: true, adminUser: data.user });
    get().fetchForms();
    get().fetchAllAdminApplications();
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ isAdmin: false, adminUser: null, forms: [], applications: [] });
  },

  // --- Form Actions ---
  fetchForms: async () => {
    const { adminUser } = get();
    if (!adminUser) return;
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('admin_id', adminUser.id)
      .order('created_at', { ascending: false });
    if (!error && data) {
      set({ forms: data });
    }
  },
  addForm: async (form) => {
    const { adminUser } = get();
    if (!adminUser) return { success: false, error: 'Not logged in' };
    const { data, error } = await supabase
      .from('forms')
      .insert([{ ...form, admin_id: adminUser.id }])
      .select();
    if (!error && data) {
      set((state) => ({ forms: [data[0], ...state.forms] }));
      return { success: true };
    } else {
      console.error(error);
      return { success: false, error };
    }
  },
  updateForm: async (id, updatedForm) => {
    const { data, error } = await supabase
      .from('forms')
      .update(updatedForm)
      .eq('id', id)
      .select();
    if (!error && data) {
      set((state) => ({
        forms: state.forms.map((f) => (f.id === id ? data[0] : f)),
      }));
      return { success: true };
    }
    console.error(error);
    return { success: false, error };
  },
  deleteForm: async (id) => {
    const { error } = await supabase.from('forms').delete().eq('id', id);
    if (!error) {
      set((state) => ({ forms: state.forms.filter((f) => f.id !== id) }));
    }
  },

  // --- Public Form Actions ---
  fetchFormById: async (id) => {
    const { data, error } = await supabase.from('forms').select('*').eq('id', id).single();
    if (!error && data) {
      return data;
    }
    return null;
  },
  getApplicationCount: async (formId) => {
    const { data, error } = await supabase.rpc('get_application_count', { p_form_id: formId });
    if (!error && data !== null) {
      return data;
    }
    return 0;
  },

  // --- Application Actions ---
  fetchAllAdminApplications: async () => {
    const { adminUser } = get();
    if (!adminUser) return;
    const { data, error } = await supabase.from('applications').select('*');
    if (!error && data) {
      set({ applications: data });
    }
  },
  fetchApplications: async (formId) => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('form_id', formId)
      .order('created_at', { ascending: true });
    if (!error && data) {
      // Merge with existing applications instead of replacing all
      set((state) => {
        const otherApps = state.applications.filter(a => a.form_id !== formId);
        return { applications: [...otherApps, ...data] };
      });
    }
  },
  addApplication: async (application, isManualAddByAdmin = false) => {
    if (isManualAddByAdmin) {
      const { data, error } = await supabase
        .from('applications')
        .insert([application])
        .select();
      if (!error && data) {
        set((state) => ({ applications: [...state.applications, data[0]] }));
        return { success: true };
      } else {
        console.error(error);
        return { success: false, error: error.message };
      }
    } else {
      const { data, error } = await supabase.rpc('apply_for_event', {
        p_form_id: application.form_id,
        p_name: application.name,
        p_phone: application.phone,
        p_password: application.password,
        p_deposit_name: application.deposit_name,
        p_custom_data: application.custom_data
      });

      if (!error && data) {
        set((state) => ({ applications: [...state.applications, data] }));
        return { success: true };
      } else {
        console.error(error);
        return { success: false, error: error.message };
      }
    }
  },
  deleteApplication: async (id) => {
    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (!error) {
      set((state) => ({ applications: state.applications.filter((a) => a.id !== id) }));
    }
  },
  lookupApplication: async (formId, name, phone, password) => {
    const { data, error } = await supabase.rpc('lookup_application', {
      p_form_id: formId,
      p_name: name,
      p_phone: phone,
      p_password: password
    });
    if (error) {
      console.error(error);
      return { success: false, error: error.message };
    }
    if (!data) {
      return { success: false, error: '정보가 일치하는 신청 내역이 없습니다.' };
    }
    return { success: true, data };
  },
  updatePublicApplication: async (id, password, depositName, customData) => {
    const { data, error } = await supabase.rpc('update_application_public', {
      p_id: id,
      p_password: password,
      p_deposit_name: depositName,
      p_custom_data: customData
    });
    if (error) {
      console.error(error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },
  deletePublicApplication: async (id, password) => {
    const { error } = await supabase.rpc('delete_application_public', {
      p_id: id,
      p_password: password
    });
    if (error) {
      console.error(error);
      return { success: false, error: error.message };
    }
    return { success: true };
  },
  updateApplication: async (id, updatedData) => {
    const { data, error } = await supabase
      .from('applications')
      .update(updatedData)
      .eq('id', id)
      .select();
    if (!error && data) {
      set((state) => ({
        applications: state.applications.map((a) => (a.id === id ? data[0] : a)),
      }));
      return { success: true };
    }
    return { success: false, error };
  },
  updateApplicationStatus: async (id, status) => {
    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select();
    if (!error && data) {
      set((state) => ({
        applications: state.applications.map((a) => (a.id === id ? data[0] : a)),
      }));
    }
  },
}));
