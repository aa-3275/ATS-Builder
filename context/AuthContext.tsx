"use client";

import {
  createContext,
  use,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  getFirebaseAuth,
  getFirebaseDb,
  googleProvider,
} from "@/lib/firebase";
import {
  identifyAnalyticsUser,
  resetAnalyticsUser,
} from "@/lib/analytics";

type AuthContextValue = {
  isBootstrapping: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  signUpWithEmail: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function upsertSessionCookie(user: User) {
  const token = await user.getIdToken();

  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken: token }),
  });

  if (!response.ok) {
    throw new Error("Unable to create a server session.");
  }
}

async function clearSessionCookie() {
  await fetch("/api/auth/session", {
    method: "DELETE",
  });
}

async function ensureUserDocument(user: User) {
  const userRef = doc(getFirebaseDb(), "users", user.uid);
  const existingDoc = await getDoc(userRef);

  const payload = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  if (existingDoc.exists()) {
    await setDoc(userRef, payload, { merge: true });
    return;
  }

  await setDoc(userRef, {
    ...payload,
    createdAt: serverTimestamp(),
  });
}

async function syncSignedInUser(nextUser: User) {
  await upsertSessionCookie(nextUser);
  await ensureUserDocument(nextUser);
}

async function syncSignedOutUser() {
  await clearSessionCookie();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let auth;

    try {
      auth = getFirebaseAuth();
    } catch (error) {
      console.error("Firebase auth is not configured yet", error);
      setIsBootstrapping(false);
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (nextUser) => {
      try {
        if (nextUser) {
          await syncSignedInUser(nextUser);
          setUser(nextUser);
        } else {
          await syncSignedOutUser();
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to sync auth state", error);
        setUser(nextUser);
      } finally {
        setIsBootstrapping(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      identifyAnalyticsUser({
        id: user.uid,
        email: user.email,
        name: user.displayName,
      });
      return;
    }

    resetAnalyticsUser();
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isBootstrapping,
      signInWithEmail: async (email, password) => {
        const credentials = await signInWithEmailAndPassword(
          getFirebaseAuth(),
          email,
          password,
        );

        await syncSignedInUser(credentials.user);
        setUser(credentials.user);
      },
      signUpWithEmail: async (name, email, password) => {
        const credentials = await createUserWithEmailAndPassword(
          getFirebaseAuth(),
          email,
          password,
        );

        await updateProfile(credentials.user, {
          displayName: name,
        });

        await syncSignedInUser(credentials.user);
        setUser(credentials.user);
      },
      signInWithGoogle: async () => {
        const credentials = await signInWithPopup(
          getFirebaseAuth(),
          googleProvider,
        );

        await syncSignedInUser(credentials.user);
        setUser(credentials.user);
      },
      signOutUser: async () => {
        await signOut(getFirebaseAuth());
        await syncSignedOutUser();
        setUser(null);
      },
    }),
    [isBootstrapping, user],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const value = use(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return value;
}
