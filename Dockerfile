# FROM node:20-alpine

# WORKDIR /app
# LABEL project="local-chat"

# # تنظیم میرور npm ایران
# RUN npm config set registry https://mirror2.chabokan.net/npm/

# # بک‌اند
# COPY server/package.json server/package-lock.json ./server/
# RUN cd server && npm ci --production

# # فرانت
# COPY frontEnd/package.json frontEnd/package-lock.json ./frontEnd/
# RUN cd frontEnd && npm ci

# # کپی بقیه فایل‌ها
# COPY . .

# # ساخت گواهی
# RUN node gen-cert.js

# # پورت‌ها
# EXPOSE 3000 5173 9000

# # ران کردن هر سه سرویس
# CMD node server/index.js & \
#     node peerServer.js & \
#     cd frontEnd && npx vite --host 0.0.0.0 --port 5173 & \
#     wait


FROM node:20-alpine
WORKDIR /app
LABEL project="local-chat"

# بک‌اند
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev

# فرانت
COPY frontEnd/package.json frontEnd/package-lock.json ./frontEnd/
RUN cd frontEnd && npm ci

# کپی بقیه فایل‌ها
COPY . .

# Build فرانت برای production
RUN cd frontEnd && npm run build

# پاک کردن node_modules فرانت (دیگه لازم نیست)
RUN rm -rf frontEnd/node_modules

# فقط یه پورت - Render فقط یکی قبول میکنه
EXPOSE 3000

CMD node peerServer.js & node server/index.js
