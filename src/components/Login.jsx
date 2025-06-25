import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { auth, provider } from '../utils/Firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

export default function Login({ onLogin }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged((u) => {
      setUser(u);
      onLogin(u);
    });
  }, []);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      onLogin(result.user);
    } catch (err) {
      alert('Login error');
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    onLogin(null);
  };

  return (
    <div class="login-box">
      {!user ? (
        <button onClick={login}>🔐 Login with Google</button>
      ) : (
        <div class="profile">
          <img src={user.photoURL} alt="pfp" />
          <span>{user.displayName}</span>
          <button onClick={logout}>🚪 Logout</button>
        </div>
      )}

      <style scoped>
        {`
          .login-box {
            text-align: center;
            margin-bottom: 1.5rem;
          }

          button {
            background: linear-gradient(135deg, #22d3ee, #6366f1);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 0.7rem 1.4rem;
            cursor: pointer;
            font-size: 1rem;
          }

          .profile {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            justify-content: center;
          }

          img {
            width: 36px;
            height: 36px;
            border-radius: 50%;
          }
        `}
      </style>
    </div>
  );
}
