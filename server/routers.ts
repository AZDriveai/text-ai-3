import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { storagePut } from "./storage";
import { generateImage } from "./_core/imageGeneration";
import { transcribeAudio } from "./_core/voiceTranscription";
import { listProviderModels, providerAvailability, routeTextAiChat } from "./providerRouting";
import { buildSystemPrompt, textAiPromptTemplates } from "../shared/promptTemplates";

const providerSchema = z.enum(["openai", "openrouter", "huggingface"]);
export function dataProviderAvailability() { return { search: Boolean(process.env.DATA_PROVIDER_API_KEY || process.env.BUILT_IN_FORGE_API_KEY), deepSearch: Boolean(process.env.DATA_PROVIDER_API_KEY) }; }

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  ai: router({
    providerStatus: publicProcedure.query(() => providerAvailability()),
    providerModels: publicProcedure.query(() => listProviderModels()),
    dataProviderStatus: publicProcedure.query(() => dataProviderAvailability()),
    generateImage: publicProcedure
      .input(z.object({ prompt: z.string().min(3).max(4000) }))
      .mutation(({ input }) => generateImage({ prompt: input.prompt })),
    transcribeAudio: protectedProcedure
      .input(z.object({ audioUrl: z.string().startsWith("/manus-storage/"), language: z.string().length(2).optional() }))
      .mutation(({ input }) => transcribeAudio({ audioUrl: input.audioUrl, language: input.language, prompt: "TEXT.AI audio transcription" })),
    summarizeTranscript: publicProcedure
      .input(z.object({ provider: providerSchema, model: z.string().min(1).max(160), transcript: z.string().min(1).max(30000) }))
      .mutation(({ input }) => routeTextAiChat({ provider: input.provider, model: input.model, templateId: "textai-general-assistant", messages: [{ role: "user", content: input.transcript }], extraInstruction: "لخّص هذا التفريغ الصوتي في نقاط عملية، واذكر القرارات والأسئلة المفتوحة، وبالعربية الواضحة." })),
    analyzeContent: publicProcedure
      .input(z.object({ provider: providerSchema, model: z.string().min(1).max(160), prompt: z.string().min(1).max(4000), attachments: z.array(z.object({ name: z.string().max(180), url: z.string().startsWith("/manus-storage/"), contentType: z.string().max(120) })).min(1).max(8) }))
      .mutation(({ input }) => routeTextAiChat({ provider: input.provider, model: input.model, templateId: "textai-general-assistant", messages: [{ role: "user", content: input.prompt }], attachments: input.attachments, extraInstruction: "حلّل المرفقات المرئية والنصية المتاحة. اذكر ما تمكنت من قراءته، وما لا يمكن الجزم به، ثم قدّم نتيجة منظمة بالعربية." })),
    uploadAttachment: protectedProcedure
      .input(z.object({ fileName: z.string().min(1).max(180), contentType: z.string().min(1).max(120), dataBase64: z.string().min(1).max(8_000_000) }))
      .mutation(async ({ input, ctx }) => {
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
        const bytes = Buffer.from(input.dataBase64, "base64");
        if (bytes.length > 6_000_000) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "الملف أكبر من الحد المسموح." });
        return storagePut(`users/${ctx.user.id}/attachments/${safeName}`, bytes, input.contentType);
      }),
    chat: publicProcedure
      .input(z.object({
        provider: providerSchema,
        model: z.string().min(1).max(160),
        templateId: z.string().min(1).max(100),
        messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(30000) })).min(1).max(40),
        attachments: z.array(z.object({ name: z.string().max(180), url: z.string().startsWith("/manus-storage/"), contentType: z.string().max(120) })).max(8).optional(),
        extraInstruction: z.string().max(4000).optional(),
        reasoningDepth: z.enum(["minimal", "low", "medium", "high"]).optional(),
      }))
      .mutation(({ input }) => routeTextAiChat(input)),
    promptTemplates: publicProcedure
      .input(z.object({ provider: providerSchema.optional() }).optional())
      .query(({ input }) => input?.provider
        ? textAiPromptTemplates.filter((template) => template.supportedProviders.includes(input.provider!))
        : textAiPromptTemplates),
    preparePrompt: publicProcedure
      .input(z.object({
        provider: providerSchema,
        templateId: z.string().min(1).max(100),
        extraInstruction: z.string().max(4000).optional(),
      }))
      .query(({ input }) => ({
        provider: input.provider,
        templateId: input.templateId,
        prompt: buildSystemPrompt(input.templateId, input.provider, input.extraInstruction),
      })),
  }),
});

export type AppRouter = typeof appRouter;
