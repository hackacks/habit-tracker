FROM node:20-alpine AS build
WORKDIR /habit 
COPY package*.json ./
RUN npm ci

COPY . ./

RUN npx prisma generate

ARG VITE_HABIT_FLOW_COGNITO_REGION
ARG VITE_HABIT_FLOW_COGNITO_USER_POOL_ID
ARG VITE_HABIT_FLOW_COGNITO_APP_CLIENT_ID

ENV VITE_HABIT_FLOW_COGNITO_REGION=$VITE_HABIT_FLOW_COGNITO_REGION
ENV VITE_HABIT_FLOW_COGNITO_USER_POOL_ID=$VITE_HABIT_FLOW_COGNITO_USER_POOL_ID
ENV VITE_HABIT_FLOW_COGNITO_APP_CLIENT_ID=$VITE_HABIT_FLOW_COGNITO_APP_CLIENT_ID

RUN npm run build

FROM node:20-alpine
WORKDIR /habit
COPY --from=build --chown=node:node /habit/dist ./dist
COPY --from=build --chown=node:node /habit/node_modules ./node_modules
COPY --from=build --chown=node:node /habit/prisma ./prisma
COPY --from=build --chown=node:node /habit/package.json ./package.json
USER node
ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh","-c","npx prisma db push && node dist/server.cjs"]
