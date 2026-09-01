import { useEffect, useRef, useState } from "react";
import { Command, Library, Search, Settings2, Sparkles, X } from "lucide-react";

type Props = { onClose: () => void; onNewChat: () => void; onOpenSettings: () => void; onOpenPrompts: () => void; onOpenSearch: () => void; onOpenTools: () => void };

const commands = [
  { id: "new", label: "محادثة جديدة", hint: "⌘ N", icon: Sparkles },
  { id: "search", label: "بحث في المحادثات", hint: "⌘ /", icon: Search },
  { id: "tools", label: "فتح الأدوات الحديثة", hint: "⌘ ⇧ K", icon: Command },
  { id: "prompts", label: "مكتبة البرومبتات", hint: "⌘ P", icon: Library },
  { id: "settings", label: "إعدادات مساحة العمل", hint: "⌘ ,", icon: Settings2 },
] as const;

export default function GlobalCommandPalette({ onClose, onNewChat, onOpenSettings, onOpenPrompts, onOpenSearch, onOpenTools }: Props) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const shown = commands.filter((command) => command.label.includes(query));
  useEffect(() => { inputRef.current?.focus(); }, []);
  const run = (id: string) => { if (id === "new") onNewChat(); if (id === "search") onOpenSearch(); if (id === "tools") onOpenTools(); if (id === "prompts") onOpenPrompts(); if (id === "settings") onOpenSettings(); onClose(); };
  return <div className="fixed inset-0 z-50 grid place-items-start bg-black/55 px-4 pt-[16vh] backdrop-blur-sm" onMouseDown={onClose}>
    <div role="dialog" aria-modal="true" aria-label="لوحة أوامر TEXT.AI" className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-white/[0.12] bg-[#15171b] shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
      <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3"><Command size={16} className="text-[#c7f36a]" /><input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setIndex(0); }} onKeyDown={(event) => { if (!shown.length) return; if (event.key === "ArrowDown") { event.preventDefault(); setIndex((value) => Math.min(value + 1, shown.length - 1)); } if (event.key === "ArrowUp") { event.preventDefault(); setIndex((value) => Math.max(value - 1, 0)); } if (event.key === "Enter") { event.preventDefault(); run(shown[index].id); } if (event.key === "Escape") onClose(); }} placeholder="ماذا تريد أن تفعل؟" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30" /><button aria-label="إغلاق لوحة الأوامر" onClick={onClose} className="text-white/35 hover:text-white"><X size={16} /></button></div>
      <div className="p-2">{shown.length ? shown.map((command, commandIndex) => <button key={command.id} onClick={() => run(command.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right ${commandIndex === index ? "bg-[#c7f36a]/10 text-white" : "text-white/60 hover:bg-white/[0.04]"}`}><command.icon size={16} className={commandIndex === index ? "text-[#c7f36a]" : "text-white/35"} /><span className="flex-1 text-sm">{command.label}</span><kbd className="text-[10px] text-white/25">{command.hint}</kbd></button>) : <div className="px-3 py-8 text-center text-xs text-white/35">لا توجد أوامر مطابقة</div>}</div>
    </div>
  </div>;
}
