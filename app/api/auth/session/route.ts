import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "@/lib/session";

type SessionRequestBody = {
  idToken?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SessionRequestBody;

    if (!body.idToken) {
      return NextResponse.json(
        { error: "Missing Firebase ID token." },
        { status: 400 },
      );
    }

    const sessionCookie = await getAdminAuth().createSessionCookie(body.idToken, {
      expiresIn: SESSION_DURATION_MS,
    });

    const response = NextResponse.json({ ok: true });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      httpOnly: true,
      maxAge: SESSION_DURATION_MS / 1000,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("Failed to create Firebase session cookie", error);

    return NextResponse.json(
      { error: "Unable to create the session cookie." },
      { status: 401 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    expires: new Date(0),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
