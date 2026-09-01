import { describe, expect, it } from "vitest";
import { activityEventToRecord, buildActivityItems, createChatActivity, createImageActivity, createUploadActivity, createTranscriptionActivity, createSummaryActivity } from "../shared/activity";

describe("typed activity factories", () => {
  it("creates a chat activity", () => expect(activityEventToRecord(createChatActivity("خطة"))).toMatchObject({ label: "اكتملت محادثة", detail: "خطة" }));
  it("creates an image activity", () => expect(activityEventToRecord(createImageActivity("غلاف"))).toMatchObject({ label: "تم توليد صورة", detail: "غلاف" }));
  it("creates an upload activity", () => expect(activityEventToRecord(createUploadActivity("brief.pdf"))).toMatchObject({ label: "تم رفع مرفق", detail: "brief.pdf" }));
  it("creates a transcription activity", () => expect(activityEventToRecord(createTranscriptionActivity("نص"))).toMatchObject({ label: "تم تفريغ تسجيل صوتي", detail: "نص" }));
  it("creates a summary activity", () => expect(activityEventToRecord(createSummaryActivity("قرارات"))).toMatchObject({ label: "تم تلخيص تسجيل", detail: "قرارات" }));
  it("composes live, tool, saved, and pinned activity", () => {
    const items = buildActivityItems({ messages: 4, attachments: 1 }, [createChatActivity("خطة"), createImageActivity("غلاف"), createUploadActivity("brief.pdf"), createTranscriptionActivity("نص"), createSummaryActivity("قرارات")], [{ id: "saved", content: "مخرج" }], ["جلسة"]);
    expect(items).toHaveLength(8);
  });
});
