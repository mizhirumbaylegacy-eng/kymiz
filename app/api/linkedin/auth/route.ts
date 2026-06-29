import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const SCOPES = ["w_member_social", "openid", "profile", "email"];

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  // Get the workspace to associate — allow override via query param
  const qsWorkspace = new URL(request.url).searchParams.get("workspaceId");

  let workspaceId = qsWorkspace;
  if (!workspaceId) {
    const { data: workspaces } = await supabase
      .from("workspaces")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1);
    workspaceId = workspaces?.[0]?.id ?? null;
  }

  if (!workspaceId) {
    return NextResponse.redirect(`${appUrl}/settings?linkedin_error=no_workspace`);
  }

  // CSRF nonce
  const nonce = randomBytes(20).toString("hex");
  // Encode workspaceId + nonce in state
  const state = Buffer.from(JSON.stringify({ workspaceId, nonce })).toString(
    "base64url"
  );

  const redirectUri = `${appUrl}/api/linkedin/callback`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: redirectUri,
    scope: SCOPES.join(" "),
    state,
  });

  const response = NextResponse.redirect(
    `${LINKEDIN_AUTH_URL}?${params.toString()}`
  );

  // Store nonce in cookie for CSRF verification
  response.cookies.set("li_oauth_nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 min
    path: "/",
  });

  return response;
}
