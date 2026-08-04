import React, { useState, useEffect } from 'react';
import { CognitoUser, AuthenticationDetails, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { userPool } from '../lib/cognito';

export const Auth: React.FC<{ onAuthenticated: () => void }> = ({ onAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const user = userPool.getCurrentUser();
    if (user) {
      user.getSession((err: any, session: any) => {
        if (!err && session.isValid()) {
          onAuthenticated();
        }
      });
    }
  }, [onAuthenticated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isConfirming) {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
        if (err) {
          setError(err.message || JSON.stringify(err));
          return;
        }
        setSuccess('Verification successful! You can now sign in.');
        setIsConfirming(false);
        setIsLogin(true);
      });
      return;
    }

    if (isLogin) {
      const authDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: () => {
          onAuthenticated();
        },
        onFailure: (err) => {
          if (err.code === 'UserNotConfirmedException') {
             setIsConfirming(true);
             setError('Please verify your account.');
          } else {
             setError(err.message || JSON.stringify(err));
          }
        },
      });
    } else {
      const attributeList = [
        new CognitoUserAttribute({ Name: 'name', Value: name }),
      ];
      userPool.signUp(email, password, attributeList, null as any, (err, result) => {
        if (err) {
          setError(err.message || JSON.stringify(err));
          return;
        }
        setSuccess('Sign up successful! Please check your email for the confirmation code.');
        setIsConfirming(true);
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-8 border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl font-bold mb-6 text-center text-zinc-900 dark:text-zinc-50">
          {isConfirming ? 'Verify Account' : isLogin ? 'Sign In' : 'Sign Up'}
        </h2>
        
        {error && <div className="bg-red-900/30 text-red-400 p-3 rounded-xl mb-4 text-sm border border-red-900/50">{error}</div>}
        {success && <div className="bg-emerald-900/30 text-emerald-400 p-3 rounded-xl mb-4 text-sm border border-emerald-900/50">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isConfirming ? (
            <div>
              <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Confirmation Code</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-zinc-900 dark:text-zinc-50 placeholder-zinc-600 outline-none transition-all"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="123456"
                required
              />
            </div>
          ) : (
            <>
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-zinc-900 dark:text-zinc-50 placeholder-zinc-600 outline-none transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-zinc-900 dark:text-zinc-50 placeholder-zinc-600 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-zinc-900 dark:text-zinc-50 placeholder-zinc-600 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            {isConfirming ? 'Verify' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {!isConfirming && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
