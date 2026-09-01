# Project TODO

- [x] RTL-first TEXT.AI chat workspace with independent visual identity
- [x] Server-side provider routing for OpenAI, OpenRouter, and Hugging Face
- [x] Secure server-side API key management and provider availability states
- [x] Provider and model selector in the chat interface
- [x] Selectable safe personas including a sarcastic persona and an enthusiastic persona
- [x] Multiple saved conversations with automatic titles
- [x] Rename and delete conversation actions
- [x] Attachment upload flow for files, images, and audio
- [x] Secure storage references for uploaded assets in conversation context
- [x] Search and deep-search tools shown only when a data provider is available
- [x] In-chat image generation and inline result rendering
- [x] Visual and text content analysis tools
- [x] Audio transcription into chat input and summarization flow
- [x] Settings panel for model, persona, language, and appearance preferences
- [x] Tool capability and availability explanations in settings
- [x] Responsive, accessible, polished RTL visual system
- [x] Vitest coverage for provider routing, persona instructions, availability gating, and conversation operations
- [x] Browser and responsive visual verification
- [x] Final checkpoint and user delivery

## Change history

- [x] 2026-08-31: Expanded scope from initial Grok-inspired concept to a production-oriented TEXT.AI workspace with secure provider routing, persistence, media tools, settings, and availability gating.

- [x] Inspect the attached system-prompts-and-models archive and inventory prompt/model families
- [x] Build a normalized prompt-template schema with TEXT.AI identity placeholders
- [x] Replace provider/product self-references with TEXT.AI and selected model roles without copying protected proprietary system prompts verbatim
- [x] Route normalized templates to OpenAI, OpenRouter, and Hugging Face adapter configurations
- [x] Add prompt-library browsing and model-target selection to the TEXT.AI settings/workspace
- [x] Add tests for template normalization, provider targeting, and safe identity substitution

- [x] Add project context and coding rules for TEXT.AI model-assisted code generation
- [x] Add provider/persona/prompt-template routing guidance for OpenAI, OpenRouter, and Hugging Face
- [x] Add reusable code-generation task contract and output requirements
- [x] Add developer scripts and repository-level validation documentation
- [x] Verify TypeScript, tests, and production build after environment hardening

- [x] Wire the chat composer to a real tRPC chat procedure using routeTextAiChat
- [x] Drive provider availability badges and settings from ai.providerStatus
- [x] Add a separate data-provider capability check for search and deep-search gating
- [x] Expand settings with persona and model controls plus a complete tool-capability section
- [x] Drive prompt-library browsing and search from shared prompt templates
- [x] Add developer validation/code-generation scripts to package.json
- [x] Add accessible labels to icon-only controls and complete browser/responsive verification

- [x] Send a completion notice to wolfonlyoman@gmail.com after final verification, without exposing API keys or secrets

## Twenty modern additions requested on 2026-08-31

- [x] Add a keyboard shortcut system and command palette for core actions
- [x] Add conversation search, filtering, and quick navigation
- [x] Add pinning, archiving, and workspace grouping for conversations
- [x] Add autosave for unfinished composer drafts
- [x] Add edit-and-resend, regenerate, and branch-from-message actions
- [x] Add cancel-generation control and clear pending/error states
- [x] Add secure export/share controls for conversations with privacy warnings
- [x] Add copy/download actions for code blocks and markdown responses
- [x] Add syntax highlighting and language labels for generated code
- [x] Add reusable prompt variables, presets, and task templates
- [x] Add side-by-side model comparison mode
- [x] Add response metadata for latency, token estimate, and provider/model
- [x] Add reasoning-depth controls that map safely to supported model families
- [x] Add adjustable font size, contrast, and reduced-motion preferences
- [x] Add light/dark/system appearance controls without breaking RTL tokens
- [x] Add a responsive mobile drawer and touch-friendly interaction states
- [x] Add drag-and-drop attachment upload with preview and file validation
- [x] Add browser voice recording with transcription status and retry handling
- [x] Add generated-image gallery and asset history inside the workspace
- [x] Add privacy controls for clearing local drafts, conversation data, and attachments

## X / YouTube / modern-web adaptation

- [x] Research current interaction patterns from official X and YouTube product surfaces
- [x] Save source URLs and findings for the selected adaptations
- [x] Add a unified activity/feed view for recent chats, generated assets, and tool events
- [x] Add thread-style conversation branching and reply context navigation
- [x] Add media-first preview cards for images, audio transcripts, and visual analysis
- [x] Add watch/read-later style saved outputs for TEXT.AI responses
- [x] Add sharing controls with privacy defaults and clear public/private states
- [x] Add reaction/feedback controls for response quality without fake testimonials
- [x] Add related prompts and next-action suggestions after responses
- [x] Add lazy loading, progressive states, and resilient empty/error states for media-heavy UI

## Follow-up review findings

- [x] Perform and document a browser QA pass with findings and fixes for desktop and mobile layouts
- [x] Make the command palette execute real core actions: new chat, settings, prompt library, tools, and search
- [x] Add automated coverage for shortcut handling and draft autosave behavior

- [x] Add concrete QA findings with exact fixes to the browser review notes
- [x] Add command-palette actions for opening tools and app-level search/navigation
- [x] Add automated tests for shortcut and command-palette action mapping

## Final interaction QA gaps

- [x] Focus the conversation search field from the command palette and add keyboard result navigation
- [x] Add a distinct global command action for opening or toggling the tools panel
- [x] Add automated tests for command actions and conversation navigation behavior

## Final QA follow-up

- [x] Implement arrow-key, active-result, Enter-to-open, and empty-state behavior for conversation search
- [x] Add a standalone global launcher so the command palette can open tools while the tools panel is closed
- [x] Add UI-level regression coverage for command actions and conversation navigation

## QA gaps before checkpoint

- [x] Make Enter on a filtered conversation select and open the active conversation view
- [x] Add a standalone global command palette launcher independent of the tools panel
- [x] Add UI-focused regression coverage for shortcuts and conversation navigation

## Stability and privacy follow-up

- [x] Replace string-only conversations with stable unique IDs for safe rename/delete behavior
- [x] Add dedicated privacy controls for clearing drafts, conversation data, and attachment references
- [x] Add tests for duplicate titles, targeted rename/delete, and privacy clearing

## Privacy QA follow-up

- [x] Add a dedicated helper and UI action to clear local draft, conversation, and attachment-reference storage
- [x] Add Vitest coverage for privacy clearing with existing and empty local storage

## Final integration gaps

- [x] Use live provider status labels in both sidebar and settings
- [x] Add a dedicated server/client data-provider availability source for search and deep-search
- [x] Expand settings tool capabilities to cover attachments, transcription, visual analysis, images, and storage
- [x] Implement prompt-library filtering against the complete shared template list
- [x] Add aria-labels to remaining icon-only message actions and re-run accessibility QA

## Attachment reliability follow-up

- [x] Add drag-and-drop and multi-file attachment handling with visible validation/loading/error states
- [x] Pass attachment references into chat mutation context and persist them with conversation records
- [x] Add robust upload error feedback for unsupported types, oversize files, failed uploads, and unauthenticated users

## Attachment persistence QA follow-up

- [x] Serialize multi-file uploads to keep loading and error state accurate per file
- [x] Store attachment references on each conversation record and restore them when selecting a conversation
- [x] Add regression coverage for multi-file state and per-conversation attachment persistence

## Media integration QA follow-up

- [x] Add image-generation pending state, disabled controls, and consistent live availability labels
- [x] Add audio transcription pending/retry states and a transcript summarization action
- [x] Add regression tests for image and audio success/error/pending flows

- [x] Localize the 404 fallback page to Arabic RTL to keep TEXT.AI language consistency across routes

## Transcript summary follow-up

- [x] Add a dedicated server-routed transcript summary action after audio transcription
- [x] Add explicit summary loading, success, failure, and retry controls in the composer

## Summary retry QA follow-up

- [x] Store the last transcript explicitly for reuse
- [x] Add a dedicated composer button to retry summarization without retranscribing
- [x] Add regression tests for transcript summary pending, success, failure, and retry

## Pre-checkpoint corrections

- [x] Make Enter on a filtered conversation execute the same open/select behavior as a click
- [x] Add rendered UI regression coverage for shortcuts, command palette, and conversation navigation
- [x] De-duplicate the settings capability matrix and make attachment, storage, transcription, and image availability accurate

## Conversation organization follow-up

- [x] Add grouped conversation sections for pinned, recent, and archived items
- [x] Add archived view with restore/unarchive controls
- [x] Add regression coverage for pin, archive, restore, and grouping behavior

## Response workspace follow-up

- [x] Export complete conversation message history with an explicit privacy confirmation
- [x] Add a saved-outputs panel with reopen and remove actions
- [x] Replace the ad-hoc feedback marker with explicit useful/not-useful states and visible acknowledgement

## Response data integrity follow-up

- [x] Store message history on each conversation record and export complete per-conversation histories
- [x] Add visible feedback acknowledgement and structured useful/not-useful persistence

## Conversation history integrity follow-up

- [x] Centralize message appends so assistant, image, transcription, summary, and error messages update the active conversation record
- [x] Export complete histories for multiple conversations after switching between them
- [x] Add regression coverage for complete multi-conversation export histories

## Activity feed integrity follow-up

- [x] Populate the feed from generated images, uploads, transcriptions, summaries, and chat/tool actions
- [x] Persist structured activity records when tool actions complete
- [x] Add regression coverage for activity-item generation across chats, saved outputs, assets, and tools

## Activity coverage expansion

- [x] Add regression fixtures for generated images, uploads, transcriptions, summaries, and normal chat completions
- [x] Refine the activity builder contract so each event type is independently testable

## Typed activity contract follow-up

- [x] Introduce discriminated activity event types for chat, image, upload, transcription, and summary events
- [x] Add event-specific factories and tests for each activity kind
- [x] Re-run final validation before marking activity coverage complete

## Activity factory QA follow-up

- [x] Add explicit factory helpers for chat, image, upload, transcription, and summary activities
- [x] Split activity regression tests into independent per-kind cases
- [x] Re-run check, tests, and build after the factory/test refinement

## Conversation title follow-up

- [x] Derive and persist automatic conversation titles from the first user message

## Automatic title integrity follow-up

- [x] Add a dedicated first-message title helper independent of placeholder wording
- [x] Ensure automatic titles are derived exactly once and never overwrite manual renames
- [x] Add tests for first-message derivation, persistence after reload, and later-message stability

## Reload-safe title persistence

- [x] Rehydrate the active conversation’s persisted message history on initial load
- [x] Persist explicit title-generation state so auto-titling runs exactly once after reload
- [x] Add reload-flow regression coverage proving auto titles remain stable after restoration

## Active conversation restoration follow-up

- [x] Persist and restore the last active conversation ID on reload
- [x] Set titleGenerated true when automatic title derivation first occurs
- [x] Add regression coverage for reload restoration, active selection, and post-reload title stability

## Reload restoration test follow-up

- [x] Add tests for restoring the active conversation ID from localStorage
- [x] Add tests proving titleGenerated persists and blocks regeneration after reload
- [x] Add state-level coverage for restoring messages and attachments with the active conversation

## Explicit localStorage regression

- [x] Simulate persisted textai-active-conversation storage and verify matching startup selection

## Gap corrections before next checkpoint

- [x] Send real multimodal image/file content to supported provider APIs
- [x] Make edit-and-resend and regenerate replace the correct downstream assistant turn
- [x] Abort in-flight chat requests and clear pending state immediately
- [x] Add persistent font-size preference and apply it to workspace content
- [x] Finish semantic light/dark/system theming for the workspace

## Mobile drawer QA corrections

- [x] Start the mobile sidebar closed and verify open/close behavior across small breakpoints
- [x] Add explicit touch-friendly hit targets and pressed states for mobile controls
- [x] Run a fresh mobile visual QA pass after the drawer changes

## Mobile drawer interaction QA

- [x] Verify drawer default closed state, open button, close button, and backdrop close at multiple phone breakpoints

## Remaining QA corrections

- [x] Add explicit tests for persona instructions and provider/data availability gating
- [x] Add per-code-block copy/download controls with language-aware presentation
- [x] Add recording transcription status and retry state
- [x] Build a dedicated generated-image gallery/history panel with reopen/remove behavior
- [x] Complete semantic token migration across message, composer, panels, and states

## Final media and gating QA

- [x] Add a data-provider availability gating regression test
- [x] Render recording/transcription status with an explicit retry action
- [x] Add image gallery reopen/restore behavior

## Final behavior corrections

- [x] Make recording retry invoke transcription for the last recorded audio attachment
- [x] Add regression coverage for recording retry and status transitions
- [x] Make gallery items reopen in a full preview or restore their asset into the workspace

## Final feature additions

- [x] Add reusable prompt variables and presets to the prompt library
- [x] Add functional side-by-side model comparison flow

## Comparison and preset hardening

- [x] Render fillable prompt-variable fields and persist reusable values
- [x] Add explicit left/right provider and model selectors to comparison mode
- [x] Add independent comparison loading/error state and focused regression tests

## Comparison final QA

- [x] Add explicit left/right model selectors and use them in requests
- [x] Add focused comparison success/error regression tests

## Thirty-tool and provider-discovery pass

- [x] Add the thirty-tool catalog from the attached brief with provider-key requirements, capability states, and honest availability labels.
- [x] Discover provider-accessible model IDs from the server using OPENAI_API_KEY, OPENROUTER_API_KEY, and HF_TOKEN without exposing secrets to the client.
- [x] Replace hardcoded model choices with discovered models plus safe fallbacks and preserve provider switching.
- [x] Correct UI interaction semantics and verify all forms, buttons, panels, and responsive layout states.
- [x] Add regression coverage for Hugging Face key aliases, model discovery, tool catalog integrity, and model selection fallback.
- [x] Run typecheck, automated tests, production build, and runtime/browser smoke verification.
- [x] Create a new private GitHub repository and push the verified project to its main branch.
