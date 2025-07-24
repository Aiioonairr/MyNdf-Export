# Utilise une image nginx légère pour servir les fichiers statiques
FROM nginx:alpine

# Copie les fichiers de l'application dans le répertoire de nginx
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Expose le port 80
EXPOSE 80

# Nginx démarre automatiquement avec l'image
CMD ["nginx", "-g", "daemon off;"]