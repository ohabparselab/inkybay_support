#!/bin/bash

# Load OS environment variables
source /etc/environment

# Make local node_modules/.bin available
export PATH=$PATH:$(npm bin)
export DATABASE_URL=$PARSETRACK_LIVE_DATABASE_URL

# Set environment
export PARSETRACK_NODE_ENV=production

# Pick the correct port
PORT=${PARSETRACK_LIVE_PORT:-5000}
export PORT

# Start Remix server using local binary
npx react-router-serve ./build/server/index.js
