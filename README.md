# **MyNdf-Export**

MyNDF is an open-source tool that allows you to export multiple expense report receipts as a PDF. It was developed using HTML/CSS/JS.

### **Dockerfile**

The Dockerfile can be adapted if you want to change the image (for example, using apache2 instead of nginx). The port 8080 used during deployment can also be modified to customize it.

### **Building the container**

```bash
docker build -t myndf .
```

### **Running the container**

```bash
docker run -d -p 8080:80 --name myndf myndf
```

**Web interface:** localhost:8080
