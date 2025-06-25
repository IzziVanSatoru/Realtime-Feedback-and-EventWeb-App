import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { supabase } from './utils/Supabase';
import { auth } from './utils/Firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import Login from './components/Login';
import Posting from './components/Posting';
import Feedback from './components/Feedback';

export default function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('inserted_at', { ascending: false });

    if (!error) {
      setPosts(data || []);
    } else {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <main>
      <h1>🎉 Feedback & Event App</h1>

      {!user ? (
        <Login onLogin={setUser} />
      ) : (
        <>
          <div class="topbar">
            <span>👤 {user.displayName}</span>
            <button onClick={() => signOut(auth)}>Logout</button>
          </div>

          <Posting user={user} onPosted={fetchPosts} />

          {posts.map((post) => (
            <Feedback
              key={post.id}
              postId={post.id}
              imageUrl={post.image}
              user={user}
            />
          ))}
        </>
      )}

      <style scoped>
        {`
          main {
            font-family: 'Inter', sans-serif;
            padding: 1rem;
            color: white;
            background: linear-gradient(to right, #0f172a, #1e293b);
            min-height: 100vh;
          }

          h1 {
            text-align: center;
            font-size: 2rem;
            margin-bottom: 2rem;
            background: linear-gradient(to right, #22d3ee, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }

          button {
            background: #ef4444;
            color: white;
            padding: 0.4rem 0.8rem;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
          }
        `}
      </style>
    </main>
  );
}
