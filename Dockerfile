# Étape 1 : Utiliser une image nginx officielle
FROM nginx:alpine

# Étape 2 : Copier les fichiers statiques dans le dossier nginx
COPY . /usr/share/nginx/html

# Étape 3 : Ajouter une configuration nginx personnalisée (facultatif mais recommandé)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port exposé
EXPOSE 80
