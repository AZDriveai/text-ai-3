export type ActivityKind = "chat" | "image" | "upload" | "transcription" | "summary";
export type ActivityEvent = { id: string; kind: ActivityKind; detail: string; createdAt: number };
export type ActivityRecord = { id: string; label: string; detail: string; tone?: "lime" | "muted" };

const labels: Record<ActivityKind, string> = { chat: "اكتملت محادثة", image: "تم توليد صورة", upload: "تم رفع مرفق", transcription: "تم تفريغ تسجيل صوتي", summary: "تم تلخيص تسجيل" };

export function createActivityEvent(kind: ActivityKind, detail: string, id = crypto.randomUUID()): ActivityEvent { return { id, kind, detail, createdAt: Date.now() }; }
export const createChatActivity = (detail: string) => createActivityEvent("chat", detail);
export const createImageActivity = (detail: string) => createActivityEvent("image", detail);
export const createUploadActivity = (detail: string) => createActivityEvent("upload", detail);
export const createTranscriptionActivity = (detail: string) => createActivityEvent("transcription", detail);
export const createSummaryActivity = (detail: string) => createActivityEvent("summary", detail);

export function activityEventToRecord(event: ActivityEvent): ActivityRecord { return { id: event.id, label: labels[event.kind], detail: event.detail, tone: "lime" }; }

export function buildActivityItems(active: { messages: number; attachments: number }, events: ActivityEvent[], savedOutputs: Array<{ id: string; content: string }>, pinnedTitles: string[]): ActivityRecord[] {
  return [{ id: "active", label: "جلسة نشطة", detail: `${active.messages} رسائل · ${active.attachments} مرفقات`, tone: "lime" }, ...events.slice().reverse().map(activityEventToRecord), ...savedOutputs.slice(-3).reverse().map((item) => ({ id: item.id, label: "مخرج محفوظ", detail: item.content.slice(0, 80) })), ...pinnedTitles.map((title, index) => ({ id: `pin-${index}-${title}`, label: "محادثة مثبتة", detail: title }))];
}
