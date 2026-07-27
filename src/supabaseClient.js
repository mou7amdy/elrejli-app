import { createClient } from "@supabase/supabase-js";

// هذي القيم تجيك من: Supabase Dashboard > Settings > API
// حطهم في ملف .env (شوف .env.example) وما تكتبهمش هنا مباشرة
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "ناقص إعداد Supabase. تأكد من ملف .env فيه VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
