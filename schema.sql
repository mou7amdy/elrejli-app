-- ============================================================
-- الرجلي - قاعدة البيانات الكاملة
-- انسخ هذا الملف كامل و شغّلو في Supabase: SQL Editor > New query > Run
-- ============================================================

-- 1) جدول الملفات الشخصية (يتربط تلقائيًا بجدول auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  is_admin boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- إنشاء بروفايل تلقائي عند أي تسجيل دخول جديد
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) الخانات (بيانات ثابتة)
create table public.categories (
  key text primary key,
  label text not null,
  color text not null,
  sort_order int not null
);

insert into public.categories (key, label, color, sort_order) values
  ('sgarit',   'سگاريت',   '#6FC7C1', 1),
  ('jmayaa',   'الجمايع',  '#FF6B9D', 2),
  ('sahra',    'السهرة',   '#A78BFA', 3),
  ('atay',     'أتاي',     '#F2B84B', 4),
  ('chaariya', 'الشعرية',  '#F0965A', 5);

-- 3) الاشتراك في الخانات (لكل خانة موافقة منفصلة)
create table public.category_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_key text not null references public.categories(key),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  requested_at timestamptz not null default now(),
  unique (user_id, category_key)
);

-- 4) البوستات
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  category_key text not null references public.categories(key),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'post', -- post | have | need | wahaw | empty
  text text not null,
  location text,
  created_at timestamptz not null default now()
);

-- 5) التعليقات
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

-- 6) الإشعارات (لكل مشترك في الخانة)
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_key text not null references public.categories(key),
  text text not null,
  post_id uuid references public.posts(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- تفعيل الحماية على مستوى الصفوف (RLS)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.category_subscriptions enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.notifications enable row level security;

-- دالة مساعدة: هل المستخدم الحالي أدمن؟
create function public.is_admin()
returns boolean as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$ language sql stable security definer;

-- profiles: كل واحد يشوف بروفايلو، الأدمن يشوف الكل
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());
create policy "profiles_admin_update_any" on public.profiles
  for update using (public.is_admin());

-- categories: مرئية للجميع المسجلين
create policy "categories_select_all" on public.categories
  for select using (auth.uid() is not null);

-- category_subscriptions: كل واحد يشوف/ينشئ طلباتو، الأدمن يشوف ويعدّل الكل
create policy "subs_select_own_or_admin" on public.category_subscriptions
  for select using (user_id = auth.uid() or public.is_admin());
create policy "subs_insert_own" on public.category_subscriptions
  for insert with check (user_id = auth.uid());
create policy "subs_admin_update" on public.category_subscriptions
  for update using (public.is_admin());

-- posts: بس المشتركين الموافق عليهم في الخانة (أو الأدمن) يشوفو وينشرو
create policy "posts_select_subscribed" on public.posts
  for select using (
    public.is_admin() or exists (
      select 1 from public.category_subscriptions s
      where s.category_key = posts.category_key
        and s.user_id = auth.uid()
        and s.status = 'approved'
    )
  );
create policy "posts_insert_subscribed" on public.posts
  for insert with check (
    user_id = auth.uid() and exists (
      select 1 from public.category_subscriptions s
      where s.category_key = posts.category_key
        and s.user_id = auth.uid()
        and s.status = 'approved'
    )
  );

-- comments: نفس منطق البوستات (لازم يكون مشترك في خانة البوست)
create policy "comments_select_subscribed" on public.comments
  for select using (
    public.is_admin() or exists (
      select 1 from public.posts p
      join public.category_subscriptions s on s.category_key = p.category_key
      where p.id = comments.post_id and s.user_id = auth.uid() and s.status = 'approved'
    )
  );
create policy "comments_insert_subscribed" on public.comments
  for insert with check (
    user_id = auth.uid() and exists (
      select 1 from public.posts p
      join public.category_subscriptions s on s.category_key = p.category_key
      where p.id = comments.post_id and s.user_id = auth.uid() and s.status = 'approved'
    )
  );

-- notifications: كل واحد يشوف إشعاراتو بس
create policy "notifs_select_own" on public.notifications
  for select using (user_id = auth.uid());
create policy "notifs_update_own" on public.notifications
  for update using (user_id = auth.uid());
create policy "notifs_insert_any_subscribed" on public.notifications
  for insert with check (
    exists (
      select 1 from public.category_subscriptions s
      where s.category_key = notifications.category_key
        and s.user_id = notifications.user_id
        and s.status = 'approved'
    )
  );

-- ============================================================
-- دالة: إرسال إشعار لكل المشتركين الموافق عليهم في خانة معينة
-- تُستدعى من التطبيق بعد أي نشر أو زر (وهاو / عندي دخان...)
-- ============================================================
create function public.notify_category(
  p_category_key text,
  p_text text,
  p_post_id uuid default null
)
returns void as $$
begin
  insert into public.notifications (user_id, category_key, text, post_id)
  select s.user_id, p_category_key, p_text, p_post_id
  from public.category_subscriptions s
  where s.category_key = p_category_key and s.status = 'approved';
end;
$$ language plpgsql security definer;
