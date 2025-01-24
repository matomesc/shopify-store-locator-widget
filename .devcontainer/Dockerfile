# [Choice] Node.js version (use -bullseye variants on local arm64/Apple Silicon): 18, 16, 14, 18-bullseye, 16-bullseye, 14-bullseye, 18-buster, 16-buster, 14-buster
ARG VARIANT=22-bookworm
FROM mcr.microsoft.com/devcontainers/javascript-node:${VARIANT}

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node modules
# RUN su node -c "npm install -g <your-package-list-here>"


ARG USERNAME=node
ARG HOME=/home/$USERNAME
RUN chsh -s /usr/bin/zsh node

# Persist vscode extensions
RUN mkdir -p $HOME/.vscode-server/extensions \
  $HOME/.vscode-server-insiders/extensions \
  && chown -R $USERNAME \
  $HOME/.vscode-server \
  $HOME/.vscode-server-insiders

# History
RUN SNIPPET="export HISTFILE=/commandhistory/.zsh_history" \
  && mkdir /commandhistory \
  && touch /commandhistory/.zsh_history \
  && chown -R $USERNAME /commandhistory \
  && echo $SNIPPET >> "$HOME/.zshrc" \
  && echo "HISTSIZE=10000000" >> "$HOME/.zshrc" \
  && echo "SAVEHIST=10000000" >> "$HOME/.zshrc"

# Install aws cli
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
  && unzip awscliv2.zip \
  && ./aws/install
