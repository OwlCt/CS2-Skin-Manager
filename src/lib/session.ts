import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData } from "./types";

const sessionOptions = {
  password: process.env.SESSION_PASSWORD!,
  cookieName: "__session",
  cookieOptions: {
    // secure: true should be used in production (HTTPS)
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );
  return session;
}
