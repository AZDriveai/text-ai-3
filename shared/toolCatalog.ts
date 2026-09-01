export type ProviderKey = "OPENAI_API_KEY" | "OPENROUTER_API_KEY" | "HF_TOKEN";

export type ToolCategory = "media" | "agents" | "workspace" | "developer" | "research";

export type ToolAction = "video" | "image" | "audio" | "analysis" | "chat" | "agent" | "developer" | "research";

export type TextAiTool = {
  id: number;
  slug: string;
  name: string;
  category: ToolCategory;
  categoryLabel: string;
  requiredKeys: ProviderKey[];
  action: ToolAction;
  description: string;
};

export const providerKeyLabels: Record<ProviderKey, string> = {
  OPENAI_API_KEY: "OpenAI",
  OPENROUTER_API_KEY: "OpenRouter",
  HF_TOKEN: "Hugging Face",
};

export const textAiTools: readonly TextAiTool[] = [
  { id: 1, slug: "omni-video-factory", name: "Omni-Video-Factory", category: "media", categoryLabel: "فيديو ووسائط", requiredKeys: ["HF_TOKEN"], action: "video", description: "مسار فيديو متعدد المشاهد مستند إلى Hugging Face وComfyUI." },
  { id: 2, slug: "wan-video-ui", name: "Wan2.2 / Wan2.1 Web UI", category: "media", categoryLabel: "فيديو ووسائط", requiredKeys: ["HF_TOKEN", "OPENROUTER_API_KEY"], action: "video", description: "واجهة تخطيط لفيديو سينمائي مع توجيه الموجهات عبر المزود المتاح." },
  { id: 3, slug: "open-sora-ui", name: "Open-Sora 2.0 Web UI", category: "media", categoryLabel: "فيديو ووسائط", requiredKeys: ["HF_TOKEN", "OPENAI_API_KEY"], action: "video", description: "مسار فيديو مفتوح مع فصل واضح بين صياغة الموجه والتوليد." },
  { id: 4, slug: "ltx-2-ui", name: "LTX-2 Web Interface", category: "media", categoryLabel: "فيديو ووسائط", requiredKeys: ["HF_TOKEN", "OPENROUTER_API_KEY"], action: "video", description: "واجهة لمسار فيديو وصوت متزامن، مع توضيح اعتماد المزودين." },
  { id: 5, slug: "comfyui-portal", name: "ComfyUI Web Portal", category: "media", categoryLabel: "فيديو ووسائط", requiredKeys: ["OPENAI_API_KEY", "OPENROUTER_API_KEY"], action: "image", description: "مسار عقدي للوسائط يمكن بدءه من مساحة TEXT.AI." },
  { id: 6, slug: "openrouter-video-api", name: "OpenRouter Video API", category: "media", categoryLabel: "فيديو ووسائط", requiredKeys: ["OPENROUTER_API_KEY"], action: "video", description: "بوابة نماذج فيديو متعددة خلف مفتاح OpenRouter واحد." },
  { id: 7, slug: "dify", name: "Dify.ai", category: "agents", categoryLabel: "وكلاء وأتمتة", requiredKeys: ["OPENAI_API_KEY", "OPENROUTER_API_KEY", "HF_TOKEN"], action: "agent", description: "وصف مسار LLMOps لبناء وكلاء وتدفقات عمل متعددة المزودين." },
  { id: 8, slug: "openclaw", name: "OpenClaw (HuggingClaw)", category: "agents", categoryLabel: "وكلاء وأتمتة", requiredKeys: ["HF_TOKEN", "OPENROUTER_API_KEY", "OPENAI_API_KEY"], action: "agent", description: "ملف تعريف لوكيل مستمر مع مزامنة حالة تحتاج إعداداً خارجياً واضحاً." },
  { id: 9, slug: "hermes-agent", name: "Hermes Agent", category: "agents", categoryLabel: "وكلاء وأتمتة", requiredKeys: ["HF_TOKEN", "OPENROUTER_API_KEY"], action: "agent", description: "مسار وكيل للبحث واستدعاء الأدوات مع عرض متطلبات المفتاح." },
  { id: 10, slug: "flowise", name: "Flowise", category: "agents", categoryLabel: "وكلاء وأتمتة", requiredKeys: ["OPENAI_API_KEY", "OPENROUTER_API_KEY"], action: "agent", description: "بناء بصري لمسارات الوكلاء دون إخفاء حدود التكامل الفعلي." },
  { id: 11, slug: "langflow", name: "Langflow", category: "agents", categoryLabel: "وكلاء وأتمتة", requiredKeys: ["OPENAI_API_KEY", "OPENROUTER_API_KEY", "HF_TOKEN"], action: "agent", description: "هندسة تدفقات المعرفة والمتغيرات العالمية للنماذج." },
  { id: 12, slug: "n8n-ai-workflows", name: "n8n AI Workflows", category: "agents", categoryLabel: "وكلاء وأتمتة", requiredKeys: ["OPENAI_API_KEY", "OPENROUTER_API_KEY"], action: "agent", description: "ملف تعريف لأتمتة سير العمل التي تستدعي نماذج اللغة." },
  { id: 13, slug: "gpt-researcher", name: "GPT Researcher", category: "agents", categoryLabel: "وكلاء وأتمتة", requiredKeys: ["OPENAI_API_KEY", "OPENROUTER_API_KEY"], action: "research", description: "مسار بحث يحتاج موصل ويب فعلياً قبل ادعاء البحث الحي." },
  { id: 14, slug: "librechat", name: "LibreChat", category: "workspace", categoryLabel: "دردشة وبيئة عمل", requiredKeys: ["OPENAI_API_KEY", "OPENROUTER_API_KEY", "HF_TOKEN"], action: "chat", description: "واجهة دردشة متعددة المزودين مع سياقات المستندات والإضافات." },
  { id: 15, slug: "lobe-chat", name: "LobeChat", category: "workspace", categoryLabel: "دردشة وبيئة عمل", requiredKeys: ["OPENAI_API_KEY", "OPENROUTER_API_KEY"], action: "chat", description: "تجربة دردشة بصرية مرنة للتبديل بين النماذج." },
  { id: 16, slug: "typingmind", name: "TypingMind", category: "workspace", categoryLabel: "دردشة وبيئة عمل", requiredKeys: ["OPENROUTER_API_KEY", "OPENAI_API_KEY"], action: "chat", description: "بيئة إنتاجية تعتمد على التخزين المحلي وإدارة النماذج." },
  { id: 17, slug: "open-webui", name: "Open WebUI", category: "workspace", categoryLabel: "دردشة وبيئة عمل", requiredKeys: ["OPENAI_API_KEY", "HF_TOKEN"], action: "chat", description: "إدارة نماذج سحابية ومحلية مع ملاحظة اختلاف الاستضافة." },
  { id: 18, slug: "anything-llm", name: "AnythingLLM", category: "workspace", categoryLabel: "دردشة وبيئة عمل", requiredKeys: ["OPENAI_API_KEY", "OPENROUTER_API_KEY", "HF_TOKEN"], action: "analysis", description: "مسار مستندات واسترجاع معرفي داخل مساحة العمل." },
  { id: 19, slug: "jan-hybrid-ui", name: "Jan.ai Hybrid UI", category: "workspace", categoryLabel: "دردشة وبيئة عمل", requiredKeys: ["HF_TOKEN", "OPENAI_API_KEY"], action: "chat", description: "واجهة هجينة لتجربة نماذج مفتوحة وسحابية." },
  { id: 20, slug: "big-agi", name: "big-AGI", category: "workspace", categoryLabel: "دردشة وبيئة عمل", requiredKeys: ["OPENROUTER_API_KEY", "OPENAI_API_KEY"], action: "chat", description: "مقارنة إجابات متعددة مع الحفاظ على اختيار المزودين صراحة." },
  { id: 21, slug: "sillytavern", name: "SillyTavern", category: "workspace", categoryLabel: "دردشة وبيئة عمل", requiredKeys: ["OPENROUTER_API_KEY", "OPENAI_API_KEY"], action: "chat", description: "بيئة شخصيات تفاعلية مع إبقاء مفاتيح المزود على الخادم." },
  { id: 22, slug: "nextchat", name: "NextChat", category: "workspace", categoryLabel: "دردشة وبيئة عمل", requiredKeys: ["OPENAI_API_KEY", "OPENROUTER_API_KEY"], action: "chat", description: "واجهة محادثة خفيفة للتجارب السريعة." },
  { id: 23, slug: "cline", name: "Cline", category: "developer", categoryLabel: "برمجة وتطوير", requiredKeys: ["OPENROUTER_API_KEY", "OPENAI_API_KEY"], action: "developer", description: "مساعد برمجي يركز على قراءة المستودعات واستدعاء الأدوات." },
  { id: 24, slug: "roo-code", name: "Roo Code", category: "developer", categoryLabel: "برمجة وتطوير", requiredKeys: ["OPENROUTER_API_KEY", "OPENAI_API_KEY"], action: "developer", description: "توزيع مهام البرمجة على أدوار متخصصة داخل الوكيل." },
  { id: 25, slug: "kilo-code", name: "Kilo Code", category: "developer", categoryLabel: "برمجة وتطوير", requiredKeys: ["OPENROUTER_API_KEY", "OPENAI_API_KEY"], action: "developer", description: "مسار تطوير قائم على الوكلاء والبوابات الموحدة." },
  { id: 26, slug: "cursor-web-integrations", name: "Cursor Web Integrations", category: "developer", categoryLabel: "برمجة وتطوير", requiredKeys: ["OPENAI_API_KEY", "OPENROUTER_API_KEY"], action: "developer", description: "إعداد BYOK لمهام التطوير مع توضيح أن المحرر الخارجي منفصل." },
  { id: 27, slug: "tabby", name: "Tabby", category: "developer", categoryLabel: "برمجة وتطوير", requiredKeys: ["HF_TOKEN", "OPENAI_API_KEY"], action: "developer", description: "إكمال أكواد يستفيد من نماذج برمجية مستضافة." },
  { id: 28, slug: "perplexica", name: "Perplexica", category: "research", categoryLabel: "بحث ومعرفة", requiredKeys: ["OPENROUTER_API_KEY", "OPENAI_API_KEY"], action: "research", description: "واجهة بحث معرفي لا تُظهر نتائج حيّة دون موصل بحث متاح." },
  { id: 29, slug: "khoj", name: "Khoj", category: "research", categoryLabel: "بحث ومعرفة", requiredKeys: ["OPENAI_API_KEY", "HF_TOKEN"], action: "research", description: "مساعد لاسترجاع المعرفة من الملفات والويب بعد الإعداد." },
  { id: 30, slug: "hf-inference-playground", name: "HF Inference Playground", category: "research", categoryLabel: "بحث ومعرفة", requiredKeys: ["HF_TOKEN"], action: "research", description: "اختبار نماذج Hugging Face مع عرض قائمة النماذج التي كشفها المفتاح." },
];

export function toolRequiresAvailableKeys(tool: TextAiTool, availableKeys: Partial<Record<ProviderKey, boolean>>) {
  return tool.requiredKeys.every((key) => Boolean(availableKeys[key]));
}

export function toolCategoryLabel(category: ToolCategory) {
  return ({ media: "فيديو ووسائط", agents: "وكلاء وأتمتة", workspace: "دردشة وبيئة عمل", developer: "برمجة وتطوير", research: "بحث ومعرفة" })[category];
}
