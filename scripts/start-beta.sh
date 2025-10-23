#!/bin/bash

# Load OS environment variables
source /etc/environment

# Make local node_modules/.bin available
export PATH=$PATH:$(npm bin)

# Set environment
export PARSETRACK_NODE_ENV=beta

# Pick the correct port
PORT=${PARSETRACK_BETA_PORT:-5001}
export PORT

# Start Remix server using local binary
npx react-router-serve ./build/server/index.js
