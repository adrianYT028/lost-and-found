const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('🔧 Supabase Config:', {
  url: supabaseUrl ? '✅ Set' : '❌ Missing',
  key: supabaseKey ? '✅ Set' : '❌ Missing',
  environment: process.env.NODE_ENV || 'development'
});

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('- REACT_APP_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('- REACT_APP_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
  console.error('⚠️  Server will continue but database operations will fail');
  
  // Create a dummy client to prevent crashes
  const supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
    })
  };
  
  module.exports = { supabase };
} else {
  const supabase = createClient(supabaseUrl, supabaseKey);
  module.exports = { supabase };
}
