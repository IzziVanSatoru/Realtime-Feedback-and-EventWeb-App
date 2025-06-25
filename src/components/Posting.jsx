import { h } from 'preact';
import { useState } from 'preact/hooks';
import { supabase } from '../utils/Supabase';
import { v4 as uuidv4 } from 'uuid';

export default function Posting({ user, onPosted }) {
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!image || !desc) return alert("Isi semua kolom dulu Mastah!");

    setLoading(true);
    const ext = image.name.split('.').pop();
    const fileName = `${Date.now()}-${uuidv4()}.${ext}`;
    const { data, error: uploadError } = await supabase.storage
      .from('posts')
      .upload(fileName, image);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      setLoading(false);
      return;
    }

    const imageUrl = supabase.storage.from('posts').getPublicUrl(fileName).data.publicUrl;

    const { error: insertError } = await supabase.from('posts').insert([{
      description: desc,
      image: imageUrl,
      user_email: user.email,
      user_name: user.displayName
    }]);

    if (insertError) {
      console.error('Insert error:', insertError);
    } else {
      setDesc('');
      setImage(null);
      onPosted?.();
    }

    setLoading(false);
  };

  return (
    <div class="post-card">
      <h3>📤 Upload Gambar</h3>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <textarea
        placeholder="Tulis deskripsi..."
        value={desc}
        onInput={(e) => setDesc(e.target.value)}
        rows="3"
      />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Mengirim...' : 'Kirim'}
      </button>

      <style scoped>{`
        .post-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 1rem;
          border-radius: 1rem;
          margin-bottom: 2rem;
          box-shadow: 0 0 16px rgba(0, 0, 0, 0.2);
          max-width: 640px;
          margin-left: auto;
          margin-right: auto;
        }

        h3 {
          font-size: 1.2rem;
          margin-bottom: 1rem;
          color: white;
        }

        input[type="file"] {
          display: block;
          margin-bottom: 0.75rem;
          color: white;
        }

        textarea {
          width: 100%;
          resize: vertical;
          min-height: 80px;
          max-height: 240px;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: none;
          border-radius: 0.5rem;
          margin-bottom: 0.75rem;
        }

        button {
          padding: 0.6rem 1.2rem;
          background: linear-gradient(to right, #06b6d4, #3b82f6);
          border: none;
          border-radius: 9999px;
          color: white;
          cursor: pointer;
          font-weight: bold;
        }

        @media (max-width: 480px) {
          .post-card {
            padding: 0.75rem;
          }

          h3 {
            font-size: 1rem;
          }

          button {
            width: 100%;
            padding: 0.7rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
