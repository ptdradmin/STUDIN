# 1. Base Image: Utilise une image Node.js officielle et légère
FROM node:18-alpine AS base

# 2. Définir le répertoire de travail dans le conteneur
WORKDIR /app

# 3. Copier les fichiers de dépendances
COPY package.json ./
COPY package-lock.json ./

# 4. Installer les dépendances
# --frozen-lockfile assure une installation cohérente
RUN npm install --frozen-lockfile

# 5. Copier le reste du code de l'application
COPY . .

# 6. Construire l'application Next.js pour la production
RUN npm run build

# 7. Phase de production: Utilise une image encore plus légère
FROM node:18-alpine AS runner
WORKDIR /app

# Copier uniquement les fichiers nécessaires depuis la phase de construction
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

# Exposer le port sur lequel Next.js s'exécute
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "start"]
