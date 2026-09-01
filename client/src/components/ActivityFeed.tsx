import { Activity, X } from "lucide-react";

type FeedItem = { id: string; label: string; detail: string; tone?: "lime" | "muted" };

export default function ActivityFeed({ items, onClose }: { items: FeedItem[]; onClose: () => void }) {
  return <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4" dir="rtl"><div className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#15171b] p-5 text-white shadow-2xl"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold"><Activity size={16} className="text-[#c7f36a]" />النشاط الأخير</div><button aria-label="إغلاق النشاط الأخير" onClick={onClose} className="rounded-lg p-2 text-white/45 hover:bg-white/[0.06] hover:text-white"><X size={16} /></button></div><div className="space-y-2">{items.length ? items.map((item) => <div key={item.id} className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"><span className={`mt-1 h-2 w-2 rounded-full ${item.tone === "lime" ? "bg-[#c7f36a]" : "bg-white/25"}`} /><div><div className="text-sm text-white/75">{item.label}</div><div className="mt-1 text-xs text-white/35">{item.detail}</div></div></div>) : <div className="rounded-xl border border-dashed border-white/[0.1] p-6 text-center text-sm text-white/35">لا توجد أحداث بعد.</div>}</div></div></div>;
}
