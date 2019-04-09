FROM node:8-slim

# installs, work.
RUN apt-get update \
    && apt-get install -y \
      apt-transport-https ca-certificates curl wget software-properties-common \
      build-essential checkinstall libreadline-gplv2-dev libncursesw5-dev libssl-dev libsqlite3-dev tk-dev libgdbm-dev libc6-dev libbz2-dev \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    # && apt-get purge --auto-remove -y curl \
    && rm -rf /src/*.deb

# It's a good idea to use dumb-init to help prevent zombie chrome processes.
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

# Install python2.7 for bitcoinlib-js-c0ban
RUN cd /usr/src && \
    wget https://www.python.org/ftp/python/2.7.15/Python-2.7.15.tgz && \
    tar xzf Python-2.7.15.tgz && \
    cd Python-2.7.15 && \
    ./configure --enable-optimizations && \
    make altinstall

COPY . /e2e-test
WORKDIR /e2e-test

RUN npm install && \
    npm config set python /usr/local/bin/python2.7

ENTRYPOINT ["dumb-init", "--"]