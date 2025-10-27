#!/bin/bash
source /etc/environment
export DATABASE_URL=$PARSETRACK_BETA_DATABASE_URL
export PARSETRACK_NODE_ENV=beta

npx prisma migrate deploy