# Use official Node.js LTS image
FROM node:18-alpine

USER root

# Create non-root user and directories
RUN mkdir -p /home/node/app /home/node/config && \
    chown -R node:node /home/node

# Set working directory
WORKDIR /home/node

# Copy entire config folder (creates /home/node/config/)
COPY --chown=node:node config /home/node/config/

# Copy entire app folder (creates /home/node/app/)
COPY --chown=node:node app /home/node/app/

# Set working directory
WORKDIR /home/node/app

# Install dependencies
RUN npm install

# Make sure all files and dirs belong to user node
RUN chown node:node /home/node/*

# Switch to non-root user
USER node

# Expose the app port (change if needed)
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "server", "--", "--config", "/home/node/config/app.config"]
