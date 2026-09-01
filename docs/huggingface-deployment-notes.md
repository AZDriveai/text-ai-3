# Hugging Face Deployment Notes

## External sources

- Hugging Face Spaces overview: https://huggingface.co/docs/hub/en/spaces-overview
- Hugging Face Spaces management guide: https://huggingface.co/docs/huggingface_hub/en/guides/manage-spaces
- Hugging Face discussion on Space error/debug logs: https://discuss.huggingface.co/t/error-debug-logs-in-spaces/172682

## Findings

- Space `wolfaiOM/text-ai-3` is a public Docker Space with subdomain `wolfaiom-text-ai-3` and port 7860.
- Space runtime currently reports `BUILD_ERROR`; earlier metadata error was fixed by using valid YAML emoji metadata.
- Current Dockerfile is present in the Space and uses Node.js 22, pnpm 10.4.1, `pnpm install --frozen-lockfile --prod=false`, `pnpm build`, and port 7860.
- The Hugging Face page currently exposes only a generic build failure summary and reports that detailed logs could not be retrieved because SSE is not enabled.
- Local `pnpm build` succeeds, so the remaining remote failure needs either refreshed build logs or a Docker build/runtime-specific adjustment.

## Final verification

- After installing `git` in the Docker image and binding production to port 7860, Space runtime reached `RUNNING` on `cpu-basic`.
- Public URL: https://wolfaiom-text-ai-3.hf.space
- Browser smoke test succeeded: the RTL TEXT.AI workspace rendered, provider switching to Hugging Face worked, and the live catalog returned 134 Hugging Face models.
- The Hugging Face provider reported `available: true`; OpenAI and OpenRouter remained unconfigured in the Space because their keys were not added as Space secrets.
- A minimal chat request was prepared for end-to-end verification after provider selection.
