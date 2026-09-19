FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

ENV TERM=xterm-256color

RUN apt-get update \
    && apt-get install -y \
        build-essential \
        git \
        vim \
        curl \
        sudo \
        software-properties-common \
        wget \
        ripgrep \
        fd-find \
        ca-certificates \
        gnupg \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g eas-cli

RUN add-apt-repository ppa:neovim-ppa/unstable -y \
    && apt-get update \
    && apt-get install -y neovim

ARG USERNAME=dev
ARG USER_UID=1000
ARG USER_GID=1000


RUN userdel -r ubuntu \
    && groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoersCOPY .bashrc /home/$USERNAME/.bashrc

RUN chown $USERNAME:$USERNAME /home/$USERNAME/.bashrc

USER $USERNAME
WORKDIR /workspace

RUN git clone https://github.com/LazyVim/starter ~/.config/nvim \
    && rm -rf ~/.config/nvim/.git

CMD ["/bin/bash"]
