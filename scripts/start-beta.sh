#!/bin/bash
source /etc/environment
export PARSETRACK_NODE_ENV=beta

# Pick the correct port
PORT=${PARSETRACK_BETA_PORT:-5001}
export PORT

# Start Remix server
react-router-serve ./build/server/index.js
