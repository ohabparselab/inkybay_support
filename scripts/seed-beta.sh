#!/bin/bash

# Load system environment variables
source /etc/environment

# Make local node_modules/.bin available
export PATH=$PATH:$(npm bin)

# Set the correct database and environment
export DATABASE_URL=$PARSETRACK_BETA_DATABASE_URL
export PARSETRACK_NODE_ENV=beta

# Run Prisma seed using ts-node in ESM mode
node --loader ts-node/esm prisma/seed.ts
