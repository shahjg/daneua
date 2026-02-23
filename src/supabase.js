import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── Auth ──
export const signIn = async (email) => {
  const { error } = await supabase.auth.signInWithOtp({ email });
  return { error };
};
export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
export const signOut = () => supabase.auth.signOut();

// ── Ask Anything ──
export const getQuestions = async () => {
  const { data } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
  return data || [];
};
export const submitQuestion = async (text) => {
  const user = await getUser();
  return supabase.from('questions').insert({ question: text, asked_by: user?.id, answered: false }).select().single();
};
export const answerQuestion = async (id, answer) => {
  return supabase.from('questions').update({ answer, answered: true, answered_at: new Date().toISOString() }).eq('id', id);
};

// ── Our Words ──
export const getWords = async () => {
  const { data } = await supabase.from('our_words').select('*').order('created_at', { ascending: false });
  return data || [];
};
export const addWord = async (text, from) => {
  return supabase.from('our_words').insert({ text, from_name: from }).select().single();
};

// ── Milestones ──
export const getMilestones = async () => {
  const { data } = await supabase.from('milestones').select('*').order('sort_order', { ascending: true });
  return data || [];
};
export const addMilestone = async (title, when) => {
  const { data } = await supabase.from('milestones').select('sort_order').order('sort_order', { ascending: false }).limit(1);
  const next = (data?.[0]?.sort_order || 0) + 1;
  return supabase.from('milestones').insert({ title, when_text: when, done: false, sort_order: next }).select().single();
};
export const toggleMilestone = async (id, done) => {
  return supabase.from('milestones').update({ done }).eq('id', id);
};

// ── Media uploads ──
export const uploadMedia = async (file, folder = 'general') => {
  const ext = file.name.split('.').pop();
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('media').upload(path, file);
  if (error) return { url: null, error };
  const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
  return { url: publicUrl, error: null };
};

// ── Real-time ──
export const subscribeToTable = (table, callback) => {
  return supabase.channel(`${table}-changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe();
};
