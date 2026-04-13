# ATS Builder setup

## 1. Create your local env file

Copy `.env.local.example` to `.env.local` and paste in your Firebase values.

## 2. Enable Firebase products

- Turn on Authentication with `Google` and `Email/Password`
- Create a Firestore database
- Create a Storage bucket

## 3. Add Firebase Admin credentials

In Firebase Console:

1. Open `Project settings`
2. Open `Service accounts`
3. Generate a new private key
4. Copy `project_id`, `client_email`, and `private_key` into `.env.local`

## 4. Start the app

```bash
npm run dev
```

## 5. What to test

- Visit `/signup`
- Create an account or use Google sign-in
- Confirm you reach `/dashboard`
- Visit `/editor`
- Sign out and confirm protected routes redirect back to `/login`
