// Basic Supabase client configuration
// You'll need to replace these with your actual Supabase credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Mock Supabase client for now
export const supabase = {
  from: (table: string) => ({
    insert: async (data: any) => {
      console.log('Mock insert:', { table, data });
      return { data: null, error: null };
    }
  })
}; 