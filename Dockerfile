# syntax=docker/dockerfile:1.7

FROM node:24.20.0-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/cms/package.json apps/cms/package.json
COPY packages/content-domain/package.json packages/content-domain/package.json
COPY packages/reference-kit/package.json packages/reference-kit/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM dependencies AS build
WORKDIR /app
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV PUBLIC_URL=http://localhost:3000
ENV BETTER_AUTH_SECRET=build-only-secret-that-is-never-used-at-runtime
RUN pnpm --filter @snipgraph/cms build

FROM node:24.20.0-bookworm-slim AS runtime
LABEL ai.snipgraph.project="cms"
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs
WORKDIR /app
COPY --from=build --chown=nextjs:nodejs /app/apps/cms/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/cms/.next/static ./apps/cms/.next/static
COPY --from=build --chown=nextjs:nodejs /app/apps/cms/src/lib/db/migrations ./apps/cms/src/lib/db/migrations
USER nextjs
WORKDIR /app/apps/cms
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
CMD ["node", "server.js"]
