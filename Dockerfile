FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    libwebkit2gtk-4.0-dev \
    libgtk-3-dev \
    libsoup-gnome2.4-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    pkg-config \
    postgresql-client \
    git

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

ENV WEBKIT_DISABLE_SANDBOX=1

WORKDIR /app
COPY . .

CMD ["npm", "run", "tauri", "dev"]