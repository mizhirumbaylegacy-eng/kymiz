import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const LINKEDIN_UGC_URL = "https://api.linkedin.com/v2/ugcPosts";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { workspaceId, content } = body as {
    workspaceId: string;
    content: string;
  };

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // Get LinkedIn account for this workspace
  const { data: account } = await supabase
    .from("social_accounts")
    .select("access_token, account_id")
    .eq("workspace_id", workspaceId)
    .eq("platform", "linkedin")
    .maybeSingle();

  if (!account?.access_token || !account?.account_id) {
    return NextResponse.json(
      { error: "LinkedIn not connected for this workspace" },
      { status: 400 }
    );
  }

  const author = `urn:li:person:${account.account_id}`;

  const ugcPost = {
    author,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: content },
        shareMediaCategory: "NONE",
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  const liRes = await fetch(LINKEDIN_UGC_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${account.access_token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(ugcPost),
  });

  if (!liRes.ok) {
    const errBody = await liRes.json().catch(() => ({}));
    console.error("LinkedIn UGC post error:", errBody);
    return NextResponse.json(
      { error: "LinkedIn post failed", details: errBody },
      { status: liRes.status }
    );
  }

  const data = (await liRes.json()) as { id: string };
  return NextResponse.json({ success: true, postId: data.id });
}
