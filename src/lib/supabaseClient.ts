import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nmoyrkhozsomnbqepfvs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tb3lya2hvenNvbW5icWVwZnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyODU5NDUsImV4cCI6MjA5OTg2MTk0NX0.WycYAClfwx1ouhzS6gNA3hh4AOmuZvnY5dKpC4VFPFM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
