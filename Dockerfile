
# Utiliser l'image Node.js
FROM node:22-alpine AS build

# Repertoire
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

#
RUN npm install --legacy-peer-deps

# Copier le reste de l'application
COPY . .

# Construire l'application
RUN npm run ng build

# Utiliser Nginx pour servir l'application
FROM nginx:alpine


# Copier les fichiers construits dans le repertoire Nginx
COPY --from=build /app/dist/lightoil  /usr/share/nginx/html

# Exposer le port
EXPOSE 80

#
CMD ["nginx", "-g", "daemon off;"]
