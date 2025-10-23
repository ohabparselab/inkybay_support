#!/bin/bash
source /etc/environment
export PATH=$PATH:$(npm bin)
export DATABASE_URL=$PARSETRACK_BETA_DATABASE_URL
export PARSETRACK_NODE_ENV=beta

npx ts-node prisma/seed.ts