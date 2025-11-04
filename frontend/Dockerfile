# Usa una imagen base de Nginx, que es un servidor web ligero
FROM nginx:alpine

# Copia los archivos del proyecto (que ahora están en esta carpeta)
# a la carpeta donde Nginx sirve el contenido.
COPY . /usr/share/nginx/html

# Expone el puerto 80, que es el puerto por defecto de Nginx
EXPOSE 80
