# ATS Builder setup

## 1. Create your local env file

Copy `.env.local.example` to `.env.local` and paste in your Firebase values.
If you want launch analytics, also add your PostHog project key and host.

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

## 5. Optional analytics setup

- Create a free PostHog project
- Copy the project API key into `NEXT_PUBLIC_POSTHOG_KEY`
- Leave `NEXT_PUBLIC_POSTHOG_HOST` as `https://us.i.posthog.com` unless your project uses a different region

## 6. What to test

- Visit `/signup`
- Create an account or use Google sign-in
- Confirm you reach `/dashboard`
- Visit `/editor`
- Click the landing page CTA and confirm it appears in PostHog
- Run ATS score, JD match, and export flows and confirm events appear in PostHog
- Sign out and confirm protected routes redirect back to `/login`
