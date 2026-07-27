import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient";
import {
  Bell, MapPin, MessageCircle, Send, Cigarette, Users, Moon,
  Coffee, UtensilsCrossed, X, Plus, HandHeart, Search, ArrowRight,
  Clock, Check, ShieldCheck, LogOut
} from "lucide-react";

const COLORS = {
  bg: "#0B0A16", bgGradTop: "#141026", surface: "#1B1730", surface2: "#241F3F",
  border: "#332C55", gold: "#E8B74A", coral: "#FF5E5B",
  textPrimary: "#F4F1EA", textMuted: "#9891B8",
};

const ICONS = { sgarit: Cigarette, jmayaa: Users, sahra: Moon, atay: Coffee, chaariya: UtensilsCrossed };
const TAGS = {
  sgarit: "الدخان بين الشباب", jmayaa: "التجمعات العامة", sahra: "سهرة الليلة",
  atay: "مجموعة الأتاي", chaariya: "الرز و المعكرونة",
};

// ---------- helpers ----------
function timeAgo(iso) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "الآن";
  if (d < 3600) return `قبل ${Math.floor(d / 60)} د`;
  if (d < 86400) return `قبل ${Math.floor(d / 3600)} سا`;
  return `قبل ${Math.floor(d / 86400)} يوم`;
}

function useFonts() {
  useEffect(() => {
    if (document.getElementById("rajli-fonts")) return;
    const l = document.createElement("link");
    l.id = "rajli-fonts";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@500;700;800;900&family=Tajawal:wght@400;500;700&display=swap";
    document.head.appendChild(l);
  }, []);
}

// ---------- atoms ----------
function ActionBtn({ icon: Icon, label, onClick, tone = "surface", disabled }) {
  const styles = {
    surface: { background: COLORS.surface2, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` },
    gold: { background: COLORS.gold, color: "#1B1206", border: "none" },
    coral: { background: "transparent", color: COLORS.coral, border: `1px solid ${COLORS.coral}55` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[tone], opacity: disabled ? 0.5 : 1,
      fontFamily: "Tajawal, sans-serif", fontWeight: 700, borderRadius: 14,
      padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "center",
      gap: 8, fontSize: 14, cursor: disabled ? "default" : "pointer",
    }}>
      <Icon size={17} strokeWidth={2.3} />{label}
    </button>
  );
}

function Pulse({ color }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 9, height: 9 }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, opacity: 0.6, animation: "rajli-pulse 1.6s ease-out infinite" }} />
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color }} />
    </span>
  );
}

// ---------- Auth screens ----------
function LoginScreen({ onCodeSent, onVerify, step, email, setEmail, error }) {
  const [code, setCode] = useState("");
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "32px 24px", background: `radial-gradient(circle at 50% 0%, ${COLORS.bgGradTop}, ${COLORS.bg} 60%)` }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 900, fontSize: 42, color: COLORS.gold }}>الرجلي</div>
        <div style={{ fontFamily: "Tajawal, sans-serif", color: COLORS.textMuted, fontSize: 14, marginTop: 6 }}>شنو خبار الليلة؟</div>
      </div>
      {step === "email" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ fontFamily: "Tajawal, sans-serif", color: COLORS.textMuted, fontSize: 13 }}>البريد الإلكتروني</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" dir="ltr"
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "14px 16px", color: COLORS.textPrimary, fontFamily: "Tajawal, sans-serif", fontSize: 15, outline: "none", textAlign: "left" }} />
          <button onClick={() => onCodeSent(email)} style={{ marginTop: 8, background: COLORS.gold, color: "#1B1206", border: "none", borderRadius: 14, padding: "14px 16px", fontFamily: "Cairo, sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
            إرسال كود التأكيد
          </button>
        </div>
      )}
      {step === "code" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ fontFamily: "Tajawal, sans-serif", color: COLORS.textMuted, fontSize: 13 }}>وصلك كود على {email}</label>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="123456" dir="ltr" maxLength={6}
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "14px 16px", color: COLORS.textPrimary, fontFamily: "Cairo, sans-serif", fontSize: 24, fontWeight: 800, textAlign: "center", letterSpacing: 8, outline: "none" }} />
          <button onClick={() => onVerify(email, code)} style={{ marginTop: 8, background: COLORS.gold, color: "#1B1206", border: "none", borderRadius: 14, padding: "14px 16px", fontFamily: "Cairo, sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
            دخول
          </button>
        </div>
      )}
      {error && <div style={{ color: COLORS.coral, fontFamily: "Tajawal, sans-serif", fontSize: 13, textAlign: "center", marginTop: 14 }}>{error}</div>}
      <p style={{ fontFamily: "Tajawal, sans-serif", color: COLORS.textMuted, fontSize: 12, textAlign: "center", marginTop: 28, lineHeight: 1.7 }}>
        تطبيق مغلق لمجموعة مغلقة. حسابك يحتاج موافقة قبل الاستخدام.
      </p>
    </div>
  );
}

function PendingScreen({ onSignOut }) {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center", background: `radial-gradient(circle at 50% 0%, ${COLORS.bgGradTop}, ${COLORS.bg} 60%)` }}>
      <div style={{ width: 84, height: 84, borderRadius: "50%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        <Clock size={34} color={COLORS.gold} strokeWidth={1.8} />
      </div>
      <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 800, fontSize: 20, color: COLORS.textPrimary, marginBottom: 8 }}>بانتظار الموافقة</div>
      <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: 14, color: COLORS.textMuted, lineHeight: 1.8, maxWidth: 260 }}>
        حسابك وصل، وباقي ننتظرو موافقة الأدمن باش تقدر تستعمل الرجلي.
      </div>
      <button onClick={onSignOut} style={{ marginTop: 24, background: "none", border: "none", color: COLORS.textMuted, fontFamily: "Tajawal, sans-serif", fontSize: 13, cursor: "pointer" }}>تسجيل خروج</button>
    </div>
  );
}

// ---------- Home ----------
function CategoryCard({ catKey, label, color, sub, hasActivity, onOpen }) {
  const Icon = ICONS[catKey];
  const locked = !sub || sub === "none";
  const pending = sub === "pending";
  return (
    <button onClick={() => onOpen(catKey)} style={{
      position: "relative", textAlign: "right", cursor: "pointer",
      background: `linear-gradient(155deg, ${COLORS.surface} 0%, ${COLORS.surface2} 100%)`,
      border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "18px 16px",
      display: "flex", flexDirection: "column", gap: 10, overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -30, left: -30, width: 90, height: 90, borderRadius: "50%", background: `${color}22`, filter: "blur(8px)" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 42, height: 42, borderRadius: 13, background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={21} color={color} strokeWidth={2} />
        </div>
        {hasActivity && sub === "approved" && <Pulse color={color} />}
      </div>
      <div>
        <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 800, fontSize: 17, color: COLORS.textPrimary }}>{label}</div>
        <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{TAGS[catKey]}</div>
      </div>
      {locked && <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: 11.5, fontWeight: 700, color, marginTop: 2 }}>اطلب الانضمام ←</div>}
      {pending && <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: 11.5, fontWeight: 700, color: COLORS.textMuted, marginTop: 2 }}>طلبك قيد المراجعة</div>}
    </button>
  );
}

function HomeScreen({ categories, subsMap, activityMap, onOpen, onOpenNotifs, unreadCount, onJoin, isAdmin, onOpenAdmin, onSignOut }) {
  return (
    <div style={{ minHeight: "100%", background: COLORS.bg, paddingBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 8px" }}>
        <div>
          <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 900, fontSize: 26, color: COLORS.gold }}>الرجلي</div>
          <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: 12.5, color: COLORS.textMuted, marginTop: 2 }}>شنو خبار الليلة؟</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {isAdmin && (
            <button onClick={onOpenAdmin} style={{ width: 44, height: 44, borderRadius: 14, background: COLORS.surface, border: `1px solid ${COLORS.gold}55`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <ShieldCheck size={19} color={COLORS.gold} />
            </button>
          )}
          <button onClick={onOpenNotifs} style={{ position: "relative", width: 44, height: 44, borderRadius: 14, background: COLORS.surface, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Bell size={19} color={COLORS.textPrimary} strokeWidth={2} />
            {unreadCount > 0 && <span style={{ position: "absolute", top: -3, left: -3, background: COLORS.coral, color: "#fff", fontSize: 10, fontFamily: "Tajawal, sans-serif", fontWeight: 700, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount}</span>}
          </button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "16px 20px" }}>
        {categories.map(cat => (
          <CategoryCard key={cat.key} catKey={cat.key} label={cat.label} color={cat.color}
            sub={subsMap[cat.key]} hasActivity={activityMap[cat.key]}
            onOpen={(k) => subsMap[k] === "approved" ? onOpen(k) : onJoin(k)} />
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 8 }}>
        <button onClick={onSignOut} style={{ background: "none", border: "none", color: COLORS.textMuted, fontFamily: "Tajawal, sans-serif", fontSize: 12.5, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <LogOut size={14} /> تسجيل خروج
        </button>
      </div>
    </div>
  );
}

// ---------- Category screen ----------
function PostCard({ post, color, onAddComment }) {
  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState("");
  const badge = {
    have: { text: "عندو", color: "#6FC7C1" }, need: { text: "يبي", color: COLORS.coral },
    wahaw: { text: "وهاو", color }, empty: { text: "ماخالگ شي", color: COLORS.textMuted }, post: null,
  }[post.type];

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Cairo, sans-serif", fontWeight: 800, fontSize: 12.5, color }}>
            {(post.author_name || "?")[0]}
          </div>
          <div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 13.5, color: COLORS.textPrimary }}>{post.author_name}</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: 11, color: COLORS.textMuted }}>{timeAgo(post.created_at)}</div>
          </div>
        </div>
        {badge && <span style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 11, color: badge.color, background: `${badge.color}1a`, padding: "4px 10px", borderRadius: 20 }}>{badge.text}</span>}
      </div>
      <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: 14, color: COLORS.textPrimary, lineHeight: 1.6 }}>{post.text}</div>
      {post.location && <div style={{ display: "flex", alignItems: "center", gap: 5, color, fontFamily: "Tajawal, sans-serif", fontSize: 12.5 }}><MapPin size={13} /> {post.location}</div>}
      <button onClick={() => setShowComments(s => !s)} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: COLORS.textMuted, fontFamily: "Tajawal, sans-serif", fontSize: 12, cursor: "pointer", padding: 0, marginTop: 2, alignSelf: "flex-start" }}>
        <MessageCircle size={14} /> {post.comments?.length > 0 ? `${post.comments.length} تعليق` : "تعليق"}
      </button>
      {showComments && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4, paddingTop: 8, borderTop: `1px solid ${COLORS.border}` }}>
          {(post.comments || []).map((c) => (
            <div key={c.id} style={{ fontFamily: "Tajawal, sans-serif", fontSize: 12.5, color: COLORS.textMuted }}>
              <span style={{ color: COLORS.textPrimary, fontWeight: 700 }}>{c.author_name}: </span>{c.text}
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <input value={text} onChange={e => setText(e.target.value)} placeholder="اكتب تعليق..."
              style={{ flex: 1, background: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "8px 10px", color: COLORS.textPrimary, fontFamily: "Tajawal, sans-serif", fontSize: 12.5, outline: "none" }} />
            <button onClick={() => { if (text.trim()) { onAddComment(post.id, text); setText(""); } }} style={{ background: color, border: "none", borderRadius: 10, width: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Send size={14} color="#1B1206" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ComposeSheet({ label, color, onClose, onPost }) {
  const [text, setText] = useState("");
  const [loc, setLoc] = useState("");
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000000aa", display: "flex", alignItems: "flex-end", zIndex: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "22px 22px 0 0", padding: 20, display: "flex", flexDirection: "column", gap: 12, border: `1px solid ${COLORS.border}`, borderBottom: "none" }}>
        <div style={{ width: 36, height: 4, borderRadius: 4, background: COLORS.border, margin: "0 auto 4px" }} />
        <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 800, fontSize: 16, color: COLORS.textPrimary }}>نشر في {label}</div>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="اكتب شنو حاب تقول..." rows={3}
          style={{ background: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 12, color: COLORS.textPrimary, fontFamily: "Tajawal, sans-serif", fontSize: 14, outline: "none", resize: "none" }} />
        <input value={loc} onChange={e => setLoc(e.target.value)} placeholder="المكان (اختياري)"
          style={{ background: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 12, color: COLORS.textPrimary, fontFamily: "Tajawal, sans-serif", fontSize: 13.5, outline: "none" }} />
        <button onClick={() => { if (text.trim()) { onPost(text, loc); onClose(); } }} style={{ background: color, border: "none", borderRadius: 14, padding: "13px", fontFamily: "Cairo, sans-serif", fontWeight: 800, fontSize: 14, color: "#1B1206", cursor: "pointer" }}>
          نشر
        </button>
      </div>
    </div>
  );
}

function CategoryScreen({ cat, posts, onBack, onAddPost, onAddComment, onQuickAction }) {
  const Icon = ICONS[cat.key];
  const [compose, setCompose] = useState(false);

  return (
    <div style={{ minHeight: "100%", background: COLORS.bg, display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ padding: "18px 18px 14px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${COLORS.border}`, background: `linear-gradient(180deg, ${cat.color}14, transparent)` }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}><ArrowRight size={20} color={COLORS.textPrimary} /></button>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${cat.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={20} color={cat.color} /></div>
        <div>
          <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 800, fontSize: 17, color: COLORS.textPrimary }}>{cat.label}</div>
          <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: 11.5, color: COLORS.textMuted }}>{TAGS[cat.key]}</div>
        </div>
      </div>

      <div style={{ padding: "14px 18px", display: "flex", flexWrap: "wrap", gap: 8 }}>
        {cat.key === "sgarit" && (<>
          <ActionBtn icon={Search} label="نبي دخان" onClick={() => onQuickAction("need", "نبي دخان")} />
          <ActionBtn icon={Check} label="عندي دخان" onClick={() => onQuickAction("have", "عندي دخان")} />
          <ActionBtn icon={Plus} label="نشر" tone="gold" onClick={() => setCompose(true)} />
        </>)}
        {cat.key === "jmayaa" && (<>
          <ActionBtn icon={HandHeart} label="وهاو" tone="gold" onClick={() => onQuickAction("wahaw", "وهاو الليلة!")} />
          <ActionBtn icon={X} label="الليلة ماخالگ شي" tone="coral" onClick={() => onQuickAction("empty", "الليلة ماخالگ شي")} />
          <ActionBtn icon={MapPin} label="تحديد المكان" onClick={() => setCompose(true)} />
        </>)}
        {(cat.key === "sahra" || cat.key === "atay" || cat.key === "chaariya") && (
          <ActionBtn icon={MapPin} label="تحديد المكان" tone="gold" onClick={() => setCompose(true)} />
        )}
      </div>

      <div style={{ flex: 1, padding: "0 18px 90px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
        {posts.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", fontFamily: "Tajawal, sans-serif", color: COLORS.textMuted, fontSize: 13.5, lineHeight: 1.8 }}>
            ماكان حتى بوست توا في {cat.label}.<br />كن أول واحد ينشر.
          </div>
        )}
        {posts.map(p => <PostCard key={p.id} post={p} color={cat.color} onAddComment={onAddComment} />)}
      </div>

      <button onClick={() => setCompose(true)} style={{ position: "absolute", bottom: 20, left: 20, width: 54, height: 54, borderRadius: "50%", background: cat.color, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: `0 8px 24px ${cat.color}55` }}>
        <Plus size={24} color="#15121f" strokeWidth={2.5} />
      </button>

      {compose && <ComposeSheet label={cat.label} color={cat.color} onClose={() => setCompose(false)} onPost={(text, loc) => onAddPost(text, loc)} />}
    </div>
  );
}

// ---------- Notifications ----------
function NotifsPanel({ notifs, categories, onClose }) {
  const colorOf = (k) => categories.find(c => c.key === k)?.color || COLORS.gold;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000000aa", zIndex: 30 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 0, left: 0, right: 0, background: COLORS.surface, borderRadius: "0 0 22px 22px", padding: 18, maxHeight: "70%", overflowY: "auto", border: `1px solid ${COLORS.border}`, borderTop: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 800, fontSize: 16, color: COLORS.textPrimary }}>التنبيهات</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color={COLORS.textMuted} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notifs.length === 0 && <div style={{ fontFamily: "Tajawal, sans-serif", color: COLORS.textMuted, fontSize: 13, textAlign: "center", padding: 20 }}>ماكان حتى تنبيه توا</div>}
          {notifs.map(n => {
            const Icon = ICONS[n.category_key];
            const color = colorOf(n.category_key);
            return (
              <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", borderRadius: 12, background: n.read ? "transparent" : `${color}12` }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={16} color={color} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: 13, color: COLORS.textPrimary, fontWeight: n.read ? 400 : 700 }}>{n.text}</div>
                  <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: 11, color: COLORS.textMuted }}>{timeAgo(n.created_at)}</div>
                </div>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- Admin ----------
function AdminScreen({ onBack, refreshKey }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingSubs, setPendingSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: users } = await supabase.from("profiles").select("*").eq("status", "pending");
    const { data: subs } = await supabase.from("category_subscriptions")
      .select("*, profiles(email, display_name), categories(label, color)")
      .eq("status", "pending");
    setPendingUsers(users || []);
    setPendingSubs(subs || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const approveUser = async (id) => {
    await supabase.from("profiles").update({ status: "approved" }).eq("id", id);
    load();
  };
  const rejectUser = async (id) => {
    await supabase.from("profiles").update({ status: "rejected" }).eq("id", id);
    load();
  };
  const approveSub = async (id) => {
    await supabase.from("category_subscriptions").update({ status: "approved" }).eq("id", id);
    load();
  };
  const rejectSub = async (id) => {
    await supabase.from("category_subscriptions").update({ status: "rejected" }).eq("id", id);
    load();
  };

  return (
    <div style={{ minHeight: "100%", background: COLORS.bg, padding: "18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer" }}><ArrowRight size={20} color={COLORS.textPrimary} /></button>
        <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 800, fontSize: 18, color: COLORS.gold }}>لوحة الأدمن</div>
      </div>

      <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, marginBottom: 10 }}>طلبات حسابات جديدة</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {pendingUsers.length === 0 && !loading && <div style={{ fontFamily: "Tajawal, sans-serif", color: COLORS.textMuted, fontSize: 13 }}>ماكان طلبات توا</div>}
        {pendingUsers.map(u => (
          <div key={u.id} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: 13, color: COLORS.textPrimary }}>{u.email}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => approveUser(u.id)} style={{ background: COLORS.gold, border: "none", borderRadius: 10, padding: "6px 12px", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>قبول</button>
              <button onClick={() => rejectUser(u.id)} style={{ background: "transparent", border: `1px solid ${COLORS.coral}`, color: COLORS.coral, borderRadius: 10, padding: "6px 12px", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>رفض</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, marginBottom: 10 }}>طلبات الانضمام للخانات</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {pendingSubs.length === 0 && !loading && <div style={{ fontFamily: "Tajawal, sans-serif", color: COLORS.textMuted, fontSize: 13 }}>ماكان طلبات توا</div>}
        {pendingSubs.map(s => (
          <div key={s.id} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: 13, color: COLORS.textPrimary }}>
              {s.profiles?.email} → <span style={{ color: s.categories?.color, fontWeight: 700 }}>{s.categories?.label}</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => approveSub(s.id)} style={{ background: COLORS.gold, border: "none", borderRadius: 10, padding: "6px 12px", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>قبول</button>
              <button onClick={() => rejectSub(s.id)} style={{ background: "transparent", border: `1px solid ${COLORS.coral}`, color: COLORS.coral, borderRadius: 10, padding: "6px 12px", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>رفض</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Root App ----------
export default function App() {
  useFonts();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subs, setSubs] = useState([]);
  const [posts, setPosts] = useState({});
  const [notifs, setNotifs] = useState([]);
  const [screen, setScreen] = useState("home");
  const [activeCatKey, setActiveCatKey] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [authStep, setAuthStep] = useState("email");
  const [email, setEmail] = useState("");
  const [authError, setAuthError] = useState("");

  // ----- Auth bootstrap -----
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadProfile = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    setProfile(data);
  }, [session]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // ----- Categories + subscriptions -----
  const loadCategories = useCallback(async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories(data || []);
  }, []);

  const loadSubs = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase.from("category_subscriptions").select("*").eq("user_id", session.user.id);
    setSubs(data || []);
  }, [session]);

  useEffect(() => {
    if (profile?.status === "approved") { loadCategories(); loadSubs(); }
  }, [profile, loadCategories, loadSubs]);

  const subsMap = {};
  subs.forEach(s => { subsMap[s.category_key] = s.status; });

  // ----- Posts for active category -----
  const loadPosts = useCallback(async (catKey) => {
    const { data } = await supabase.from("posts")
      .select("*, profiles(display_name), comments(*, profiles(display_name))")
      .eq("category_key", catKey).order("created_at", { ascending: false });
    const mapped = (data || []).map(p => ({
      ...p,
      author_name: p.profiles?.display_name || "؟",
      comments: (p.comments || []).map(c => ({ ...c, author_name: c.profiles?.display_name || "؟" })),
    }));
    setPosts(prev => ({ ...prev, [catKey]: mapped }));
  }, []);

  // ----- Notifications -----
  const loadNotifs = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase.from("notifications").select("*")
      .eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(50);
    setNotifs(data || []);
  }, [session]);

  useEffect(() => {
    if (profile?.status === "approved") {
      loadNotifs();
      const channel = supabase.channel("rajli-notifs")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${session.user.id}` },
          () => loadNotifs())
        .subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, [profile, session, loadNotifs]);

  // ----- Actions -----
  const sendCode = async (em) => {
    setAuthError("");
    const { error } = await supabase.auth.signInWithOtp({ email: em });
    if (error) setAuthError(error.message);
    else setAuthStep("code");
  };
  const verifyCode = async (em, code) => {
    setAuthError("");
    const { error } = await supabase.auth.verifyOtp({ email: em, token: code, type: "email" });
    if (error) setAuthError(error.message);
  };
  const signOut = async () => { await supabase.auth.signOut(); setProfile(null); };

  const requestJoin = async (catKey) => {
    await supabase.from("category_subscriptions").insert({ user_id: session.user.id, category_key: catKey, status: "pending" });
    loadSubs();
  };

  const openCategory = async (catKey) => {
    setActiveCatKey(catKey);
    setScreen("category");
    await loadPosts(catKey);
  };

  const addPost = async (text, loc) => {
    const cat = activeCatKey;
    const { data, error } = await supabase.from("posts")
      .insert({ category_key: cat, user_id: session.user.id, type: "post", text, location: loc || null })
      .select().single();
    if (!error) {
      await supabase.rpc("notify_category", { p_category_key: cat, p_text: `${profile.display_name}: ${text}`, p_post_id: data.id });
      loadPosts(cat);
    }
  };

  const quickAction = async (type, label) => {
    const cat = activeCatKey;
    const { data, error } = await supabase.from("posts")
      .insert({ category_key: cat, user_id: session.user.id, type, text: label })
      .select().single();
    if (!error) {
      await supabase.rpc("notify_category", { p_category_key: cat, p_text: `${profile.display_name}: ${label}`, p_post_id: data.id });
      loadPosts(cat);
    }
  };

  const addComment = async (postId, text) => {
    await supabase.from("comments").insert({ post_id: postId, user_id: session.user.id, text });
    loadPosts(activeCatKey);
  };

  const markNotifsRead = async () => {
    const unread = notifs.filter(n => !n.read).map(n => n.id);
    if (unread.length) {
      await supabase.from("notifications").update({ read: true }).in("id", unread);
      loadNotifs();
    }
  };

  useEffect(() => { document.body.style.background = COLORS.bg; }, []);

  // ----- Render -----
  let content;
  if (!session) {
    content = <LoginScreen step={authStep} email={email} setEmail={setEmail} onCodeSent={sendCode} onVerify={verifyCode} error={authError} />;
  } else if (!profile) {
    content = <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.textMuted, fontFamily: "Tajawal, sans-serif" }}>...جاري التحميل</div>;
  } else if (profile.status !== "approved") {
    content = <PendingScreen onSignOut={signOut} />;
  } else if (screen === "admin") {
    content = <AdminScreen onBack={() => setScreen("home")} />;
  } else if (screen === "category" && activeCatKey) {
    const cat = categories.find(c => c.key === activeCatKey);
    content = (
      <CategoryScreen cat={cat} posts={posts[activeCatKey] || []}
        onBack={() => setScreen("home")} onAddPost={addPost}
        onAddComment={addComment} onQuickAction={quickAction} />
    );
  } else {
    const activityMap = {};
    categories.forEach(c => { activityMap[c.key] = (posts[c.key] || []).length > 0; });
    content = (
      <HomeScreen categories={categories} subsMap={subsMap} activityMap={activityMap}
        onOpen={openCategory} onOpenNotifs={() => { setShowNotifs(true); markNotifsRead(); }}
        unreadCount={notifs.filter(n => !n.read).length} onJoin={requestJoin}
        isAdmin={profile.is_admin} onOpenAdmin={() => setScreen("admin")} onSignOut={signOut} />
    );
  }

  return (
    <div dir="rtl" style={{ width: "100%", maxWidth: 420, height: 780, margin: "0 auto", position: "relative", background: COLORS.bg, borderRadius: 28, overflow: "hidden", boxShadow: "0 20px 60px #00000066", border: `1px solid ${COLORS.border}` }}>
      <style>{`
        @keyframes rajli-pulse { 0% { transform: scale(1); opacity: .7; } 70% { transform: scale(2.4); opacity: 0; } 100% { transform: scale(2.4); opacity: 0; } }
        * { box-sizing: border-box; } ::-webkit-scrollbar { width: 0px; }
      `}</style>
      <div style={{ height: "100%", overflowY: "auto", position: "relative" }}>{content}</div>
      {showNotifs && <NotifsPanel notifs={notifs} categories={categories} onClose={() => setShowNotifs(false)} />}
    </div>
  );
}
