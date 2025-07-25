import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://itsquiaztymelslncvzf.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0c3F1aWF6dHltZWxzbG5jdnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjMzNDAsImV4cCI6MjA2OTAzOTM0MH0.WHiYX6Q_mWePr_BFQJWVQW4J9bFawtZTMMA319tjmuM"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
