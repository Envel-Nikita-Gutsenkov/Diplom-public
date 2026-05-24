# Base image
FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat python3 py3-pip

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
# Use npm install to be flexible with lockfile discrepancies
RUN npm install
# Explicitly confirm bcryptjs is installed to avoid runtime ERR_MODULE_NOT_FOUND
RUN ls -d node_modules/bcryptjs

# Prisma generation stage (cached)
COPY prisma ./prisma/
# Pin Prisma version to match package.json to avoid PRISMA 7 breaking changes
RUN npx prisma@6.4.1 generate

# Development image
FROM deps AS development
WORKDIR /app
COPY . .
ENV NODE_ENV development
# Ensure node_modules/.bin is in the PATH so 'next' and 'prisma' can be found
ENV PATH /app/node_modules/.bin:$PATH
# Ensure Prisma 6.4.1 is used and run the dev server + seed
CMD ["sh", "-c", "set -e && sleep 2 && npx prisma generate && prisma migrate deploy && tsx prisma/seed.ts && npm run dev"]

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV DATABASE_URL="postgresql://dummy@localhost:5432/dummy"
# Run next build directly to skip unit tests inside Docker, speeding up the build massively
RUN npx next build
# Pre-compile the seed script so it can be run in pure node without tsx
RUN npx tsc prisma/seed.ts --skipLibCheck --esModuleInterop --module CommonJS --moduleResolution node
RUN mv prisma/seed.js prisma/seed.cjs

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Set this to true to allow Prisma to run in standalone mode if needed
ENV NEXT_SHARP_PATH=/app/node_modules/sharp

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
RUN mkdir -p /app/backups && chown nextjs:nodejs /app/backups
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Install Prisma globally ONLY if you need to run migrations in the runner stage
# However, a better way is to include prisma in the standalone build if possible, 
# or just keep it simple as below for now.
# Install Prisma and bcryptjs locally in the runner to ensure they are available for migrations and seeding
RUN npm install prisma@6.4.1 @prisma/client@6.4.1 bcryptjs

# Copy prisma schema for migrations
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
ENV PORT 3000
# Ensure node_modules/.bin is in the PATH
ENV PATH /app/node_modules/.bin:$PATH

USER nextjs

CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.cjs && node server.js"]
