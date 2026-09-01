import { useMemo, useState } from "react";
import {
  Archive, AudioLines, Bot, Check, CheckCircle2, Code2, Command, Download, Eye, FileSearch,
  FolderKanban, Image, Keyboard, LayoutPanelTop, MessageSquare, Moon, PanelRight, Search,
  ShieldCheck, Sparkles, Square, Trash2, Upload, WandSparkles, X,
} from "lucide-react";
import { textAiTools, toolCategoryLabel, toolRequiresAvailableKeys, type TextAiTool, type ProviderKey } from "../../../shared/toolCatalog";

type FeatureIcon = typeof Search;

const iconByAction: Record<TextAiTool["action"], FeatureIcon> = {
  video: WandSparkles,
  image: Image,
  audio: AudioLines,
  analysis: FileSearch,
  chat: MessageSquare,
  agent: Bot,
  developer: Code2,
  research: Search,
};

const categoryOrder: TextAiTool["category"][] = ["media", "agents", "workspace", "developer", "research"];

type ModernToolsPanelProps = {
  onClose: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onOpenPrompts: () => void;
  onOpenSearch: () => void;
  onOpenTools: () => void;
  providerStatus: { openai?: boolean; openrouter?: boolean; huggingface?: boolean };
  onSelectTool: (tool: TextAiTool) => void;
};

export default function ModernToolsPanel({ onClose, onNewChat, onOpenSettings, onOpenPrompts, onOpenSearch, onOpenTools, providerStatus, onSelectTool }: ModernToolsPanelProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | TextAiTool["category"]>("all");
  const availableKeys: Partial<Record<ProviderKey, boolean>> = {
    OPENAI_API_KEY: providerStatus.openai,
    OPENROUTER_API_KEY: providerStatus.openrouter,
    HF_TOKEN: providerStatus.huggingface,
  };
  const shown = useMemo(() => textAiTools.filter((tool) => {
    const matchesQuery = `${tool.name} ${tool.description} ${tool.categoryLabel}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === "all" || tool.category === category);
  }), [category, query]);
  const readyCount = textAiTools.filter((tool) => toolRequiresAvailableKeys(tool, availableKeys)).length;

  return <div className="absolute left-4 right-4 top-[82px] z-30 mx-auto max-w-[780px] rounded-2xl border border-white/[0.1] bg-[#15171b]/95 p-4 shadow-2xl backdrop-blur-xl sm:left-auto sm:right-7 sm:w-[620px]">
    <div className="mb-4 flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-sm font-semibold"><Sparkles size={15} className="text-[#c7f36a]" /> كتالوج أدوات TEXT.AI</div><div className="mt-1 text-[10px] text-white/35">{readyCount} من {textAiTools.length} أداة جاهزة وفق مفاتيح الخادم الحالية</div></div><button aria-label="إغلاق كتالوج الأدوات" onClick={onClose} className="rounded-lg p-2 text-white/35 hover:bg-white/[0.06] hover:text-white"><X size={15} /></button></div>
    <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2"><Search size={14} className="text-white/30" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن أداة أو فئة..." aria-label="البحث في كتالوج الأدوات" className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/25" /><span className="text-[10px] text-white/30">{shown.length}</span></div>
    <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1"><button onClick={() => setCategory("all")} className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[10px] ${category === "all" ? "bg-[#c7f36a] text-[#10120e]" : "bg-white/[0.05] text-white/50 hover:text-white"}`}>الكل · {textAiTools.length}</button>{categoryOrder.map((item) => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[10px] ${category === item ? "bg-[#c7f36a] text-[#10120e]" : "bg-white/[0.05] text-white/50 hover:text-white"}`}>{toolCategoryLabel(item)}</button>)}</div>
    <div className="grid max-h-[430px] grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2">{shown.length ? shown.map((tool) => { const Icon = iconByAction[tool.action]; const ready = toolRequiresAvailableKeys(tool, availableKeys); return <button key={tool.slug} onClick={() => onSelectTool(tool)} className="flex min-h-[76px] items-start gap-3 rounded-xl border border-transparent px-3 py-2.5 text-right transition hover:border-white/[0.08] hover:bg-white/[0.04]"><span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${ready ? "bg-[#c7f36a]/15 text-[#c7f36a]" : "bg-white/[0.06] text-white/35"}`}><Icon size={14} /></span><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate text-xs text-white/75">{tool.id}. {tool.name}</span>{ready ? <CheckCircle2 size={12} className="shrink-0 text-[#c7f36a]" /> : <span className="shrink-0 text-[9px] text-amber-200/60">مفتاح ناقص</span>}</span><span className="mt-1 block text-[10px] leading-4 text-white/35">{tool.description}</span><span className="mt-1 block truncate text-[9px] text-white/25">{tool.requiredKeys.join(" · ")}</span></span></button>; }) : <div className="col-span-full rounded-xl border border-dashed border-white/[0.1] p-6 text-center text-xs text-white/35">لا توجد أدوات مطابقة لبحثك.</div>}</div>
    <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.07] pt-3"><button onClick={() => setCommandOpen((value) => !value)} className="flex items-center gap-2 rounded-lg bg-[#c7f36a] px-3 py-2 text-[11px] font-semibold text-[#10120e]"><Command size={13} /> لوحة الأوامر</button><button onClick={onOpenSettings} className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-[11px] text-white/55 hover:bg-white/[0.05]"><FolderKanban size={13} /> إعدادات المفاتيح</button><button onClick={onOpenPrompts} className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-[11px] text-white/55 hover:bg-white/[0.05]"><WandSparkles size={13} /> قوالب الموجهات</button></div>
    {commandOpen && <div className="mt-3 rounded-xl border border-[#c7f36a]/20 bg-[#c7f36a]/[0.06] p-3 text-xs text-[#e4f7ba]"><div className="mb-2 font-semibold">اختصارات قابلة للتنفيذ</div><button onClick={onNewChat} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-right text-white/65 hover:bg-white/[0.06]"><span>محادثة جديدة</span><kbd>⌘ N</kbd></button><button onClick={onOpenSettings} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-right text-white/65 hover:bg-white/[0.06]"><span>فتح الإعدادات</span><kbd>⌘ ,</kbd></button><button onClick={onOpenPrompts} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-right text-white/65 hover:bg-white/[0.06]"><span>فتح مكتبة البرومبتات</span><kbd>⌘ P</kbd></button><button onClick={onOpenSearch} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-right text-white/65 hover:bg-white/[0.06]"><span>بحث في المحادثات</span><kbd>⌘ /</kbd></button><button onClick={onOpenTools} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-right text-white/65 hover:bg-white/[0.06]"><span>فتح كتالوج الأدوات</span><kbd>⌘ ⇧ K</kbd></button></div>}
  </div>;
}
