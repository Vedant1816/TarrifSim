FROM node:20-slim
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /backend
RUN mkdir -p ml && mkdir -p server
COPY server/package*.json ./server/
RUN cd server && npm install
COPY ml/requirements.txt ./ml/
RUN pip install --break-system-packages -r ml/requirements.txt
COPY server/ ./server/
COPY ml/ ./ml/
EXPOSE 3000
CMD ["npm", "run", "dev", "--prefix", "server"]