import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { supabase } from '../utils/Supabase';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

export default function Feedback({ postId, imageUrl, user }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [emoji, setEmoji] = useState('🔥');
  const [editingId, setEditingId] = useState(null);
  const [postOwner, setPostOwner] = useState(null);

  useEffect(() => {
    fetchComments();
    fetchPostOwner();

    socket.on('new-comment', (data) => {
      if (data.post_id === postId) {
        setComments((prev) => [data, ...prev]);
      }
    });

    socket.on('update-comment', (updated) => {
      setComments((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    });

    socket.on('delete-comment', (id) => {
      setComments((prev) => prev.filter((c) => c.id !== id));
    });

    return () => {
      socket.off('new-comment');
      socket.off('update-comment');
      socket.off('delete-comment');
    };
  }, []);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('inserted_at', { ascending: false });
    setComments(data || []);
  };

  const fetchPostOwner = async () => {
    const { data } = await supabase
      .from('posts')
      .select('user_email')
      .eq('id', postId)
      .single();
    setPostOwner(data?.user_email || null);
  };

  const sendComment = async () => {
    const message = `${emoji} ${text}`;
    if (editingId) {
      const { data, error } = await supabase
        .from('comments')
        .update({ text: message })
        .eq('id', editingId)
        .select();
      if (!error && data) {
        socket.emit('update-comment', data[0]);
        setEditingId(null);
        setText('');
      }
    } else {
      const newComment = {
        post_id: postId,
        text: message,
        user_email: user.email,
        user_name: user.displayName,
      };

      const { data, error } = await supabase
        .from('comments')
        .insert([newComment])
        .select();

      if (!error && data) {
        socket.emit('new-comment', data[0]);
        setComments((prev) => [data[0], ...prev]);
        setText('');
      }
    }
  };

  const editComment = (c) => {
    setText(c.text.replace(/^[^ ]+ /, ''));
    setEmoji(c.text.split(' ')[0] || '🔥');
    setEditingId(c.id);
  };

  const deleteComment = async (id) => {
    if (window.confirm('Yakin hapus komentar ini?')) {
      setComments((prev) => prev.filter((c) => c.id !== id));
      const { error } = await supabase.from('comments').delete().eq('id', id);
      if (!error) {
        socket.emit('delete-comment', id);
      }
    }
  };

  const deletePost = async () => {
    if (window.confirm('Yakin hapus postingan dan semua komentarnya?')) {
      await supabase.from('comments').delete().eq('post_id', postId);
      await supabase.from('posts').delete().eq('id', postId);
      window.location.reload();
    }
  };

  return (
    <div class="feedback-box">
      <img src={imageUrl} class="img-preview" alt="Uploaded content" />

      {postOwner === user.email && (
        <button class="delete-post" onClick={deletePost}>🗑️ Delete Post</button>
      )}

      <div class="input-group">
        <select value={emoji} onChange={(e) => setEmoji(e.target.value)}>
          <option>🔥</option><option>❤️</option><option>💡</option>
          <option>😂</option><option>👍</option>
        </select>
        <input
          type="text"
          value={text}
          onInput={(e) => setText(e.target.value)}
          placeholder="Tulis komentar..."
        />
        <button onClick={sendComment}>{editingId ? 'Update' : 'Kirim'}</button>
      </div>

      <div class="comment-list">
        {comments.map((c) => (
          <div class="comment" key={c.id}>
            <div class="comment-text">
              <b>{c.user_name}</b>: {c.text}
            </div>
            {c.user_email === user.email && (
              <div class="actions">
                <button onClick={() => editComment(c)}>✏️ Edit</button>
                <button onClick={() => deleteComment(c.id)}>🗑️ Delete Comment</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <style scoped>{`
        .feedback-box {
          background: rgba(255,255,255,0.05);
          padding: 1rem;
          border-radius: 1rem;
          margin-bottom: 2rem;
          box-shadow: 0 0 16px rgba(0,0,0,0.2);
        }

        .img-preview {
          width: 100%;
          max-height: 300px;
          object-fit: contain;
          border-radius: 1rem;
          margin-bottom: 1rem;
          background: #1e293b;
        }

        .delete-post {
          margin-bottom: 1rem;
          background: #ef4444;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          width: 100%;
        }

        .input-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        select {
          background: rgba(255,255,255,0.2);
          border: none;
          border-radius: 0.5rem;
          color: white;
          padding: 0.4rem;
        }

        input {
          flex: 1;
          min-width: 180px;
          padding: 0.5rem;
          border-radius: 0.5rem;
          border: none;
          background: rgba(255,255,255,0.1);
          color: white;
        }

        button {
          padding: 0.5rem 1rem;
          background: linear-gradient(to right, #22c55e, #3b82f6);
          border: none;
          border-radius: 1rem;
          color: white;
          cursor: pointer;
        }

        .comment-list {
          margin-top: 1rem;
        }

        .comment {
          background: rgba(255,255,255,0.08);
          padding: 0.5rem;
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
          color: white;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .comment-text {
          flex: 1;
          min-width: 200px;
          word-break: break-word;
        }

        .actions {
          display: flex;
          gap: 0.3rem;
          margin-top: 0.5rem;
        }

        .actions button {
          background: none;
          border: none;
          cursor: pointer;
          color: white;
          font-size: 0.9rem;
        }

        @media (max-width: 480px) {
          .input-group {
            flex-direction: column;
          }

          .comment {
            flex-direction: column;
            align-items: flex-start;
          }

          .delete-post {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}
