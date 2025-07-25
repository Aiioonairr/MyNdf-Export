# **MyNdf-Export**

MyNDF is an open-source tool that allows you to export multiple expense report receipts as a PDF. It was developed using HTML/CSS/JS.

### **Dockerfile**

The Dockerfile can be adapted if you want to change the image (for example, using apache2 instead of nginx). The port 8080 used during deployment can also be modified to customize it.

```dockerfile
FROM nginx:alpine

COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### **Building the container**

```docker
docker build -t myndf .
```

### **Running the container**

```docker
docker run -d -p 8080:80 --name myndf myndf
```

**Web interface:** : localhost:8080
