#!/bin/bash
source /etc/environment
export DATABASE_URL=$PARSETRACK_LIVE_DATABASE_URL
export PARSETRACK_NODE_ENV=production
npx prisma migrate deploy
npx prisma generate