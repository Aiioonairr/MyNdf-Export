# MyNdf-Export
Outil d'export de note de frais

## Build du contenair
docker build -t semaine-pdf .

## Lancement du contenair
docker run -d -p 8080:80 --name semaine-pdf semaine-pdf

Interface web : localhost:8080
