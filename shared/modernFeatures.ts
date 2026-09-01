export type ModernFeatureStatus = "interactive" | "planned";

export type ModernFeature = {
  id: string;
  label: string;
  category: "workflow" | "media" | "accessibility" | "privacy";
  status: ModernFeatureStatus;
  description: string;
};

export const modernFeatures: ModernFeature[] = [
  { id: "command-palette", label: "اختصارات الأوامر", category: "workflow", status: "interactive", description: "فتح الإجراءات الأساسية من لوحة مفاتيح واحدة." },
  { id: "conversation-search", label: "بحث المحادثات", category: "workflow", status: "interactive", description: "العثور على جلسة أو مخرجات بسرعة." },
  { id: "pin-archive", label: "تثبيت وأرشفة", category: "workflow", status: "interactive", description: "تنظيم المساحات الخاصة دون تغيير الخصوصية." },
  { id: "draft-autosave", label: "مسودة تلقائية", category: "workflow", status: "interactive", description: "الحفاظ على النص غير المرسل محلياً." },
  { id: "message-branching", label: "تعديل وإعادة الإرسال", category: "workflow", status: "interactive", description: "إنشاء مسار جديد من رسالة سابقة." },
  { id: "cancel-generation", label: "إيقاف التوليد", category: "workflow", status: "interactive", description: "إلغاء الطلب وإظهار حالة واضحة." },
  { id: "secure-sharing", label: "تصدير ومشاركة آمنة", category: "privacy", status: "interactive", description: "مشاركة صريحة مع تحذير الخصوصية." },
  { id: "code-actions", label: "نسخ الكود", category: "workflow", status: "interactive", description: "نسخ وتنزيل مخرجات الكود." },
  { id: "syntax-highlighting", label: "تمييز الصياغة", category: "workflow", status: "interactive", description: "إظهار لغة الكود وحالته بوضوح." },
  { id: "prompt-variables", label: "متغيرات البرومبت", category: "workflow", status: "interactive", description: "إعادة استخدام قوالب TEXT.AI بمعلمات واضحة." },
  { id: "model-compare", label: "مقارنة النماذج", category: "workflow", status: "interactive", description: "مقارنة نتائج المزودات دون كشف المفاتيح." },
  { id: "response-metadata", label: "بيانات الاستجابة", category: "workflow", status: "interactive", description: "عرض المزود والنموذج والوقت والتقدير." },
  { id: "reasoning-depth", label: "عمق التفكير", category: "workflow", status: "interactive", description: "خيارات آمنة حسب قدرات النموذج." },
  { id: "accessibility", label: "إمكانية الوصول", category: "accessibility", status: "interactive", description: "حجم نص وتباين وحركة مخفّضة." },
  { id: "appearance", label: "المظهر", category: "accessibility", status: "interactive", description: "تفضيل فاتح/داكن/نظام مع دعم RTL." },
  { id: "mobile-drawer", label: "لوحة الهاتف", category: "accessibility", status: "interactive", description: "تجربة لمس واستجابة للشاشات الصغيرة." },
  { id: "attachment-drop", label: "سحب المرفقات", category: "media", status: "interactive", description: "معاينة والتحقق من الملفات قبل الإرسال." },
  { id: "voice-recording", label: "تسجيل صوتي", category: "media", status: "interactive", description: "حالة تسجيل وتفريغ وإعادة محاولة." },
  { id: "image-gallery", label: "معرض الصور", category: "media", status: "interactive", description: "تاريخ منظم للمخرجات المرئية." },
  { id: "privacy-controls", label: "مسح البيانات", category: "privacy", status: "interactive", description: "إزالة المسودات والمراجع المحلية بوضوح." },
];
