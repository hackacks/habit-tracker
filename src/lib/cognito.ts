import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

const userPoolId = import.meta.env.VITE_HABIT_FLOW_COGNITO_USER_POOL_ID;
const clientId = import.meta.env.VITE_HABIT_FLOW_COGNITO_APP_CLIENT_ID;

if (!userPoolId || !clientId) {
  console.warn("Missing Cognito Environment Variables: VITE_HABIT_FLOW_COGNITO_USER_POOL_ID or VITE_HABIT_FLOW_COGNITO_APP_CLIENT_ID");
}

const poolData = {
  UserPoolId: userPoolId || 'us-east-1_xxxxx',
  ClientId: clientId || 'xxxxxxxx',
};

export const userPool = new CognitoUserPool(poolData);

export const getSessionToken = (): Promise<string | null> => {
  return new Promise((resolve) => {
    const user = userPool.getCurrentUser();
    if (!user) return resolve(null);

    user.getSession((err: any, session: any) => {
      if (err || !session.isValid()) {
        resolve(null);
      } else {
        resolve(session.getIdToken().getJwtToken());
      }
    });
  });
};
