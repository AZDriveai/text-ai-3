import { Archive, X } from "lucide-react";

export type SavedOutput = { id: string; content: string; createdAt: number };

export function SavedOutputsPanel({ items, onClose, onOpen, onRemove }: { items: SavedOutput[]; onClose: () => void; onOpen: (item: SavedOutput) => void; onRemove: (id: string) => void }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4" dir="rtl">
      <div className="w-full max-w-xl rounded-2xl border border-white/[0.1] bg-[#15171b] p-5 text-white shadow-2xl">
        <div className="mb-4 flex items-center justify-between"><div><div className="flex items-center gap-2 text-sm font-semibold"><Archive size={16} className="text-[#c7f36a]" />المخرجات المحفوظة</div><p className="mt-1 text-xs text-white/35">مساحة قراءة لاحقة محلية على هذا الجهاز.</p></div><button aria-label="إغلاق المخرجات المحفوظة" onClick={onClose} className="rounded-lg p-2 text-white/45 hover:bg-white/[0.06] hover:text-white"><X size={16} /></button></div>
        <div className="max-h-[55vh] space-y-2 overflow-y-auto">{items.length ? items.map((item) => <div key={item.id} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"><button onClick={() => onOpen(item)} className="block w-full text-right text-sm leading-6 text-white/75 hover:text-white">{item.content.slice(0, 220)}{item.content.length > 220 ? "…" : ""}</button><div className="mt-2 flex items-center justify-between text-[10px] text-white/30"><span>{new Date(item.createdAt).toLocaleString("ar")}</span><button aria-label="إزالة المخرج المحفوظ" onClick={() => onRemove(item.id)} className="text-red-200/60 hover:text-red-100">إزالة</button></div></div>) : <div className="rounded-xl border border-dashed border-white/[0.1] p-6 text-center text-sm text-white/35">لا توجد مخرجات محفوظة بعد.</div>}</div>
      </div>
    </div>
  );
}
