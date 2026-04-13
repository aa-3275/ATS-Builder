import "server-only";

import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App | null = null;

function getRequiredAdminEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing ${name}. Add the Firebase Admin credentials from .env.local.example.`,
    );
  }

  return value;
}

export function getFirebaseAdminApp() {
  if (adminApp) {
    return adminApp;
  }

  if (getApps().length > 0) {
    adminApp = getApp();
    return adminApp;
  }

  adminApp = initializeApp({
    credential: cert({
      projectId: getRequiredAdminEnv("FIREBASE_PROJECT_ID"),
      clientEmail: getRequiredAdminEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey: getRequiredAdminEnv("FIREBASE_PRIVATE_KEY").replace(
        /\\n/g,
        "\n",
      ),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return adminApp;
}

export function getAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getAdminDb() {
  return getFirestore(getFirebaseAdminApp());
}
