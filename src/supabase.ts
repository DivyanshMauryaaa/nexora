import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_SUPABASE_PROJECT_URL || 'https://qjjjmydmtbrcbolzlvxv.supabase.co'
const supabaseKey = process.env.NEXT_SUPABASE_PROJECT_APIKEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwampqbXlkbXRicmNib3psdnh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMjAxNTYsImV4cCI6MjA1Nzc5NjE1Nn0.3FWoKNEWT0Sji4UJ8IuwiXJKGuhGJtkf_E-95dd8Pqk'

export const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase;