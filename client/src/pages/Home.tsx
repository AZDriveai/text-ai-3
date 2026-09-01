import { useEffect, useMemo, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import {
  Activity,
  Archive,
  ArrowUp,
  AudioLines,
  ChevronDown,
  Copy,
  FileSearch,
  ImagePlus,
  Images,
  Library,
  Mic,
  Square,
  Menu,
  MessageSquarePlus,
  MoreHorizontal,
  Paperclip,
  PanelLeftClose,
  Pencil,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  WandSparkles,
  X,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import ModernToolsPanel from "@/components/ModernToolsPanel";
import GlobalCommandPalette from "@/components/GlobalCommandPalette";
import { SavedOutputsPanel, type SavedOutput } from "@/components/SavedOutputsPanel";
import ActivityFeed from "@/components/ActivityFeed";
import { clearTextAiLocalData } from "../../../shared/privacy";
import { buildWorkspaceExport } from "../../../shared/workspaceExport";
import { buildActivityItems, createActivityEvent, type ActivityEvent, type ActivityKind } from "../../../shared/activity";
import { deriveConversationTitle } from "../../../shared/conversationTitles";
import { restoreActiveConversation } from "../../../shared/conversationPersistence";
import type { TextAiProvider } from "../../../shared/promptTemplates";
import { extractPromptVariables, fillPromptTemplate } from "../../../shared/promptPresets";
import { textAiTools, toolCategoryLabel, toolRequiresAvailableKeys, type TextAiTool, type ProviderKey } from "../../../shared/toolCatalog";

type Provider = "OpenAI" | "OpenRouter" | "Hugging Face";
type Persona = "sarcastic" | "enthusiastic" | "balanced";

const providerKeyForName = (name: Provider): TextAiProvider => name === "OpenAI" ? "openai" : name === "OpenRouter" ? "openrouter" : "huggingface";
const fallbackModels: Record<TextAiProvider, string[]> = {
  openai: ["gpt-5", "gpt-5-mini", "gpt-4.1"],
  openrouter: ["openrouter/auto", "deepseek/deepseek-r1", "qwen/qwen-2.5-72b-instruct"],
  huggingface: ["meta-llama/Llama-3.3-70B-Instruct", "Qwen/Qwen2.5-72B-Instruct", "mistralai/Mistral-Large-Instruct-2411"],
};
function preferredModel(models: string[], provider: TextAiProvider) {
  const preferred = provider === "openai" ? models.find((id) => id.startsWith("gpt-5") || id === "gpt-4.1") : provider === "openrouter" ? models.find((id) => id === "openrouter/auto" || id.includes("gpt-5") || id.includes("deepseek")) : models.find((id) => /instruct|chat/i.test(id));
  return preferred ?? models[0] ?? fallbackModels[provider][0];
}

type Conversation = { id: string; title: string; attachments?: AttachmentRef[]; pinned?: boolean; archived?: boolean; messages?: ChatMessage[]; manuallyNamed?: boolean; titleGenerated?: boolean };
type AttachmentRef = { name: string; key: string; url: string; type: string };

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  tool?: string;
  metadata?: string;
};

const providers: { name: Provider; mark: string; tone: string; models: string[] }[] = [
  { name: "OpenAI", mark: "O", tone: "emerald", models: fallbackModels.openai },
  { name: "OpenRouter", mark: "↗", tone: "violet", models: fallbackModels.openrouter },
  { name: "Hugging Face", mark: "HF", tone: "amber", models: fallbackModels.huggingface },
];

const personas: { id: Persona; label: string; description: string; icon: string }[] = [
  { id: "balanced", label: "TEXT.AI المتزن", description: "واضح، عملي، ويصرّح بحدود المعرفة.", icon: "✦" },
  { id: "sarcastic", label: "الساخر", description: "ذكاء لاذع دون إساءة أو تنمّر.", icon: "⌁" },
  { id: "enthusiastic", label: "الحماسي", description: "طاقة عالية، خطوات عملية، وتشجيع مستمر.", icon: "✹" },
];

const starterMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content: "مرحباً، أنا **TEXT.AI**. مساحة واحدة تجمع التفكير، البحث، الإبداع، والتنفيذ — مع تحكم كامل في النموذج والنبرة.\n\nاختر شخصية أو اكتب ما يدور في بالك، وسأبدأ معك من حيث أنت.",
  },
];

const promptPresets = [{ name: "موجز تنفيذي", template: "لخّص {{الموضوع}} في نقاط تنفيذية مع المخاطر والقرار المقترح." }, { name: "خطة إطلاق", template: "أنشئ خطة إطلاق لـ {{المنتج}} خلال {{المدة}} مع مؤشرات نجاح." }, { name: "مراجعة كود", template: "راجع هذا الكود من ناحية الأمان والأداء وقابلية الاختبار: {{الكود}}" }];

const promptCards = [
  { title: "مخطط منتج", tag: "Builder", detail: "حوّل الفكرة إلى نطاق عمل ومراحل قابلة للتنفيذ.", icon: "▦" },
  { title: "مراجع الكود", tag: "Code", detail: "افحص المخاطر، الاختبارات، وقابلية الصيانة.", icon: "⌘" },
  { title: "مستكشف عميق", tag: "Research", detail: "ابنِ خريطة مصادر وأسئلة قبل صياغة النتيجة.", icon: "◌" },
];

export default function Home() {
  const { user } = useAuth();
  const { theme, setTheme, reducedMotion, setReducedMotion, highContrast, setHighContrast, fontScale, setFontScale } = useTheme();
  const providerStatusQuery = trpc.ai.providerStatus.useQuery();
  const providerModelsQuery = trpc.ai.providerModels.useQuery();
  const dataProviderStatusQuery = trpc.ai.dataProviderStatus.useQuery();
  const promptTemplatesQuery = trpc.ai.promptTemplates.useQuery();
  const chatMutation = trpc.ai.chat.useMutation();
  const uploadAttachmentMutation = trpc.ai.uploadAttachment.useMutation();
  const generateImageMutation = trpc.ai.generateImage.useMutation();
  const transcribeAudioMutation = trpc.ai.transcribeAudio.useMutation();
  const summarizeTranscriptMutation = trpc.ai.summarizeTranscript.useMutation();
  const analyzeContentMutation = trpc.ai.analyzeContent.useMutation();
  const [provider, setProvider] = useState<Provider>("OpenAI");
  const [model, setModel] = useState("gpt-5");
  const [persona, setPersona] = useState<Persona>("balanced");
  const [reasoningDepth, setReasoningDepth] = useState<"minimal" | "low" | "medium" | "high">("low");
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [draft, setDraft] = useState("");
  const [showSidebar, setShowSidebar] = useState(() => window.innerWidth >= 1024);
  const [showSettings, setShowSettings] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [promptQuery, setPromptQuery] = useState("");
  const [modelQuery, setModelQuery] = useState("");
  const [selectedPromptPreset, setSelectedPromptPreset] = useState<typeof promptPresets[number] | null>(null);
  const [promptVariableValues, setPromptVariableValues] = useState<Record<string, string>>(() => { try { return JSON.parse(window.localStorage.getItem("textai-prompt-variables") ?? "{}"); } catch { return {}; } });
  const [showModernTools, setShowModernTools] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([{ id: "design", title: "جلسة تصميم TEXT.AI", attachments: [], pinned: true, manuallyNamed: false, titleGenerated: false }, { id: "launch", title: "خطة إطلاق المنتج", attachments: [], manuallyNamed: true, titleGenerated: true }, { id: "content", title: "أفكار محتوى عربي", attachments: [], manuallyNamed: true, titleGenerated: true }]);
  const [activeConversationId, setActiveConversationId] = useState(() => window.localStorage.getItem("textai-active-conversation") ?? "design");
  const [conversationQuery, setConversationQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [activeConversationIndex, setActiveConversationIndex] = useState(0);
  const generationToken = useRef(0);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [generationPending, setGenerationPending] = useState(false);
  const conversationSearchRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<AttachmentRef[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [generatedImages, setGeneratedImages] = useState<Array<{ id: string; url: string; prompt: string; createdAt: number }>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<"idle" | "recording" | "ready" | "error">("idle");
  const [showGallery, setShowGallery] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; prompt: string } | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [comparePrompt, setComparePrompt] = useState("");
  const [comparisonResults, setComparisonResults] = useState<Array<{ provider: string; model: string; content: string }>>([]);
  const [compareLeftProvider, setCompareLeftProvider] = useState<TextAiProvider>("openai");
  const [compareRightProvider, setCompareRightProvider] = useState<TextAiProvider>("openrouter");
  const [compareLeftModel, setCompareLeftModel] = useState("gpt-5");
  const [compareRightModel, setCompareRightModel] = useState("openrouter/auto");
  const [comparisonPending, setComparisonPending] = useState(false);
  const [comparisonError, setComparisonError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const [lastTranscript, setLastTranscript] = useState("");
  const [savedOutputs, setSavedOutputs] = useState<SavedOutput[]>([]);
  const [showSavedOutputs, setShowSavedOutputs] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityEvent[]>([]);
  const [feedbackByMessage, setFeedbackByMessage] = useState<Record<number, "useful" | "notUseful">>({});
  const [uploadingFile, setUploadingFile] = useState("");
  const [attachmentStates, setAttachmentStates] = useState<Record<string, { status: "uploading" | "success" | "error"; error?: string }>>({});
  const allowedAttachmentTypes = ["application/pdf", "text/plain", "text/markdown", "text/csv", "application/json"];
  const isAttachmentAllowed = (file: File) => file.type.startsWith("image/") || file.type.startsWith("audio/") || allowedAttachmentTypes.includes(file.type);

  useEffect(() => {
    const savedActivity = window.localStorage.getItem("textai-activity");
    if (savedActivity) { try { setActivityLog(JSON.parse(savedActivity)); } catch { window.localStorage.removeItem("textai-activity"); } }
    const savedItems = window.localStorage.getItem("textai-saved-responses");
    if (savedItems) { try { setSavedOutputs(JSON.parse(savedItems) as SavedOutput[]); } catch { window.localStorage.removeItem("textai-saved-responses"); } }
    const savedDraft = window.localStorage.getItem("textai-draft");
    if (savedDraft) setDraft(savedDraft);
    const savedAttachments = window.localStorage.getItem("textai-attachments");
    if (savedAttachments) { try { setAttachments(JSON.parse(savedAttachments) as AttachmentRef[]); } catch { window.localStorage.removeItem("textai-attachments"); } }
    const savedConversations = window.localStorage.getItem("textai-conversations");
    if (savedConversations) {
      try { const parsed = JSON.parse(savedConversations) as Conversation[]; if (Array.isArray(parsed) && parsed.every((item) => item?.id && item?.title)) { setConversations(parsed); const restored = restoreActiveConversation(parsed, activeConversationId); if (restored.activeId !== activeConversationId) setActiveConversationId(restored.activeId); if (restored.active?.messages) setMessages(restored.active.messages as ChatMessage[]); if (restored.active?.attachments) setAttachments(restored.active.attachments as AttachmentRef[]); } } catch { window.localStorage.removeItem("textai-conversations"); }
    }
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setShowCommandPalette(true); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") { event.preventDefault(); createNewConversation(); }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  useEffect(() => {
    if (draft) window.localStorage.setItem("textai-draft", draft);
    else window.localStorage.removeItem("textai-draft");
  }, [draft]);

  useEffect(() => {
    window.localStorage.setItem("textai-conversations", JSON.stringify(conversations));
  }, [conversations]);
  useEffect(() => { window.localStorage.setItem("textai-active-conversation", activeConversationId); }, [activeConversationId]);

  useEffect(() => {
    if (attachments.length) window.localStorage.setItem("textai-attachments", JSON.stringify(attachments));
    else window.localStorage.removeItem("textai-attachments");
  }, [attachments]);

  const visibleConversations = conversations.filter((conversation) => (showArchived ? Boolean(conversation.archived) : !conversation.archived) && conversation.title.includes(conversationQuery)).sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
  const activityItems = buildActivityItems({ messages: messages.length, attachments: attachments.length }, activityLog, savedOutputs, conversations.filter((item) => item.pinned).map((item) => item.title));
  const selectedProvider = providers.find((item) => item.name === provider) ?? providers[0];
  const selectedPersona = personas.find((item) => item.id === persona) ?? personas[0];
  const providerKey = providerKeyForName(provider);
  const providerAvailable = providerStatusQuery.data?.[providerKey] ?? false;
  const liveModelIds = providerModelsQuery.data?.[providerKey]?.models.map((item) => item.id).filter(Boolean) ?? [];
  const selectedModelIds = liveModelIds.length ? liveModelIds : fallbackModels[providerKey];
  const filteredModelIds = selectedModelIds.filter((item) => item.toLowerCase().includes(modelQuery.toLowerCase()));
  const availableKeys: Partial<Record<ProviderKey, boolean>> = {
    OPENAI_API_KEY: providerStatusQuery.data?.openai,
    OPENROUTER_API_KEY: providerStatusQuery.data?.openrouter,
    HF_TOKEN: providerStatusQuery.data?.huggingface,
  };
  const readyToolCount = textAiTools.filter((tool) => toolRequiresAvailableKeys(tool, availableKeys)).length;
  const canSearch = Boolean(dataProviderStatusQuery.data?.search);
  const canDeepSearch = Boolean(dataProviderStatusQuery.data?.deepSearch);
  const promptTemplates = promptTemplatesQuery.data ?? [];
  const filteredPromptTemplates = promptTemplates.filter((template) => `${template.title} ${template.description} ${template.family}`.toLowerCase().includes(promptQuery.toLowerCase()));
  const promptCount = promptTemplates.length;
  const activeTemplateId = persona === "sarcastic" ? "textai-sarcastic-persona" : persona === "enthusiastic" ? "textai-enthusiastic-persona" : "textai-general-assistant";

  useEffect(() => {
    const nextModel = preferredModel(selectedModelIds, providerKey);
    setModel((current) => selectedModelIds.includes(current) ? current : nextModel);
  }, [providerKey, selectedModelIds.join("|")]);

  const suggestions = useMemo(() => [
    "صمّم لي خطة إطلاق ذكية خلال 30 يوماً",
    "حلّل هذا المستند واستخرج أهم القرارات",
    "اكتب نسخة عربية جريئة لصفحة هبوط",
  ], []);

  function recordActivity(kind: ActivityKind, detail: string) { setActivityLog((current) => [...current, createActivityEvent(kind, detail)]); }
  function selectCatalogTool(tool: TextAiTool) {
    if (!toolRequiresAvailableKeys(tool, availableKeys)) {
      setActiveTool(`${tool.name} — يحتاج: ${tool.requiredKeys.join(" · ")}`);
      setShowModernTools(false);
      return;
    }
    setShowModernTools(false);
    if (tool.action === "image") { setMediaError(""); setActiveTool("توليد صورة"); return; }
    if (tool.action === "analysis") { setMediaError(""); setActiveTool("تحليل مرئي ونصي"); return; }
    if (tool.action === "audio") { setMediaError(""); setActiveTool("تحويل الصوت إلى نص"); return; }
    if (tool.action === "research" && canSearch) { setActiveTool(tool.name); return; }
    setActiveTool(`وضع ${tool.name}`);
    setDraft((current) => current || `أريد استخدام ${tool.name}. ابدأ بتجهيز الخطوات والمدخلات المطلوبة بالعربية.`);
  }
  function usePromptPreset(preset: typeof promptPresets[number]) { setSelectedPromptPreset(preset); }
  async function runComparison() { const prompt = comparePrompt.trim(); if (!prompt || comparisonPending) return; const left = providers.find((item) => providerKeyForName(item.name) === compareLeftProvider) ?? providers[0]; const right = providers.find((item) => providerKeyForName(item.name) === compareRightProvider) ?? providers[1] ?? providers[0]; const leftModels = providerModelsQuery.data?.[compareLeftProvider]?.models.map((item) => item.id).filter(Boolean) ?? fallbackModels[compareLeftProvider]; const rightModels = providerModelsQuery.data?.[compareRightProvider]?.models.map((item) => item.id).filter(Boolean) ?? fallbackModels[compareRightProvider]; const leftModel = leftModels.includes(compareLeftModel) ? compareLeftModel : preferredModel(leftModels, compareLeftProvider); const rightModel = rightModels.includes(compareRightModel) ? compareRightModel : preferredModel(rightModels, compareRightProvider); setComparisonResults([]); setComparisonError(""); setComparisonPending(true); try { const [primary, secondary] = await Promise.all([chatMutation.mutateAsync({ provider: compareLeftProvider, model: leftModel, templateId: activeTemplateId, messages: [{ role: "user", content: prompt }], extraInstruction: "أجب للمقارنة الجانبية باختصار ووضوح." }), chatMutation.mutateAsync({ provider: compareRightProvider, model: rightModel, templateId: activeTemplateId, messages: [{ role: "user", content: prompt }], extraInstruction: "أجب للمقارنة الجانبية باختصار ووضوح." })]); setComparisonResults([{ provider: left.name, model: leftModel, content: primary.content }, { provider: right.name, model: rightModel, content: secondary.content }]); } catch (error) { setComparisonError(error instanceof Error ? error.message : "تعذرت المقارنة."); } finally { setComparisonPending(false); } }
  function applyPromptPreset() { if (!selectedPromptPreset) return; const filled = fillPromptTemplate(selectedPromptPreset.template, promptVariableValues); setPromptVariableValues((current) => ({ ...current })); window.localStorage.setItem("textai-prompt-variables", JSON.stringify(promptVariableValues)); setDraft(filled); setSelectedPromptPreset(null); setShowPrompts(false); }
  function createNewConversation() { const id = `conversation-${Date.now()}`; const next = { id, title: "محادثة جديدة", attachments: [], pinned: false, manuallyNamed: false, titleGenerated: false, messages: starterMessages }; setConversations((current) => [next, ...current]); setActiveConversationId(id); setMessages(starterMessages); setAttachments([]); setDraft(""); }
  function cancelGeneration() { generationToken.current += 1; setGenerationPending(false); setActiveTool("تم إلغاء التوليد"); }
  function editAndResend(message: ChatMessage) { setEditingMessageId(message.id); setDraft(message.content); window.setTimeout(() => sendMessage(message.content, message.id), 0); }
  function regenerateFromMessage(message: ChatMessage) { const messageIndex = messages.findIndex((item) => item.id === message.id); const previousUser = messages.slice(0, messageIndex).reverse().find((item) => item.role === "user"); if (previousUser) { window.setTimeout(() => sendMessage(previousUser.content, previousUser.id), 0); } }
  function branchFromMessage(message: ChatMessage) { const id = `branch-${Date.now()}`; const next = { id, title: `فرع: ${message.content.slice(0, 28)}`, attachments: [...attachments], pinned: false, manuallyNamed: true, titleGenerated: true, messages: messages.slice(0, messages.findIndex((item) => item.id === message.id) + 1) }; setConversations((current) => [next, ...current]); setActiveConversationId(id); setMessages(next.messages); }


  function appendMessage(message: ChatMessage) { setMessages((current) => { const next = [...current, message]; setConversations((conversations) => conversations.map((conversation) => conversation.id === activeConversationId ? { ...conversation, messages: next } : conversation)); return next; }); }

  function retryTranscriptSummary() {
    if (!lastTranscript || summarizeTranscriptMutation.isPending) return;
    setMediaError(""); setActiveTool("جارٍ إعادة تلخيص التسجيل...");
    summarizeTranscriptMutation.mutate({ provider: providerKey, model, transcript: lastTranscript }, { onSuccess: (summary) => { setActiveTool("تمت إعادة تلخيص التسجيل"); recordActivity("summary", (summary.content || "").slice(0, 100)); appendMessage({ id: Date.now(), role: "assistant", tool: "تلخيص التسجيل", content: summary.content || "تعذر استخراج ملخص." }); }, onError: (error) => { setMediaError(`تعذرت إعادة المحاولة: ${error.message}`); setActiveTool("تلخيص التسجيل — أعد المحاولة"); } });
  }

  function sendMessage(text = draft, overrideEditingMessageId: number | null = editingMessageId, forcedTool?: string) {
    const value = text.trim();
    if (!value || generationPending || generateImageMutation.isPending || transcribeAudioMutation.isPending || summarizeTranscriptMutation.isPending || analyzeContentMutation.isPending) return;
    const nextId = Date.now();
    const requestToken = generationToken.current;
    const editableIndex = overrideEditingMessageId === null ? -1 : messages.findIndex((item) => item.id === overrideEditingMessageId);
    const baseMessages = editableIndex >= 0 ? messages.slice(0, editableIndex) : messages;
    const history = [...baseMessages, { id: nextId, role: "user" as const, content: value }];
    setMessages(history); setConversations((current) => current.map((conversation) => { const shouldGenerateTitle = !conversation.manuallyNamed && !conversation.titleGenerated && !messages.some((message) => message.role === "user"); return conversation.id === activeConversationId ? { ...conversation, title: deriveConversationTitle(conversation.title, messages, value, conversation.manuallyNamed, conversation.titleGenerated), titleGenerated: conversation.titleGenerated || shouldGenerateTitle, messages: history } : conversation; }));
    setDraft("");
    setEditingMessageId(null);
    setGenerationPending(true);
    const tool = forcedTool ?? activeTool ?? undefined;
    if (tool === "تحويل الصوت إلى نص") {
      const audio = attachments.find((attachment) => attachment.type.startsWith("audio/"));
      if (!audio) { setGenerationPending(false); setActiveTool("أرفق ملفاً صوتياً أولاً"); return; }
      setActiveTool(null);
      transcribeAudioMutation.mutate({ audioUrl: audio.url, language: "ar" }, { onSuccess: (result) => { setRecordingStatus("ready"); const text = "text" in result ? result.text : ""; setLastTranscript(text); setDraft(text); recordActivity("transcription", text.slice(0, 100)); appendMessage({ id: nextId + 1, role: "assistant", tool: "تفريغ صوت", content: text || "لم يُستخرج نص من التسجيل." }); if (text) { setActiveTool("جارٍ تلخيص التسجيل..."); summarizeTranscriptMutation.mutate({ provider: providerKey, model, transcript: text }, { onSuccess: (summary) => { setActiveTool("تم تلخيص التسجيل"); recordActivity("summary", (summary.content || "").slice(0, 100)); appendMessage({ id: nextId + 2, role: "assistant", tool: "تلخيص التسجيل", content: summary.content || "تعذر استخراج ملخص." }); }, onError: (error) => { setMediaError(`تعذر تلخيص التسجيل: ${error.message}`); setActiveTool("تلخيص التسجيل — أعد المحاولة"); } }); } }, onError: (error) => { setRecordingStatus("error"); setMediaError(`تعذر تفريغ التسجيل: ${error.message}`); setActiveTool("تحويل الصوت إلى نص — أعد المحاولة"); appendMessage({ id: nextId + 1, role: "assistant", content: `تعذر تفريغ التسجيل. **${error.message}**` }); } });
      return;
    }
    if (activeTool === "تحليل مرئي ونصي") {
      if (!attachments.length) { setGenerationPending(false); setActiveTool("أرفق ملفاً للتحليل أولاً"); return; }
      setActiveTool(null);
      analyzeContentMutation.mutate({ provider: providerKey, model, prompt: value, attachments: attachments.map(({ name, url, type }) => ({ name, url, contentType: type || "application/octet-stream" })) }, { onSuccess: (result) => { recordActivity("chat", `تحليل: ${value.slice(0, 80)}`); appendMessage({ id: nextId + 1, role: "assistant", tool: "تحليل مرئي ونصي", content: result.content || "تعذر تحليل المرفقات." }); }, onError: (error) => { setMediaError(`تعذر تحليل المرفق: ${error.message}`); setActiveTool("تحليل مرئي ونصي — أعد المحاولة"); } });
      return;
    }
    if (activeTool === "توليد صورة") {
      setActiveTool(null);
      generateImageMutation.mutate({ prompt: value }, { onSuccess: (result) => { const imageUrl = result.url; if (imageUrl) setGeneratedImages((current) => [{ id: crypto.randomUUID(), url: imageUrl, prompt: value, createdAt: Date.now() }, ...current]); recordActivity("image", value.slice(0, 100)); appendMessage({ id: nextId + 1, role: "assistant", tool: "توليد صورة", content: `![صورة مولدة بواسطة TEXT.AI](${result.url})` }); }, onError: (error) => { setMediaError(`تعذر توليد الصورة: ${error.message}`); setActiveTool("توليد صورة — أعد المحاولة"); appendMessage({ id: nextId + 1, role: "assistant", content: `تعذر توليد الصورة. **${error.message}**` }); } });
      setDraft("");
      return;
    }
    setActiveTool(null);
    chatMutation.mutate({
      provider: providerKey,
      model,
      templateId: activeTemplateId,
      messages: history.filter((item) => item.id !== 1).map(({ role, content }) => ({ role, content })),
      attachments: attachments.map(({ name, url, type }) => ({ name, url, contentType: type || "application/octet-stream" })),
      reasoningDepth,
    }, {
      onSuccess: (result) => { setGenerationPending(false); if (requestToken !== generationToken.current) return; recordActivity("chat", value.slice(0, 100)); setConversations((current) => current.map((conversation) => conversation.id === activeConversationId ? { ...conversation, attachments: [...(conversation.attachments ?? []), ...attachments] } : conversation)); setAttachments([]); appendMessage({ id: nextId + 1, role: "assistant", tool, metadata: `${result.provider} · ${result.model} · ${result.latencyMs ?? "—"}ms · نحو ${result.tokenEstimate ?? "—"} رمزاً`, content: result.content || "لم يُرجع المزود نصاً." }); },
      onError: (error) => { setGenerationPending(false); if (requestToken !== generationToken.current) return; appendMessage({ id: nextId + 1, role: "assistant", content: `تعذر الاتصال بالمزود المختار. **${error.message}**\n\nتحقق من وجود مفتاح الخادم أو اختر مزوداً متاحاً.` }); },
    });
  }

  async function copyResponse(content: string) { await navigator.clipboard?.writeText(content); }
  function downloadResponse(content: string) { const blob = new Blob([content], { type: "text/markdown;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `textai-response-${Date.now()}.md`; anchor.click(); URL.revokeObjectURL(url); }
  function extractCodeBlocks(content: string) { return Array.from(content.matchAll(/```([\\w+-]*)\\n([\\s\\S]*?)```/g)).map((match, index) => ({ id: `${index}-${match.index ?? 0}`, language: match[1] || "text", code: match[2] })); }
  function downloadCodeBlock(code: string, language: string) { const extension = language === "typescript" || language === "ts" ? "ts" : language === "javascript" || language === "js" ? "js" : language === "python" ? "py" : "txt"; const blob = new Blob([code], { type: "text/plain;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `textai-code-${Date.now()}.${extension}`; anchor.click(); URL.revokeObjectURL(url); }
  function saveResponse(content: string) { setSavedOutputs((current) => [...current, { id: crypto.randomUUID(), content, createdAt: Date.now() }]); }
  function setMessageFeedback(messageId: number, value: "useful" | "notUseful") { setFeedbackByMessage((current) => ({ ...current, [messageId]: value })); const records = JSON.parse(window.localStorage.getItem("textai-feedback") ?? "[]") as Array<{ messageId: number; value: string; createdAt: number }>; window.localStorage.setItem("textai-feedback", JSON.stringify([...records, { messageId, value, createdAt: Date.now() }])); }
  function removeSavedOutput(id: string) { setSavedOutputs((current) => current.filter((item) => item.id !== id)); }
  function openSavedOutput(item: SavedOutput) { setDraft(item.content); setShowSavedOutputs(false); }
  useEffect(() => { window.localStorage.setItem("textai-saved-responses", JSON.stringify(savedOutputs)); }, [savedOutputs]);
  useEffect(() => { window.localStorage.setItem("textai-activity", JSON.stringify(activityLog.slice(-30))); }, [activityLog]);

  function exportWorkspace() { const blob = new Blob([JSON.stringify(buildWorkspaceExport(conversations, activeConversationId, messages, savedOutputs), null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "textai-workspace.json"; link.click(); URL.revokeObjectURL(url); }

  function toggleConversationPinned(conversation: Conversation) { setConversations((current) => current.map((item) => item.id === conversation.id ? { ...item, pinned: !item.pinned } : item)); }
  function toggleConversationArchived(conversation: Conversation) { setConversations((current) => current.map((item) => item.id === conversation.id ? { ...item, archived: true } : item)); }
  function restoreConversation(conversation: Conversation) { setConversations((current) => current.map((item) => item.id === conversation.id ? { ...item, archived: false } : item)); }

  function openConversation(conversation: Conversation, index: number) {
    setActiveConversationIndex(index); setActiveConversationId(conversation.id); setAttachments(conversation.attachments ?? []); setMessages(conversation.messages ?? starterMessages);
  }

  function renameConversation(currentConversation: Conversation) {
    const nextName = window.prompt("اسم المحادثة الجديد", currentConversation.title)?.trim();
    if (nextName) setConversations((current) => current.map((conversation) => conversation.id === currentConversation.id ? { ...conversation, title: nextName, manuallyNamed: true, titleGenerated: true } : conversation));
  }

  async function toggleRecording() {
    if (isRecording) { mediaRecorderRef.current?.stop(); setIsRecording(false); setRecordingStatus("ready"); setActiveTool("تم التسجيل — اختر تفريغ الصوت"); return; }
    if (!navigator.mediaDevices?.getUserMedia) { setMediaError("التسجيل الصوتي غير مدعوم في هذا المتصفح."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordingChunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) recordingChunksRef.current.push(event.data); };
      recorder.onstop = async () => { stream.getTracks().forEach((track) => track.stop()); const blob = new Blob(recordingChunksRef.current, { type: recorder.mimeType || "audio/webm" }); const file = new File([blob], `textai-recording-${Date.now()}.webm`, { type: blob.type }); await handleAttachment(file); };
      mediaRecorderRef.current = recorder; recorder.start(); setIsRecording(true); setRecordingStatus("recording"); setMediaError("");
    } catch (error) { setRecordingStatus("error"); setMediaError(error instanceof Error ? error.message : "تعذر بدء التسجيل."); }
  }

  async function handleAttachment(file: File) {
    if (file.size > 6_000_000) { setUploadError(`الملف ${file.name} يتجاوز 6MB.`); return; }
    if (!isAttachmentAllowed(file)) { setUploadError(`نوع الملف ${file.type || "غير معروف"} غير مدعوم.`); return; }
    if (!user) { setUploadError("سجّل الدخول أولاً لرفع الملفات بأمان."); return; }
    setUploadError(""); setUploading(true); setUploadingFile(file.name); setAttachmentStates((current) => ({ ...current, [file.name]: { status: "uploading" } }));
    try {
      const dataBase64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(",")[1] ?? ""); reader.onerror = reject; reader.readAsDataURL(file); });
      const result = await uploadAttachmentMutation.mutateAsync({ fileName: file.name, contentType: file.type || "application/octet-stream", dataBase64 });
      const attachment = { name: file.name, type: file.type, key: result.key, url: result.url };
      setAttachments((current) => [...current, attachment]);
      setConversations((current) => current.map((conversation) => conversation.id === activeConversationId ? { ...conversation, attachments: [...(conversation.attachments ?? []), attachment] } : conversation));
      setAttachmentStates((current) => ({ ...current, [file.name]: { status: "success" } })); recordActivity("upload", file.name);
    } catch (error) { const message = error instanceof Error ? error.message : "تعذر رفع الملف."; setUploadError(message); setAttachmentStates((current) => ({ ...current, [file.name]: { status: "error", error: message } })); } finally { setUploading(false); setUploadingFile(""); }
  }

  async function handleAttachmentFiles(files: FileList | File[]) { for (const file of Array.from(files).slice(0, 8)) await handleAttachment(file); }

  function removeAttachment(key: string) {
    setAttachments((current) => current.filter((item) => item.key !== key));
    setConversations((current) => current.map((conversation) => conversation.id === activeConversationId ? { ...conversation, attachments: (conversation.attachments ?? []).filter((item) => item.key !== key) } : conversation));
  }

  function clearLocalData() {
    clearTextAiLocalData(window.localStorage);
    setDraft("");
    setConversations([]);
  }

  function deleteConversation(currentConversation: Conversation) {
    if (window.confirm("حذف هذه المحادثة من هذا الجهاز؟")) setConversations((current) => current.filter((conversation) => conversation.id !== currentConversation.id));
  }

  function chooseProvider(next: Provider) {
    const nextProviderKey = providerKeyForName(next);
    setProvider(next);
    const nextLiveModels = providerModelsQuery.data?.[nextProviderKey]?.models.map((item) => item.id).filter(Boolean) ?? [];
    setModel(preferredModel(nextLiveModels.length ? nextLiveModels : fallbackModels[nextProviderKey], nextProviderKey));
    setModelQuery("");
  }

  return (
    <div dir="rtl" data-font-scale={fontScale} className="min-h-screen bg-background text-foreground selection:bg-[#c7f36a] selection:text-[#111]">
      <div className="flex h-screen overflow-hidden mobile-touch-targets">
        {showSidebar && (
          <aside className="fixed inset-y-0 right-0 z-30 flex w-[284px] shrink-0 flex-col border-l border-border bg-card shadow-2xl shadow-black/40 lg:static lg:z-auto lg:flex">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#c7f36a] font-black text-[#0d0e0d]">T</div>
                <div>
                  <div className="text-[15px] font-semibold tracking-tight">TEXT.AI</div>
                  <div className="text-[10px] text-white/35">مساحة التفكير الجديدة</div>
                </div>
              </div>
              <button className="text-white/35 transition hover:text-white" onClick={() => setShowSidebar(false)} aria-label="إخفاء الشريط الجانبي"><PanelLeftClose size={17} /></button>
            </div>
            <div className="p-4">
              <Button onClick={createNewConversation} className="h-11 w-full justify-between rounded-xl bg-[#c7f36a] px-4 font-semibold text-[#12140f] hover:bg-[#d7ff84]"><span className="flex items-center gap-2"><MessageSquarePlus size={17} /> محادثة جديدة</span><span className="text-xs opacity-50">⌘ K</span></Button>
            </div>
            <div className="flex items-center justify-between px-4 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25"><span>{showArchived ? "الأرشيف" : "محادثاتك"}</span><div className="flex items-center gap-2"><button onClick={() => setShowArchived((value) => !value)} aria-label={showArchived ? "عرض المحادثات النشطة" : "عرض الأرشيف"} className="text-[10px] text-[#c7f36a]/70 hover:text-[#c7f36a]">{showArchived ? "النشطة" : "الأرشيف"}</button><button onClick={() => setConversationQuery("")} aria-label="مسح بحث المحادثات" className="text-white/25 hover:text-white">⌕</button></div></div>
            <div className="mb-2 px-3"><input ref={conversationSearchRef} value={conversationQuery} onChange={(event) => { setConversationQuery(event.target.value); setActiveConversationIndex(0); }} onKeyDown={(event) => { if (!visibleConversations.length) return; if (event.key === "ArrowDown") { event.preventDefault(); setActiveConversationIndex((index) => Math.min(index + 1, visibleConversations.length - 1)); } if (event.key === "ArrowUp") { event.preventDefault(); setActiveConversationIndex((index) => Math.max(index - 1, 0)); } if (event.key === "Enter") { event.preventDefault(); const conversation = visibleConversations[activeConversationIndex]; if (conversation) openConversation(conversation, activeConversationIndex); document.getElementById(`conversation-${activeConversationIndex}`)?.focus(); } }} placeholder="بحث في المحادثات..." aria-label="بحث في المحادثات" className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white outline-none placeholder:text-white/25 focus:border-[#c7f36a]/30" /></div>
            <div className="flex-1 space-y-1 overflow-y-auto px-3">
              {visibleConversations.length ? visibleConversations.map((conversation, index) => <button id={`conversation-${index}`} key={conversation.id} onClick={() => openConversation(conversation, index)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right text-[13px] transition ${index === activeConversationIndex ? "bg-white/[0.07] text-white" : "text-white/50 hover:bg-white/[0.04] hover:text-white"}`}><MessageSquarePlus size={15} className="shrink-0 opacity-50" /><span className="truncate">{conversation.title}</span><span className="mr-auto flex items-center gap-1 opacity-0 transition group-hover:opacity-100"><span role="button" tabIndex={0} aria-label={`تثبيت ${conversation.title}`} onClick={(event) => { event.stopPropagation(); toggleConversationPinned(conversation); }} onKeyDown={(event) => { if (event.key === "Enter") toggleConversationPinned(conversation); }} className="rounded p-1 hover:bg-white/[0.08]">{conversation.pinned ? "★" : "☆"}</span>{showArchived ? <span role="button" tabIndex={0} aria-label={`استعادة ${conversation.title}`} onClick={(event) => { event.stopPropagation(); restoreConversation(conversation); }} onKeyDown={(event) => { if (event.key === "Enter") restoreConversation(conversation); }} className="rounded p-1 hover:bg-[#c7f36a]/10">↶</span> : <span role="button" tabIndex={0} aria-label={`أرشفة ${conversation.title}`} onClick={(event) => { event.stopPropagation(); toggleConversationArchived(conversation); }} onKeyDown={(event) => { if (event.key === "Enter") toggleConversationArchived(conversation); }} className="rounded p-1 hover:bg-white/[0.08]">⌑</span>}<span role="button" tabIndex={0} aria-label={`إعادة تسمية ${conversation.title}`} onClick={(event) => { event.stopPropagation(); renameConversation(conversation); }} onKeyDown={(event) => { if (event.key === "Enter") renameConversation(conversation); }} className="rounded p-1 hover:bg-white/[0.08]">✎</span><span role="button" tabIndex={0} aria-label={`حذف ${conversation.title}`} onClick={(event) => { event.stopPropagation(); deleteConversation(conversation); }} onKeyDown={(event) => { if (event.key === "Enter") deleteConversation(conversation); }} className="rounded p-1 hover:bg-red-400/10 hover:text-red-200">×</span></span></button>) : <div className="rounded-xl px-3 py-4 text-center text-xs text-white/30">لا توجد محادثات مطابقة</div>}
            </div>
            <div className="border-t border-white/[0.07] p-4">
              <button onClick={() => setShowPrompts(true)} className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[13px] text-white/55 transition hover:bg-white/[0.05] hover:text-white"><Library size={16} /> مكتبة البرومبتات <Badge className="mr-auto border-0 bg-white/[0.08] text-[10px] text-white/50">{promptCount}</Badge></button>
              <button onClick={() => setShowActivity(true)} className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[13px] text-white/55 transition hover:bg-white/[0.05] hover:text-white"><Activity size={16} /> النشاط الأخير</button><button onClick={() => setShowSettings(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[13px] text-white/55 transition hover:bg-white/[0.05] hover:text-white"><Settings2 size={16} /> إعدادات مساحة العمل</button>
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-3"><div className="grid h-8 w-8 place-items-center rounded-full bg-[#25301b] text-xs font-bold text-[#c7f36a]">{user?.name?.slice(0, 1) ?? "م"}</div><div className="min-w-0 flex-1"><div className="truncate text-xs font-medium">{user?.name ?? "مساحة شخصية"}</div><div className="truncate text-[10px] text-white/30">الخطة الأساسية</div></div><ChevronDown size={14} className="text-white/35" /></div>
            </div>
          </aside>
        )}

        {showSidebar && <button aria-label="إغلاق الشريط الجانبي على الهاتف" onClick={() => setShowSidebar(false)} className="fixed inset-0 z-20 bg-black/50 lg:hidden" />}
        <main className="relative flex min-w-0 flex-1 flex-col bg-background">
          <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/[0.07] px-4 sm:px-7">
            <div className="flex items-center gap-3">
              {!showSidebar && <button onClick={() => setShowSidebar(true)} aria-label="إظهار الشريط الجانبي" className="rounded-lg p-2 text-white/45 transition active:scale-95 hover:bg-white/[0.06] hover:text-white"><Menu size={18} /></button>}
              <div className="flex items-center gap-2 text-sm font-medium"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#c7f36a] text-xs font-black text-[#10120e]">T</span><span className="sm:hidden">TEXT.AI</span><span className="hidden text-white/35 sm:inline">/</span><span className="hidden text-white/55 sm:inline">جلسة تصميم TEXT.AI</span></div>
            </div>
            <div className="flex items-center gap-2"><button onClick={() => setShowPrompts(true)} className="hidden items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/45 transition hover:bg-white/[0.06] hover:text-white sm:flex"><Library size={15} /> البرومبتات</button><button onClick={() => setShowModernTools((value) => !value)} aria-label="فتح الأدوات الحديثة" className="rounded-lg p-2 text-white/45 transition hover:bg-white/[0.06] hover:text-white"><Sparkles size={17} /></button><button onClick={() => setShowSettings(true)} aria-label="فتح الإعدادات" className="rounded-lg p-2 text-white/45 transition hover:bg-white/[0.06] hover:text-white"><Settings2 size={17} /></button><button aria-label="المزيد من الخيارات" onClick={() => setShowModernTools(true)} className="rounded-lg p-2 text-white/45 transition hover:bg-white/[0.06] hover:text-white"><MoreHorizontal size={18} /></button></div>
          </header>

          {showCommandPalette && <GlobalCommandPalette onClose={() => setShowCommandPalette(false)} onNewChat={() => { createNewConversation(); setShowCommandPalette(false); }} onOpenSettings={() => setShowSettings(true)} onOpenPrompts={() => setShowPrompts(true)} onOpenSearch={() => { setConversationQuery(""); setShowSidebar(true); window.setTimeout(() => conversationSearchRef.current?.focus(), 0); }} onOpenTools={() => setShowModernTools(true)} />}
          {showModernTools && <ModernToolsPanel onClose={() => setShowModernTools(false)} onNewChat={() => { createNewConversation(); setShowModernTools(false); }} onOpenSettings={() => { setShowSettings(true); setShowModernTools(false); }} onOpenPrompts={() => { setShowPrompts(true); setShowModernTools(false); }} onOpenSearch={() => { setConversationQuery(""); setShowSidebar(true); setShowModernTools(false); window.setTimeout(() => conversationSearchRef.current?.focus(), 0); }} onOpenTools={() => setShowModernTools(true)} providerStatus={providerStatusQuery.data ?? {}} onSelectTool={selectCatalogTool} />}

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[880px] flex-col px-4 pb-52 pt-10 sm:px-8 sm:pt-16">
              {messages.map((message) => <div key={message.id} className={`mb-9 flex gap-4 ${message.role === "user" ? "justify-start" : "justify-start"}`}>
                {message.role === "assistant" ? <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#c7f36a] font-black text-[#10120e]">T</div> : <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#272b31] text-xs font-semibold text-white/60">أنت</div>}
                <div className="min-w-0 max-w-[760px] flex-1"><div className="mb-2 flex items-center gap-2 text-xs text-white/35"><span>{message.role === "assistant" ? "TEXT.AI" : "أنت"}</span>{message.tool && <Badge className="border-0 bg-[#c7f36a]/10 text-[10px] text-[#c7f36a]">{message.tool}</Badge>}{message.metadata && <span className="text-[10px] text-white/20">{message.metadata}</span>}</div><div className="prose prose-invert max-w-none text-[15px] leading-8 text-white/80">{extractCodeBlocks(message.content).map((block) => <div key={block.id} dir="ltr" className="not-prose mb-3 flex items-center justify-between rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2 text-[10px] text-white/45"><span>```{block.language}</span><span className="flex gap-2"><button aria-label={`نسخ كتلة ${block.language}`} onClick={() => void copyResponse(block.code)} className="rounded px-2 py-1 hover:bg-white/[0.08]">نسخ الكود</button><button aria-label={`تنزيل كتلة ${block.language}`} onClick={() => downloadCodeBlock(block.code, block.language)} className="rounded px-2 py-1 hover:bg-white/[0.08]">تنزيل</button></span></div>)}<Streamdown>{message.content}</Streamdown></div>{message.role === "assistant" && <div className="mt-4 flex items-center gap-1 text-white/25"><button aria-label="نسخ رد TEXT.AI" onClick={() => void copyResponse(message.content)} className="rounded-md p-2 hover:bg-white/[0.06] hover:text-white/70"><Copy size={14} /></button><button aria-label="تنزيل رد TEXT.AI بصيغة Markdown" onClick={() => downloadResponse(message.content)} className="rounded-md px-2 py-1 text-[10px] hover:bg-white/[0.06] hover:text-white/70">تنزيل</button><button aria-label="تعديل وإعادة إرسال آخر طلب" onClick={() => { const previous = messages[messages.findIndex((item) => item.id === message.id) - 1]; if (previous?.role === "user") editAndResend(previous); }} className="rounded-md px-2 py-1 text-[10px] hover:bg-white/[0.06] hover:text-white/70">تعديل</button><button aria-label="إنشاء فرع من هذا الرد" onClick={() => branchFromMessage(message)} className="rounded-md px-2 py-1 text-[10px] hover:bg-white/[0.06] hover:text-white/70">فرع</button><button aria-label="توليد الرد مجدداً" onClick={() => regenerateFromMessage(message)} className="rounded-md px-2 py-1 text-[10px] hover:bg-white/[0.06] hover:text-white/70">تجديد</button><button aria-label="حفظ رد TEXT.AI" onClick={() => saveResponse(message.content)} className="rounded-md p-2 hover:bg-white/[0.06] hover:text-white/70"><Archive size={14} /></button><button aria-label="رد مفيد" onClick={() => setMessageFeedback(message.id, "useful")} className={`rounded-md px-2 py-1 text-[10px] hover:bg-white/[0.06] hover:text-white/70 ${feedbackByMessage[message.id] === "useful" ? "bg-[#c7f36a]/15 text-[#c7f36a]" : ""}`}>{feedbackByMessage[message.id] === "useful" ? "تم الحفظ" : "مفيد"}</button><button aria-label="رد غير مفيد" onClick={() => setMessageFeedback(message.id, "notUseful")} className={`rounded-md px-2 py-1 text-[10px] hover:bg-white/[0.06] hover:text-white/70 ${feedbackByMessage[message.id] === "notUseful" ? "bg-red-300/10 text-red-100" : ""}`}>{feedbackByMessage[message.id] === "notUseful" ? "تم التسجيل" : "غير مفيد"}</button></div>}</div>
              </div>)}

              {messages.length === 1 && <section className="mt-8"><div className="mb-4 text-xs font-medium text-white/30">جرّب واحدة من هذه</div><div className="grid gap-2 sm:grid-cols-3">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => sendMessage(suggestion)} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-right text-[13px] leading-6 text-white/55 transition hover:-translate-y-0.5 hover:border-[#c7f36a]/30 hover:bg-[#c7f36a]/[0.05] hover:text-white">{suggestion}<span className="mt-3 block text-[#c7f36a]">↗</span></button>)}</div></section>}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#090a0c] via-[#090a0c]/95 to-transparent px-4 pb-5 pt-12 sm:px-8"><div className="pointer-events-auto mx-auto max-w-[880px]">
            {activeTool && <div className="mb-2 flex items-center gap-2 rounded-xl border border-[#c7f36a]/20 bg-[#c7f36a]/[0.06] px-3 py-2 text-xs text-[#c7f36a]"><Sparkles size={14} /> مفعّل الآن: {activeTool}{recordingStatus !== "idle" && <span className="text-white/45">· {recordingStatus === "recording" ? "يسجل الآن" : recordingStatus === "ready" ? "التسجيل جاهز للتفريغ" : "فشل التسجيل أو التفريغ"}</span>}{recordingStatus === "error" && <button onClick={() => { setMediaError(""); setActiveTool("تحويل الصوت إلى نص"); sendMessage("إعادة تفريغ التسجيل", null, "تحويل الصوت إلى نص"); }} className="mr-2 rounded-lg border border-[#c7f36a]/20 px-2 py-1 text-[10px]">إعادة المحاولة</button>}{generationPending && <button onClick={cancelGeneration} className="mr-2 rounded-lg border border-red-200/20 px-2 py-1 text-[10px] text-red-100/80 hover:bg-red-200/10">إلغاء التوليد</button>}{lastTranscript && !summarizeTranscriptMutation.isPending && <button onClick={retryTranscriptSummary} className="mr-2 rounded-lg border border-[#c7f36a]/20 px-2 py-1 text-[10px] hover:bg-[#c7f36a]/10">إعادة التلخيص</button>}<button onClick={() => setActiveTool(null)} className="mr-auto"><X size={14} /></button></div>}
            <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (event.dataTransfer.files.length) handleAttachmentFiles(event.dataTransfer.files); }} className="rounded-[22px] border border-white/[0.12] bg-[#17191d] p-2 shadow-2xl shadow-black/30 focus-within:border-[#c7f36a]/35"><input ref={attachmentInputRef} type="file" multiple className="hidden" accept="image/*,audio/*,.pdf,.txt,.md,.csv,.json" onChange={(event) => { if (event.target.files?.length) handleAttachmentFiles(event.target.files); event.currentTarget.value = ""; }} />{uploadError && <div role="alert" className="px-2 pt-1 text-xs text-red-200/80">{uploadError}</div>}{uploading && <div className="px-2 pt-1 text-xs text-[#c7f36a]/80">جارٍ رفع {uploadingFile}...</div>}<div className="flex flex-wrap gap-2 px-2 pt-1">{attachments.map((attachment) => <span key={attachment.key} className="rounded-lg bg-white/[0.06] px-2 py-1 text-[10px] text-white/55">{attachment.name}{attachmentStates[attachment.name]?.status === "uploading" ? " · جارٍ" : ""}<button aria-label={`إزالة ${attachment.name}`} onClick={() => removeAttachment(attachment.key)} className="mr-2 text-white/30 hover:text-white">×</button></span>)}</div><Textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder="اكتب رسالتك إلى TEXT.AI..." className="min-h-[58px] resize-none border-0 bg-transparent px-3 py-2 text-[15px] leading-7 text-white placeholder:text-white/25 focus-visible:ring-0" /><div className="flex items-center justify-between px-2 pb-1"><div className="flex items-center gap-1"><ToolButton icon={<Paperclip size={16} />} label="إرفاق ملف" onClick={() => attachmentInputRef.current?.click()} /><ToolButton icon={<Search size={16} />} label="بحث" disabled={!canSearch} onClick={() => setActiveTool("بحث متصل")}/><ToolButton icon={<WandSparkles size={16} />} label="بحث عميق" disabled={!canSearch} onClick={() => setActiveTool("بحث عميق")}/><ToolButton icon={<FileSearch size={16} />} label="تحليل مرئي ونصي" disabled={analyzeContentMutation.isPending} onClick={() => { setMediaError(""); setActiveTool("تحليل مرئي ونصي"); }}/><ToolButton icon={<ImagePlus size={16} />} label={generateImageMutation.isPending ? "جارٍ توليد الصورة" : "توليد صورة"} disabled={generateImageMutation.isPending} onClick={() => { setMediaError(""); setActiveTool("توليد صورة"); }}/><ToolButton icon={isRecording ? <Square size={16} /> : <Mic size={16} />} label={isRecording ? "إيقاف التسجيل" : "تسجيل صوت"} onClick={() => void toggleRecording()} /><ToolButton icon={<AudioLines size={16} />} label={transcribeAudioMutation.isPending ? "جارٍ تفريغ الصوت" : summarizeTranscriptMutation.isPending ? "جارٍ تلخيص التسجيل" : "تفريغ صوت"} disabled={transcribeAudioMutation.isPending || summarizeTranscriptMutation.isPending} onClick={() => { setMediaError(""); setActiveTool("تحويل الصوت إلى نص"); }}/></div><button onClick={() => sendMessage()} className="grid h-9 w-9 place-items-center rounded-xl bg-[#c7f36a] text-[#10120e] transition hover:bg-[#d7ff84] active:scale-95"><ArrowUp size={17} strokeWidth={2.5} /></button></div></div>
            {mediaError && <div role="alert" className="mb-2 text-xs text-red-200/80">{mediaError}</div>}<div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-white/25"><span>TEXT.AI قد يخطئ. تحقّق من المعلومات المهمة.</span><div className="flex items-center gap-2"><button onClick={() => setShowSettings(true)} className="flex items-center gap-1 hover:text-white/60"><span className="h-1.5 w-1.5 rounded-full bg-[#c7f36a]" /> {provider} · {model}</button><span>·</span><span>{selectedPersona.label}</span></div></div>
          </div></div>
        </main>

        <aside className="hidden w-[278px] shrink-0 flex-col border-r border-border bg-card xl:flex"><div className="border-b border-white/[0.07] p-5"><div className="mb-4 flex items-center justify-between"><div><div className="text-[13px] font-semibold">وضع التشغيل</div><div className="mt-1 text-[10px] text-white/30">تحكم في عقل الجلسة</div></div><div className="h-2 w-2 rounded-full bg-[#c7f36a] shadow-[0_0_12px_#c7f36a]" /></div><div className="space-y-2">{providers.map((item) => <button key={item.name} onClick={() => chooseProvider(item.name)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-right transition ${provider === item.name ? "border-[#c7f36a]/35 bg-[#c7f36a]/[0.07]" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]"}`}><span className={`grid h-7 w-7 place-items-center rounded-lg text-[10px] font-bold ${item.tone === "emerald" ? "bg-emerald-400/15 text-emerald-300" : item.tone === "violet" ? "bg-violet-400/15 text-violet-300" : "bg-amber-300/15 text-amber-200"}`}>{item.mark}</span><span className="min-w-0 flex-1"><span className="block text-xs font-medium">{item.name}</span><span className="mt-1 block text-[10px] text-white/30">{providerStatusQuery.data?.[item.name === "OpenAI" ? "openai" : item.name === "OpenRouter" ? "openrouter" : "huggingface"] ? "متاح الآن" : "غير مهيأ"}</span></span>{provider === item.name && <span className="h-1.5 w-1.5 rounded-full bg-[#c7f36a]" />}</button>)}</div></div><div className="border-b border-white/[0.07] p-5"><div className="mb-3 flex items-center justify-between"><span className="text-[11px] font-semibold text-white/60">النموذج</span><span className="flex items-center gap-2 text-[10px] text-white/25">{selectedProvider.name} · {selectedModelIds.length} نموذج {providerModelsQuery.isFetching && <Loader2 size={11} className="animate-spin" />}</span><button aria-label="تحديث قائمة النماذج" onClick={() => void providerModelsQuery.refetch()} className="rounded-md p-1 text-white/35 hover:bg-white/[0.06] hover:text-white"><RefreshCw size={12} /></button></div><input value={modelQuery} onChange={(event) => setModelQuery(event.target.value)} placeholder="ابحث في النماذج المتاحة..." aria-label="البحث في النماذج المتاحة" className="mb-2 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white outline-none placeholder:text-white/25 focus:border-[#c7f36a]/30" /><div className="grid max-h-[300px] gap-1 overflow-y-auto">{filteredModelIds.map((item) => <button key={item} onClick={() => setModel(item)} className={`rounded-lg px-3 py-2 text-right text-xs transition ${model === item ? "bg-white/[0.09] text-white" : "text-white/40 hover:bg-white/[0.04] hover:text-white/80"}`}>{item}{model === item && <span className="float-left text-[#c7f36a]">✓</span>}</button>)}</div></div><div className="flex-1 p-5"><div className="mb-3 text-[11px] font-semibold text-white/60">الشخصية</div><div className="space-y-2">{personas.map((item) => <button key={item.id} onClick={() => setPersona(item.id)} className={`flex w-full gap-3 rounded-xl p-3 text-right transition ${persona === item.id ? "bg-[#c7f36a]/[0.08]" : "hover:bg-white/[0.04]"}`}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm ${persona === item.id ? "bg-[#c7f36a] text-[#10120e]" : "bg-white/[0.07] text-white/50"}`}>{item.icon}</span><span><span className={`block text-xs ${persona === item.id ? "text-[#c7f36a]" : "text-white/70"}`}>{item.label}</span><span className="mt-1 block text-[10px] leading-4 text-white/30">{item.description}</span></span></button>)}</div></div><div className="border-t border-white/[0.07] p-5"><div className="flex items-center justify-between text-[10px] text-white/30"><span>حالة الأدوات</span><button onClick={() => setShowSettings(true)} className="text-[#c7f36a] hover:underline">إدارة</button></div><div className="mt-3 space-y-2"><StatusRow label="تحليل الملفات" available={Boolean(user)} /><StatusRow label="توليد الصور" available /><StatusRow label="التفريغ الصوتي" available={Boolean(user)} /><StatusRow label="البحث المتصل" available={canSearch} /></div></div></aside>
      </div>

      {showSettings && <Modal title="إعدادات TEXT.AI" onClose={() => setShowSettings(false)}><div className="space-y-5"><SettingBlock title="مزود النماذج" description="المفاتيح تُحفظ على الخادم ولا تظهر للمتصفح."><div className="grid gap-2">{providers.map((item) => <button key={item.name} onClick={() => chooseProvider(item.name)} className={`flex items-center justify-between rounded-xl border p-3 text-right ${provider === item.name ? "border-[#c7f36a]/40 bg-[#c7f36a]/[0.08]" : "border-white/[0.08] bg-white/[0.03]"}`}><span className="text-sm">{item.name}</span><span className="text-[10px] text-white/35">{(providerStatusQuery.data?.[item.name === "OpenAI" ? "openai" : item.name === "OpenRouter" ? "openrouter" : "huggingface"]) ? "متاح الآن" : "غير مهيأ"}</span></button>)}</div></SettingBlock><SettingBlock title="مكتبة البرومبتات" description="تم تحويلها إلى قوالب TEXT.AI موجهة حسب المهمة والمزود، بدلاً من نسخ هوية المنتجات الأخرى."><div className="flex items-center justify-between rounded-xl bg-white/[0.04] p-3"><span className="text-sm">قوالب جاهزة</span><Badge className="border-0 bg-[#c7f36a]/15 text-[#c7f36a]">{promptCount} قالباً</Badge></div></SettingBlock><SettingBlock title="النموذج الافتراضي" description="اختيار النموذج يطبّق على الجلسة الحالية ويرسل إلى المزود عبر الخادم."><div className="grid max-h-[300px] gap-1 overflow-y-auto">{filteredModelIds.map((item) => <button key={item} onClick={() => setModel(item)} className={`rounded-xl border p-3 text-right text-sm ${model === item ? "border-[#c7f36a]/40 bg-[#c7f36a]/[0.08]" : "border-white/[0.08] bg-white/[0.03]"}`}>{item}</button>)}</div></SettingBlock><SettingBlock title="عمق التفكير" description="يتاح كخيار آمن للعائلات الداعمة له، ويُتجاهل تلقائياً لدى المزودين الآخرين."><div className="grid grid-cols-4 gap-2">{(["minimal", "low", "medium", "high"] as const).map((level) => <button key={level} onClick={() => setReasoningDepth(level)} className={`rounded-xl border p-2 text-xs ${reasoningDepth === level ? "border-[#c7f36a]/40 bg-[#c7f36a]/[0.08]" : "border-white/[0.08] bg-white/[0.03]"}`}>{level}</button>)}</div></SettingBlock><SettingBlock title="الشخصية الافتراضية" description="تُحوّل الشخصية إلى تعليمات نظام آمنة خاصة بـ TEXT.AI."><div className="grid gap-2">{personas.map((item) => <button key={item.id} onClick={() => setPersona(item.id)} className={`rounded-xl border p-3 text-right text-sm ${persona === item.id ? "border-[#c7f36a]/40 bg-[#c7f36a]/[0.08]" : "border-white/[0.08] bg-white/[0.03]"}`}>{item.label}</button>)}</div></SettingBlock><SettingBlock title="مقارنة نموذجين" description="أرسل السؤال نفسه إلى المزود الحالي ومزود بديل لعرض الإجابتين جنباً إلى جنب."><button onClick={() => setShowCompare(true)} className="w-full rounded-xl border border-[#c7f36a]/20 bg-[#c7f36a]/[0.05] p-3 text-sm text-[#c7f36a]">فتح المقارنة الجانبية</button></SettingBlock><SettingBlock title="معرض الصور المولدة" description="سجل محلي للصور التي أنشأتها TEXT.AI في هذه الجلسة."><button onClick={() => setShowGallery(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-sm text-white/70 hover:bg-white/[0.07]"><Images size={14} /> فتح المعرض ({generatedImages.length} صورة)</button>{generatedImages.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2">{generatedImages.slice(0, 6).map((image) => <img key={image.id} src={image.url} alt={image.prompt} className="aspect-square rounded-lg object-cover" loading="lazy" />)}</div>}</SettingBlock><SettingBlock title="تصدير مساحة العمل" description="ينشئ ملف JSON محلياً للمحادثات والمخرجات المحفوظة دون إرسالها إلى طرف ثالث."><button onClick={() => setShowSavedOutputs(true)} className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-sm text-white/70 hover:bg-white/[0.07]"><Archive size={14} /> المخرجات المحفوظة</button><button onClick={() => { if (window.confirm("سيتم إنشاء ملف محلي يحتوي على سجل المحادثة. هل تريد المتابعة؟")) exportWorkspace(); }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-sm text-white/70 hover:bg-white/[0.07]"><Archive size={14} /> تصدير نسخة محلية</button></SettingBlock><SettingBlock title="الخصوصية المحلية" description="يمسح المسودات وقائمة المحادثات ومراجع المرفقات المحلية فقط، ولا يلغي بيانات الخادم."><button onClick={() => { if (window.confirm("مسح البيانات المحلية من هذا الجهاز؟")) clearLocalData(); }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-red-300/[0.06] p-3 text-sm text-red-100/75 hover:bg-red-300/[0.1]"><Trash2 size={14} /> مسح البيانات المحلية</button></SettingBlock><SettingBlock title="الأدوات والقدرات" description="البحث والبحث العميق مخفيان ما لم يتوفر موصل بيانات فعلي؛ الأدوات الأخرى تحتاج تكاملاتها الخاصة."><div className="space-y-2"><StatusRow label="المرفقات والتخزين" available={Boolean(user)} /><StatusRow label="التفريغ الصوتي" available={Boolean(user)} /><StatusRow label="توليد الصور" available /><StatusRow label="البحث المتصل" available={canSearch} /><StatusRow label="البحث العميق" available={canDeepSearch} /><StatusRow label="التحليل المرئي والنصي" available={Boolean(user)} /></div></SettingBlock><SettingBlock title="المظهر واللغة" description="تفضيلات العرض الأساسية للمساحة."><div className="mb-3 grid grid-cols-3 gap-2">{(["dark", "light", "system"] as const).map((option) => <button key={option} onClick={() => setTheme(option)} className={`rounded-xl border p-2 text-xs ${theme === option ? "border-[#c7f36a]/40 bg-[#c7f36a]/[0.08]" : "border-white/[0.08] bg-white/[0.03]"}`}>{option === "dark" ? "داكن" : option === "light" ? "فاتح" : "النظام"}</button>)}</div><div className="grid grid-cols-2 gap-2"><button onClick={() => setActiveTool("العربية · RTL مفعّلة بالفعل")} className="rounded-xl border border-[#c7f36a]/40 bg-[#c7f36a]/[0.08] p-3 text-sm">العربية · RTL</button><button onClick={() => setActiveTool("اللغة الإنجليزية غير مفعّلة في هذه النسخة — العربية RTL هي اللغة الافتراضية")} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-sm text-white/50">English · LTR</button></div><div className="mt-3 grid gap-2"><div className="grid grid-cols-3 gap-2">{(["sm", "md", "lg"] as const).map((size) => <button key={size} onClick={() => setFontScale(size)} className={`rounded-xl border p-2 text-xs ${fontScale === size ? "border-[#c7f36a]/40 bg-[#c7f36a]/[0.08]" : "border-white/[0.08] bg-white/[0.03]"}`}>{size === "sm" ? "نص أصغر" : size === "lg" ? "نص أكبر" : "النص الافتراضي"}</button>)}</div><button onClick={() => setReducedMotion(!reducedMotion)} className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-xs"><span>تقليل الحركة</span><span className={reducedMotion ? "text-[#c7f36a]" : "text-white/30"}>{reducedMotion ? "مفعّل" : "متوقف"}</span></button><button onClick={() => setHighContrast(!highContrast)} className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-xs"><span>تباين مرتفع</span><span className={highContrast ? "text-[#c7f36a]" : "text-white/30"}>{highContrast ? "مفعّل" : "متوقف"}</span></button></div></SettingBlock>{!user && <Button onClick={() => startLogin()} className="w-full rounded-xl bg-[#c7f36a] text-[#10120e] hover:bg-[#d7ff84]">تسجيل الدخول لحفظ المحادثات</Button>}</div></Modal>}
      {showPrompts && <Modal title="مكتبة برومبتات TEXT.AI" onClose={() => setShowPrompts(false)}><div className="mb-4 flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/45"><span className="flex min-w-0 flex-1 items-center gap-2"><Search size={14} /><input value={promptQuery} onChange={(event) => setPromptQuery(event.target.value)} aria-label="البحث في قوالب البرومبت" placeholder="ابحث في القوالب" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/25" /></span><span className="text-[10px]">{promptCount} قالباً مستورداً كبيانات وصفية</span></div><div className="mb-4"><div className="mb-2 text-[11px] font-semibold text-white/55">قوالب بمتغيرات قابلة للتعبئة</div><div className="grid gap-2 sm:grid-cols-3">{promptPresets.map((preset) => <button key={preset.name} onClick={() => usePromptPreset(preset)} className="rounded-xl border border-[#c7f36a]/15 bg-[#c7f36a]/[0.04] p-3 text-right text-xs text-white/65 hover:bg-[#c7f36a]/[0.08]"><span className="block text-[#c7f36a]">{preset.name}</span><span className="mt-2 block text-[10px] text-white/35">{preset.template}</span></button>)}</div>{selectedPromptPreset && <div className="mt-3 rounded-xl border border-[#c7f36a]/20 bg-[#c7f36a]/[0.04] p-3"><div className="mb-2 text-xs text-[#c7f36a]">املأ متغيرات «{selectedPromptPreset.name}»</div><div className="grid gap-2 sm:grid-cols-2">{extractPromptVariables(selectedPromptPreset.template).map((variable) => <input key={variable} value={promptVariableValues[variable] ?? ""} onChange={(event) => setPromptVariableValues((current) => ({ ...current, [variable]: event.target.value }))} placeholder={variable} aria-label={`قيمة ${variable}`} className="rounded-lg border border-white/[0.1] bg-black/20 px-3 py-2 text-xs text-white outline-none" />)}</div><button onClick={applyPromptPreset} className="mt-3 rounded-lg bg-[#c7f36a] px-3 py-2 text-xs text-[#10120e]">استخدام القالب</button></div>}</div><div className="grid gap-2">{(filteredPromptTemplates.length ? filteredPromptTemplates.map((template) => ({ title: template.title, tag: template.family, detail: template.description, icon: "✦" })) : promptQuery ? [] : promptCards).map((card) => <button key={card.title} onClick={() => { setDraft(card.detail); setShowPrompts(false); }} className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 text-right transition hover:border-[#c7f36a]/30 hover:bg-[#c7f36a]/[0.05]"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#c7f36a]/10 text-[#c7f36a]">{card.icon}</span><span className="min-w-0 flex-1"><span className="flex items-center gap-2 text-sm"><span>{card.title}</span><Badge className="border-0 bg-white/[0.08] text-[9px] text-white/40">{card.tag}</Badge></span><span className="mt-1 block text-xs text-white/35">{card.detail}</span></span><Pencil size={14} className="text-white/25" /></button>)}</div><div className="mt-5 rounded-xl bg-amber-300/[0.07] p-3 text-[11px] leading-5 text-amber-100/60">المكتبة تستخدم أوصافاً وقوالب أصلية لـ TEXT.AI، ولا تنسخ تعليمات النظام الخاصة بمنتجات أو نماذج أخرى حرفياً.</div></Modal>}
      {showActivity && <ActivityFeed items={activityItems} onClose={() => setShowActivity(false)} />}
      {showSavedOutputs && <SavedOutputsPanel items={savedOutputs} onClose={() => setShowSavedOutputs(false)} onOpen={openSavedOutput} onRemove={removeSavedOutput} />}
      {showGallery && <Modal title="معرض صور TEXT.AI" onClose={() => setShowGallery(false)}><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{generatedImages.length ? generatedImages.map((image) => <figure key={image.id} className="group overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03]"><button onClick={() => setPreviewImage(image)} className="block w-full"><img src={image.url} alt={image.prompt} loading="lazy" className="aspect-square w-full object-cover" /></button><figcaption className="flex items-center justify-between gap-2 p-2 text-[10px] text-white/50"><span className="truncate">{image.prompt}</span><button aria-label="حذف الصورة" onClick={() => setGeneratedImages((current) => current.filter((item) => item.id !== image.id))} className="text-red-200/60 hover:text-red-100">×</button></figcaption></figure>) : <div className="col-span-full rounded-xl border border-dashed border-white/[0.1] p-8 text-center text-sm text-white/40">لا توجد صور مولدة بعد.</div>}</div></Modal>}
      {showCompare && <Modal title="مقارنة النماذج" onClose={() => { setShowCompare(false); setComparisonResults([]); }}><div className="mb-3 grid gap-2 sm:grid-cols-2"><label className="text-xs text-white/55">النموذج الأيسر<select value={compareLeftProvider} onChange={(event) => setCompareLeftProvider(event.target.value as TextAiProvider)} className="mt-1 w-full rounded-lg border border-white/[0.1] bg-white/[0.04] p-2 text-xs"><option value="openai">OpenAI · {providers[0].models[0]}</option><option value="openrouter">OpenRouter · {providers[1].models[0]}</option><option value="huggingface">Hugging Face · {providers[2].models[0]}</option></select><select value={compareLeftModel} onChange={(event) => setCompareLeftModel(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.1] bg-white/[0.04] p-2 text-xs">{(providers.find((item) => (item.name === "OpenAI" ? "openai" : item.name === "OpenRouter" ? "openrouter" : "huggingface") === compareLeftProvider)?.models ?? []).map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-xs text-white/55">النموذج الأيمن<select value={compareRightProvider} onChange={(event) => setCompareRightProvider(event.target.value as TextAiProvider)} className="mt-1 w-full rounded-lg border border-white/[0.1] bg-white/[0.04] p-2 text-xs"><option value="openai">OpenAI · {providers[0].models[0]}</option><option value="openrouter">OpenRouter · {providers[1].models[0]}</option><option value="huggingface">Hugging Face · {providers[2].models[0]}</option></select><select value={compareRightModel} onChange={(event) => setCompareRightModel(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.1] bg-white/[0.04] p-2 text-xs">{(providers.find((item) => (item.name === "OpenAI" ? "openai" : item.name === "OpenRouter" ? "openrouter" : "huggingface") === compareRightProvider)?.models ?? []).map((item) => <option key={item}>{item}</option>)}</select></label></div><Textarea value={comparePrompt} onChange={(event) => setComparePrompt(event.target.value)} placeholder="اكتب سؤال المقارنة..." className="min-h-[90px] bg-white/[0.03]" /><button onClick={() => void runComparison()} disabled={!comparePrompt.trim() || comparisonPending} className="mt-3 rounded-xl bg-[#c7f36a] px-4 py-2 text-sm text-[#10120e]">{comparisonPending ? "جارٍ المقارنة..." : "قارن الآن"}</button>{comparisonError && <div role="alert" className="mt-2 text-xs text-red-200/80">{comparisonError}</div>}{comparisonResults.length > 0 && <div className="mt-5 grid gap-3 md:grid-cols-2">{comparisonResults.map((result) => <article key={`${result.provider}-${result.model}`} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4"><div className="mb-2 text-xs text-[#c7f36a]">{result.provider} · {result.model}</div><div className="text-sm leading-7 text-white/75"><Streamdown>{result.content}</Streamdown></div></article>)}</div>}</Modal>}
      {previewImage && <Modal title="معاينة صورة TEXT.AI" onClose={() => setPreviewImage(null)}><img src={previewImage.url} alt={previewImage.prompt} className="max-h-[60vh] w-full rounded-xl object-contain" /><div className="mt-3 flex gap-2"><button onClick={() => { setDraft(`حلّل هذه الصورة: ${previewImage.url}`); setPreviewImage(null); setShowGallery(false); setShowSettings(false); }} className="rounded-xl bg-[#c7f36a] px-4 py-2 text-sm text-[#10120e]">استعادة إلى المحرر</button><button onClick={() => downloadResponse(`![${previewImage.prompt}](${previewImage.url})`)} className="rounded-xl border border-white/[0.1] px-4 py-2 text-sm">تنزيل Markdown</button></div></Modal>}
    </div>
  );
}

function ToolButton({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) { return <button disabled={disabled} onClick={onClick} title={disabled ? `${label} — غير متاح لهذا المزود` : label} className={`rounded-lg p-2 transition ${disabled ? "cursor-not-allowed text-white/15" : "text-white/35 hover:bg-white/[0.07] hover:text-white"}`}>{icon}</button>; }
function StatusRow({ label, available }: { label: string; available: boolean }) { return <div className="flex items-center justify-between text-[10px] text-white/45"><span>{label}</span><span className={available ? "text-[#c7f36a]" : "text-white/20"}>{available ? "متاح" : "غير متاح"}</span></div>; }
function SettingBlock({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <div><div className="mb-2 text-sm font-medium">{title}</div><div className="mb-3 text-[11px] leading-5 text-white/35">{description}</div>{children}</div>; }
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); onClose(); } };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  return <div role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"><div className="max-h-[85vh] w-full max-w-[520px] overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#15171b] p-5 shadow-2xl"><div className="mb-6 flex items-center justify-between"><h2 className="text-base font-semibold">{title}</h2><button aria-label={`إغلاق ${title}`} onClick={onClose} className="rounded-lg p-2 text-white/40 hover:bg-white/[0.06] hover:text-white"><X size={17} /></button></div>{children}</div></div>;
}
