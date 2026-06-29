import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const LINKEDIN_TOKEN_URL    = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code    = searchParams.get("code");
  const state   = searchParams.get("state");
  const liError = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const settingsUrl = `${appUrl}/settings`;

  if (liError) {
    return NextResponse.redirect(
      `${settingsUrl}?linkedin_error=${encodeURIComponent(liError)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(`${settingsUrl}?linkedin_error=missing_params`);
  }

  // ── CSRF verification ─────────────────────────────────────
  let workspaceId: string;
  let nonce: string;
  try {
    const decoded = JSON.parse(
      Buffer.from(state, "base64url").toString("utf-8")
    );
    workspaceId = decoded.workspaceId;
    nonce = decoded.nonce;
  } catch {
    return NextResponse.redirect(`${settingsUrl}?linkedin_error=invalid_state`);
  }

  const storedNonce = request.cookies.get("li_oauth_nonce")?.value;
  if (!storedNonce || storedNonce !== nonce) {
    return NextResponse.redirect(`${settingsUrl}?linkedin_error=csrf_mismatch`);
  }

  // ── Token exchange ────────────────────────────────────────
  const redirectUri = `${appUrl}/api/linkedin/callback`;

  const tokenRes = await fetch(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type:    "authorization_code",
      code,
      redirect_uri:  redirectUri,
      client_id:     process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("LinkedIn token exchange failed:", err);
    return NextResponse.redirect(`${settingsUrl}?linkedin_error=token_failed`);
  }

  const { access_token } = (await tokenRes.json()) as {
    access_token: string;
    expires_in: number;
  };

  // ── Fetch LinkedIn profile (OpenID userinfo) ──────────────
  const profileRes = await fetch(LINKEDIN_USERINFO_URL, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!profileRes.ok) {
    return NextResponse.redirect(`${settingsUrl}?linkedin_error=profile_failed`);
  }

  const profile = (await profileRes.json()) as {
    sub: string;
    name?: string;
    email?: string;
    picture?: string;
  };

  const linkedinId  = profile.sub;
  const accountName = profile.name ?? profile.email ?? "LinkedIn User";

  // ── Upsert into social_accounts ──────────────────────────
  const supabase = await createClient();

  // Check if already connected for this workspace
  const { data: existing } = await supabase
    .from("social_accounts")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("platform", "linkedin")
    .maybeSingle();

  if (existing) {
    await supabase
      .from("social_accounts")
      .update({ account_name: accountName, account_id: linkedinId, access_token })
      .eq("id", existing.id);
  } else {
    await supabase.from("social_accounts").insert({
      workspace_id: workspaceId,
      platform:     "linkedin",
      account_name: accountName,
      account_id:   linkedinId,
      access_token,
    });
  }

  // Clear CSRF cookie and redirect
  const response = NextResponse.redirect(
    `${settingsUrl}?linkedin=connected&account=${encodeURIComponent(accountName)}`
  );
  response.cookies.delete("li_oauth_nonce");
  return response;
}
