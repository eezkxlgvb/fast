FROM node:18-alpine

WORKDIR /app

# کپی کردن فایل‌های package.json از پوشه backend
COPY backend/package*.json ./backend/

WORKDIR /app/backend

RUN npm install --production

# کپی کردن کل کد backend
COPY backend/ .

EXPOSE 3000

CMD ["npm", "start"]
