FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive \
    TERM=xterm-256color \
    EXPO_NO_TELEMETRY=1 \
    DOTNET_ROOT=/usr/share/dotnet \
    DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DOTNET_NOLOGO=1 \
    DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1

RUN apt-get update \
    && apt-get install -y \
        build-essential \
        git \
        vim \
        curl \
        wget \
        sudo \
        unzip \
        software-properties-common \
        ca-certificates \
        gnupg \
        ripgrep \
        fd-find \
    && ln -s /usr/bin/fdfind /usr/local/bin/fd \
    && rm -rf /var/lib/apt/lists/*

# Node 22 LTS
RUN mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && corepack enable \
    && npm install -g eas-cli tree-sitter-cli \
    && rm -rf /var/lib/apt/lists/*

# .NET SDK (includes the ASP.NET Core runtime). Override with:
#   docker build --build-arg DOTNET_CHANNEL=9.0 -t appdev .
ARG DOTNET_CHANNEL=10.0
RUN apt-get update \
    && apt-get install -y libicu74 libssl3t64 zlib1g \
    && curl -fsSL https://dot.net/v1/dotnet-install.sh -o /tmp/dotnet-install.sh \
    && bash /tmp/dotnet-install.sh --channel "$DOTNET_CHANNEL" --install-dir "$DOTNET_ROOT" \
    && ln -s "$DOTNET_ROOT/dotnet" /usr/local/bin/dotnet \
    && rm -f /tmp/dotnet-install.sh \
    && rm -rf /var/lib/apt/lists/* \
    && dotnet --info

RUN add-apt-repository ppa:neovim-ppa/unstable -y \
    && apt-get update \
    && apt-get install -y neovim \
    && rm -rf /var/lib/apt/lists/*

ARG USERNAME=dev
ARG USER_UID=1000
ARG USER_GID=1000

# Lets `dotnet tool install --global ...` (e.g. dotnet-ef) work for the dev user
ENV PATH="$PATH:/home/$USERNAME/.dotnet/tools"

RUN userdel -r ubuntu \
    && groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

COPY --chown=$USERNAME:$USERNAME .bashrc /home/$USERNAME/.bashrc

USER $USERNAME
WORKDIR /workspace

RUN git clone https://github.com/LazyVim/starter ~/.config/nvim \
    && rm -rf ~/.config/nvim/.git

EXPOSE 8081

CMD ["/bin/bash"]
