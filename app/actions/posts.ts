"use server";

import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import type {
  Post,
  CreatePostInput,
  UpdatePostInput,
  ActionResult,
} from "@/types/kymiz";

function localePath(locale: string, path: string) {
  return locale === "es" ? path : `/${locale}${path}`;
}

export async function createPost(
  input: CreatePostInput
): Promise<ActionResult<Post>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("posts")
    .insert({
      workspace_id: input.workspaceId,
      user_id: user.id,
      content: input.content,
      platforms: input.platforms,
      scheduled_at: input.scheduledAt ?? null,
      status: input.status,
      image_url: input.imageUrl ?? null,
      ai_generated: input.aiGenerated ?? false,
      ai_prompt: input.aiPrompt ?? null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  const locale = await getLocale();
  revalidatePath(localePath(locale, "/posts"));
  revalidatePath(localePath(locale, "/dashboard"));

  return { success: true, data };
}

export async function getPosts(
  workspaceId: string,
  status?: string
): Promise<ActionResult<Post[]>> {
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };

  return { success: true, data: data ?? [] };
}

export async function getPostById(id: string): Promise<ActionResult<Post>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { error: error.message };
  return { success: true, data };
}

export async function updatePost(
  id: string,
  fields: UpdatePostInput
): Promise<ActionResult<Post>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .update({
      ...(fields.content !== undefined && { content: fields.content }),
      ...(fields.platforms !== undefined && { platforms: fields.platforms }),
      ...(fields.scheduledAt !== undefined && { scheduled_at: fields.scheduledAt }),
      ...(fields.status !== undefined && { status: fields.status }),
      ...(fields.imageUrl !== undefined && { image_url: fields.imageUrl }),
      ...(fields.aiGenerated !== undefined && { ai_generated: fields.aiGenerated }),
      ...(fields.aiPrompt !== undefined && { ai_prompt: fields.aiPrompt }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  const locale = await getLocale();
  revalidatePath(localePath(locale, "/posts"));
  revalidatePath(localePath(locale, "/dashboard"));

  return { success: true, data };
}

export async function deletePost(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return { error: error.message };

  const locale = await getLocale();
  revalidatePath(localePath(locale, "/posts"));
  revalidatePath(localePath(locale, "/dashboard"));

  return { success: true };
}

export async function schedulePost(
  id: string,
  scheduledAt: string
): Promise<ActionResult<Post>> {
  return updatePost(id, { status: "scheduled", scheduledAt });
}
