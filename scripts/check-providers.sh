#!/usr/bin/env bash
set -u
cd "$(dirname "$0")/.."
set -a
. ./.env
set +a

check_models() {
  local label="$1"
  local url="$2"
  local token="$3"
  local output
  local status
  output=$(mktemp)
  status=$(curl -sS --max-time 20 -o "$output" -w '%{http_code}' "$url" -H "Authorization: Bearer $token" -H 'Accept: application/json' || printf '000')
  if [ "$status" = "200" ]; then
    local count
    count=$(node -e 'const fs=require("fs"); try { const v=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); console.log(Array.isArray(v.data) ? v.data.length : 0); } catch { console.log(0); }' "$output")
    printf '%s: status=%s models=%s\n' "$label" "$status" "$count"
  else
    printf '%s: status=%s models=unavailable\n' "$label" "$status"
  fi
  rm -f "$output"
}

check_models 'OpenAI' 'https://api.openai.com/v1/models' "${OPENAI_API_KEY:-}"
check_models 'OpenRouter' 'https://openrouter.ai/api/v1/models' "${OPENROUTER_API_KEY:-}"
check_models 'Hugging Face' 'https://router.huggingface.co/v1/models' "${HF_TOKEN:-${HUGGINGFACE_API_KEY:-}}"
