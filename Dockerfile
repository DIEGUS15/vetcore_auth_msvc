FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD  ["npm", "run", "dev"]

# CMD ["node", "src/publishUser.js" ] esto es para probar la creacion de un usuario y el manejo de la cola con rabbitmq y la notificacion al gmail