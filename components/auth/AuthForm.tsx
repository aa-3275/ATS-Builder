"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/context/AuthContext";
import { captureAnalyticsEvent } from "@/lib/analytics";
import {
  authFormSchema,
  type AuthFormValues,
} from "@/lib/validators/auth";

type AuthFormProps = {
  mode: "login" | "signup";
};

function formatFirebaseError(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return "Something went wrong. Please try again.";
  }

  switch (error.code) {
    case "auth/email-already-in-use":
      return "That email is already in use.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "The email or password is incorrect.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before it finished.";
    default:
      return error.message;
  }
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isBootstrapping, signInWithEmail, signInWithGoogle, signUpWithEmail } =
    useAuth();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const isSignup = mode === "signup";

  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    if (isSignup && !values.name?.trim()) {
      setError("name", {
        message: "Enter your full name.",
      });
      return;
    }

    setFormError(null);

    startTransition(async () => {
      try {
        captureAnalyticsEvent(isSignup ? "signup_started" : "login_started", {
          method: "email",
          redirect_to: redirectTo,
        });

        if (isSignup) {
          await signUpWithEmail(
            values.name!.trim(),
            values.email.trim(),
            values.password,
          );
        } else {
          await signInWithEmail(values.email.trim(), values.password);
        }

        captureAnalyticsEvent(isSignup ? "signup_completed" : "login_completed", {
          method: "email",
          redirect_to: redirectTo,
        });
        router.replace(redirectTo);
        router.refresh();
      } catch (error) {
        captureAnalyticsEvent(isSignup ? "signup_failed" : "login_failed", {
          method: "email",
        });
        setFormError(formatFirebaseError(error));
      }
    });
  });

  const handleGoogleLogin = () => {
    setFormError(null);

    startTransition(async () => {
      try {
        captureAnalyticsEvent(isSignup ? "signup_started" : "login_started", {
          method: "google",
          redirect_to: redirectTo,
        });
        await signInWithGoogle();
        captureAnalyticsEvent(isSignup ? "signup_completed" : "login_completed", {
          method: "google",
          redirect_to: redirectTo,
        });
        router.replace(redirectTo);
        router.refresh();
      } catch (error) {
        captureAnalyticsEvent(isSignup ? "signup_failed" : "login_failed", {
          method: "google",
        });
        setFormError(formatFirebaseError(error));
      }
    });
  };

  return (
    <div className="card-surface w-full max-w-md p-8 sm:p-10">
      <div className="mb-8 space-y-3">
        <span className="pill">{isSignup ? "Create account" : "Welcome back"}</span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          {isSignup ? "Start building ATS resumes" : "Sign in to ATS Builder"}
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          {isSignup
            ? "Use email/password or Google. A Firestore user record is created on first login."
            : "Your session cookie is created server-side after Firebase auth succeeds."}
        </p>
      </div>

      <button
        className="button-secondary w-full"
        disabled={isPending || isBootstrapping}
        onClick={handleGoogleLogin}
        type="button"
      >
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        <span>or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        {isSignup ? (
          <div className="space-y-2">
            <label className="input-label" htmlFor="name">
              Full name
            </label>
            <input
              className="input-field"
              id="name"
              placeholder="Aarav Sharma"
              {...register("name")}
            />
            {errors.name ? (
              <p className="form-error">{errors.name.message}</p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="input-label" htmlFor="email">
            Email
          </label>
          <input
            className="input-field"
            id="email"
            placeholder="you@example.com"
            type="email"
            {...register("email")}
          />
          {errors.email ? (
            <p className="form-error">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="input-label" htmlFor="password">
            Password
          </label>
          <input
            className="input-field"
            id="password"
            placeholder="Minimum 6 characters"
            type="password"
            {...register("password")}
          />
          {errors.password ? (
            <p className="form-error">{errors.password.message}</p>
          ) : null}
        </div>

        {formError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        ) : null}

        <button
          className="button-primary w-full"
          disabled={isPending || isBootstrapping}
          type="submit"
        >
          {isPending
            ? "Please wait..."
            : isSignup
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        {isSignup ? "Already have an account?" : "Need an account?"}{" "}
        <Link
          className="font-semibold text-teal-700 hover:text-teal-800"
          href={isSignup ? "/login" : "/signup"}
        >
          {isSignup ? "Log in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}
