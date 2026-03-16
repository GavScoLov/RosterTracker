import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jqqmmeculaaksmzdupnr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcW1tZWN1bGFha3NtemR1cG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MzI4NzYsImV4cCI6MjA4OTAwODg3Nn0.Dz5tE73JhmKZTsas4l1PFaHqGhyfjZm6xGLTj__DdU0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
