# Sacred Discourse

### A debate forum for religion, philosophy, and secular thought — built with real architecture decisions.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-sacred--discourse.vercel.app-6366f1?style=flat-square)](https://sacred-discourse.vercel.app)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)

---

![Sacred Discourse Homepage](./screenshots/Homepage.jpg)

---

## About

Sacred Discourse is a structured debate forum spanning four traditions — Islam, Christianity, Judaism, and Atheism & Secularism. It is a full-stack portfolio project demonstrating production-minded frontend architecture, thoughtful UX, and a backend secured entirely through database-level policies — from schema design and Row Level Security through file upload pipelines, full-text search, and a polished, animated UI.

---

## Live Demo

**[sacred-discourse.vercel.app](https://sacred-discourse.vercel.app)**

Create an account, post a discussion, reply to others, upload attachments, search across traditions, and edit your profile — the full flow is wired and live.

---

## Features

### Authentication
- Email/password sign-up and sign-in via Supabase Auth
- Email confirmation with a custom confirmation screen
- Forgot password → reset password via tokenised email link
- Password visibility toggle; session persisted across tabs and page refreshes

### Posts & Discussions
- Create, edit, and delete posts with title (100 chars), description (750 chars), and optional attachments
- Character counters on all fields that turn red near the limit
- Inline edit form with attachment management — add new files, remove existing ones, diff-based Storage cleanup on save
- Orphan-safe upload pipeline: if a post insert fails after upload, Storage files are deleted automatically
- View counter incremented only by authenticated non-authors

### Replies
- Threaded replies up to 2,000 characters; collapsible beyond 300
- Reply form at the top of the section; smooth scroll to the bottom of the list on submit
- Post authors can delete any reply on their post; reply authors can delete their own

### Likes
- Optimistic like/unlike for posts and replies — updates instantly, reverts silently on failure
- Like counts are public; toggling requires authentication

### File Attachments
- PDF, JPEG, PNG, GIF, PPTX, DOCX — validated client-side, 50 MB per file
- Inline preview: PDFs in an `<iframe>`, images in a fullscreen modal, Office docs via the Office Online viewer
- Download links for all attachment types

### Search
- Full-text search using PostgreSQL `tsvector` with a GIN index
- Results grouped by tradition with per-topic accent colours
- Empty state correctly distinguishes "no results" from a query failure

### Profiles
- Clickable author names throughout the app navigate to public profile pages
- Avatar upload with live preview, old avatar cleanup on update, and immediate navbar sync
- Display name editing inline; post history grouped by topic

### Navigation
- Sticky navbar with a Topics dropdown; keyboard-accessible search (Enter with ≥ 3 characters)
- Route fade transition and staggered post card enter animations

---

## Tech Stack

| Technology | Role | Why |
|---|---|---|
| **React 18** | UI | Component model maps cleanly to the forum's entity hierarchy (Topic → Post → Reply). `useContext` for scoped state sharing without Redux overhead. |
| **Vite** | Build tool | Sub-second HMR during development. Trivial Vercel deployment. No configuration overhead. |
| **Tailwind CSS v3** | Styling | Utility-first keeps styles co-located and eliminates CSS file sprawl. JIT handles arbitrary values without a config change. |
| **React Router v6** | Routing | Nested route params (`/topic/:topicSlug/post/:postId`) map directly to the data hierarchy. `useSearchParams` handles the search flow cleanly. |
| **Supabase** | Auth, Database, Storage | Replaces a Node/Express backend entirely. Postgres RLS enforces data ownership at the database layer — not the application layer — so no route guard can accidentally expose data. |
| **Vercel** | Deployment | Zero-config for Vite projects. Preview deployments per branch. |

---

## Architecture & Design Decisions

### Row Level Security — trust the database, not the application

Every table has RLS enabled. Policies are strict: `author_id = auth.uid()` for writes, public read for posts, replies, likes, and profiles. The application never has to trust that a route guard ran correctly — the database rejects the operation outright if the policy fails.

This also means any new client (mobile app, CLI tool) inherits the same security model without extra work.

### `PostDetailContext` — scoped state without prop drilling

`PostDetailPage` manages 35+ state variables across four data-fetching effects, six event handlers, and four sub-components (`EditPostForm`, `AttachmentViewer`, `ReplyCard`, `FullscreenImageModal`). Prop-drilling all of this would make each component signature unreadable and tightly couple them to the parent's implementation.

The solution: a `PostDetailContext` created and provided inside `PostDetailPage`, consumed via a `usePostDetail()` hook. The context is not exported or accessible outside this module's graph — it is a private implementation detail, not a global concern. Sub-components are co-located in `src/components/post-detail/` and cannot be imported anywhere else.

### Full-text search with `tsvector` and GIN index

Search runs against a generated column rather than a `LIKE` query:

```sql
ALTER TABLE posts
  ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) STORED;

CREATE INDEX posts_search_vector_idx ON posts USING GIN (search_vector);
```

The GIN index makes searches fast at scale. The `'english'` configuration applies stemming — a search for "believing" matches posts containing "belief". The column is maintained automatically by Postgres; there is no sync job or trigger to maintain.

### File upload safety

The upload pipeline is sequenced deliberately:
1. Upload files to Storage
2. Insert the post row (`.select('id').single()`)
3. Insert `file_attachments` rows

If step 2 fails after step 1, orphaned Storage files are deleted before the error surfaces to the user. If step 3 fails, the post exists with no attachments — a recoverable state the user can fix by editing.

---

## Screenshots

### Topic Page — Islam
![Topic Page](./screenshots/Topic%20Page.jpg)
*Islam topic page with the discussion list, reply/view counts, and topic-coloured post cards.*

### Post Detail — Discussion & Attachments
![Post Detail](./screenshots/PostPage_1.jpg)
*Post header with author avatar, engagement stats, and the attachment list.*

### Post Detail — Document Preview & Replies
![Post Detail Replies](./screenshots/PostPage_2.jpg)
*Inline document preview expanded alongside the reply thread.*

### User Profile
![Profile Page](./screenshots/Profile%20Page.jpg)
*Profile page with avatar, edit form, and post history grouped by tradition.*

### Search Results
![Search Results](./screenshots/Search.jpg)
*Full-text search results grouped by topic with tradition-coloured section headers.*

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/samooda/sacred-discourse.git
cd sacred-discourse
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Both values are available in your Supabase project under **Settings → API**.

### Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Database Setup

The app uses five tables: `profiles`, `posts`, `replies`, `likes`, and `file_attachments`. After creating the tables and enabling RLS, two additional steps are required.

**Add the `search_vector` generated column and GIN index to `posts`:**

```sql
ALTER TABLE posts
  ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) STORED;

CREATE INDEX posts_search_vector_idx ON posts USING GIN (search_vector);
```

**Grant schema access to the Supabase roles:**

```sql
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon;
grant all on all tables in schema public to authenticated;
```

A `profiles` row is created automatically via a Supabase trigger on `auth.users` insert, seeded with the `display_name` from signup metadata.

---

## Future Improvements

- **Semantic search** — replace or augment `tsvector` with embedding-based similarity search via a FastAPI microservice and `pgvector`, enabling conceptually related results across traditions
- **Real-time replies** — Supabase Realtime subscriptions to push new replies to all viewers without polling
- **Mobile-responsive design** — the current layout is desktop-first; a responsive pass would bring the forum to smaller screens
- **Google OAuth** — a one-click sign-in path alongside the existing email/password flow
- **Moderation tools** — admin role with the ability to pin posts, lock threads, and remove content
- **Pagination or infinite scroll** — the current implementation loads all posts per topic in a single query; pagination would be necessary at scale

---

## Author

**Abdessamad Atifi**

[github.com/samooda](https://github.com/samooda)

---

