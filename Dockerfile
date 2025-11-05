FROM node:20

# Install required libraries for canvas
RUN apt-get update && \
    apt-get install -y libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies globally
RUN npm install express canvas gifencoder body-parser

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
