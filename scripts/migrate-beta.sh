#!/bin/bash
source /etc/environment
export DATABASE_URL=$PARSETRACK_BETA_DATABASE_URL
export PARSETRACK_NODE_ENV=beta
npx prisma migrate resolve --applied 20251203092611_update_meeting_table
npx prisma migrate deploy
npx prisma generate