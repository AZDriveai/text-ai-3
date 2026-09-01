FROM node:22-bookworm-slim

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NODE_ENV=production
ENV PORT=7860

RUN npm install --global pnpm@10.4.1

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile --prod=false

COPY . .
RUN pnpm build

EXPOSE 7860

CMD ["pnpm", "start"]
