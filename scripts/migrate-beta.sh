#!/bin/bash
source /etc/environment
export DATABASE_URL=$PARSETRACK_BETA_DATABASE_URL
export PARSETRACK_NODE_ENV=beta
npx prisma migrate resolve --applied 20251203064131_update_chats_reviews_table
npx prisma migrate deploy
npx prisma generate