# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Instalar pnpm si es necesario
RUN npm install -g pnpm

# Instalar dependencias
RUN if [ -f "pnpm-lock.yaml" ]; then \
    pnpm install; \
    else \
    npm install; \
    fi

# Copiar el resto del código
COPY . .

# Construir la aplicación
RUN if [ -f "pnpm-lock.yaml" ]; then \
    pnpm run build; \
    else \
    npm run build; \
    fi

# Etapa de producción
FROM node:20-alpine AS runner

WORKDIR /app

# Crear usuario no root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios desde builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Cambiar propietario de los archivos
RUN chown -R nextjs:nodejs /app

# Cambiar al usuario no root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Variable de entorno
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Comando para iniciar la aplicación
CMD ["node", "server.js"]