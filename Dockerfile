FROM node:20-alpine

WORKDIR /app
LABEL project="local-chat"
# گواهی‌ها رو بساز
RUN apk add --no-cache openssl && \
    openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout key.pem -out cert.pem -days 365 \
    -subj "/CN=localhost"

# تنظیم میرور npm ایران
RUN npm config set registry https://mirror2.chabokan.net/npm/

# بک‌اند
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --production

# فرانت
COPY frontEnd/package.json frontEnd/package-lock.json ./frontEnd/
RUN cd frontEnd && npm ci

# کپی بقیه فایل‌ها
COPY . .

# پورت‌ها
EXPOSE 3000 5173 9000

# ران کردن هر سه سرویس
CMD node server/index.js & \
    node peerServer.js & \
    cd frontEnd && npx vite --host 0.0.0.0 --port 5173 & \
    wait