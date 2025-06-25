# Realtime Feedback Web App

A simple modern web app built using **Preact**, **Supabase**, **Firebase (Google Auth)**, and **Socket.io**. This app supports:
- Realtime post & comment system
- Emoji + editable + deletable comments
- Scoped styling (no external CSS)
- Mobile-first responsive UI

---

## 🔧 Tech Stack
- **Frontend**: Preact (Vite), Scoped CSS, Socket.io client
- **Backend**: Supabase (Postgres + Realtime), Firebase (Google Auth), Socket.io server (Node.js)
- **Storage**: Supabase Storage

---

## 📁 Folder Structure

```
.
├── components/
│   ├── Feedback.jsx       # Realtime comment section
│   ├── Posting.jsx        # Upload post + image
│   └── Login.jsx          # Google Auth login
├── utils/
│   └── Supabase.js        # Supabase init
├── App.jsx
├── main.jsx
└── .env                   # Firebase & Supabase credentials
```

---

## 🔐 .env Format

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=public-anon-key
VITE_FIREBASE_API_KEY=AIzaSy*************
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=1:***********:web:*************
```

---

## 💡 How to Create Supabase Database

1. Go to [Supabase.io](https://supabase.io) → Create Project
2. In SQL Editor, run this to create tables:

```sql
create table posts (
  id uuid default uuid_generate_v4() primary key,
  user_email text,
  user_name text,
  description text,
  image text,
  inserted_at timestamp default now()
);

create table comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade,
  user_email text,
  user_name text,
  text text,
  inserted_at timestamp default now()
);
```

3. Enable Row Level Security → Add policies:
   - `posts`: Enable full access for authenticated users
   - `comments`: Same as above

---

## 🔁 Flowchart (Text Based)

```
User → Login (Firebase) → App.jsx
         ↓
      Posting → Upload Image (Supabase Storage)
         ↓
      Create Post (Supabase DB)
         ↓
      Feedback.jsx
           ↳ Input Comment → Insert to Supabase
           ↳ Socket.io broadcast → All Clients Update
           ↳ Realtime Update via useEffect
```

---

## 🚀 Run Locally

```bash
git clone https://github.com/your-user/realtime-feedback.git
cd realtime-feedback
npm install
npm run dev
```

---

## 📦 Deploy (Vercel)

- Push repo to GitHub
- Import to Vercel → Set up `.env` → Done!