# --- Etapa 1: instalar dependencias de producción ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# --- Etapa 2: imagen final ---
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Usuario no-root (buena práctica, evita correr el proceso como root)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY . .

USER appuser
EXPOSE 3001

# Ajustá el comando si tu package.json usa otro nombre de script de arranque
CMD ["npm", "start"]
