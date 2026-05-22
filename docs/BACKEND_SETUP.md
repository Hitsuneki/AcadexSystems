# ACADEX — Firebase & Supabase setup

Follow these steps once to fix **Missing or insufficient permissions** (Firestore) and **row-level security policy** (avatar upload).

---

## 1. Firebase Firestore rules

1. Open [Firebase Console](https://console.firebase.google.com) → project **acadex-6203f**
2. Go to **Firestore Database** → **Rules**
3. Replace everything with the contents of `firestore.rules` in this repo
4. Click **Publish**

This allows:

- Signed-in users to read any `users/{userId}` profile
- Users to **create/update only their own** `users/{userId}` document
- Project members to access project-scoped collections

---

## 2. Enable Firestore (if not already)

1. Firestore Database → **Create database**
2. Start in **test mode** only for quick local experiments, then **replace** with `firestore.rules` above before shipping
3. Region: pick closest to your users (e.g. `asia-southeast1`)

---

## 3. Firebase Authentication

1. **Authentication** → **Sign-in method**
2. Enable **Email/Password**

---

## 4. Supabase Storage buckets

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → project **okqjuksvazglquaadzyw**
2. **Storage** → create buckets (if missing):
   - `avatars` — **Public bucket** ✓
   - `project-files` — **Public bucket** ✓

---

## 5. Supabase Storage policies (SQL Editor)

ACADEX uses **Firebase Auth** for login and **Supabase anon key** for uploads. Supabase does not see Firebase users unless you integrate custom JWT. For development, use these policies:

Open **SQL Editor** → **New query** → paste and **Run**:

```sql
-- ─── Avatars bucket ───────────────────────────────────────────────────────────

-- Public read (profile images in the app)
CREATE POLICY "avatars_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow uploads (anon key from the Expo app)
CREATE POLICY "avatars_allow_insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_allow_update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_allow_delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'avatars');

-- ─── Project files bucket ─────────────────────────────────────────────────────

CREATE POLICY "project_files_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-files');

CREATE POLICY "project_files_allow_insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'project-files');

CREATE POLICY "project_files_allow_update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'project-files');

CREATE POLICY "project_files_allow_delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'project-files');
```

If policies already exist with the same names, drop them first or rename.

**Note:** These are permissive for development. For production, restrict paths (e.g. folder = user id) after you link Firebase Auth to Supabase or use a backend upload API.

---

## 6. Environment variables

Ensure `.env.local` contains:

```env
EXPO_PUBLIC_SUPABASE_URL=https://okqjuksvazglquaadzyw.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-or-publishable-key

EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=acadex-6203f.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=acadex-6203f
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Restart Expo after changes:

```bash
npx expo start --clear
```

---

## 7. App flow after fixes

1. **Register** — email + password only (no name on register screen)
2. **Complete profile** — full name, **course dropdown** (saved to `users/{uid}.course` in Firestore), role, optional photo
3. Avatar uploads to Supabase `avatars/{userId}/...` and URL saved as `avatarUrl` on the user document

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Failed to get user profile: Missing or insufficient permissions` | Publish `firestore.rules`; user must be signed in |
| `new row violates row-level security policy` (avatar) | Run Storage SQL above; bucket must be named `avatars` |
| Profile saves but app stays on setup | Ensure `fullName` and `course` are filled; both required |
