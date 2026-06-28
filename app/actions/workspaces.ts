"use server";

import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import type { Workspace, ActionResult } from "@/types/kymiz";

function localePath(locale: string, path: string) {
  return locale === "es" ? path : `/${locale}${path}`;
}

export async function getWorkspaces(): Promise<ActionResult<Workspace[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return { error: error.message };
  return { success: true, data: data ?? [] };
}

export async function getDefaultWorkspace(): Promise<ActionResult<Workspace | null>> {
  const result = await getWorkspaces();
  if (result.error) return { error: result.error };
  return { success: true, data: result.data?.[0] ?? null };
}

export async function createWorkspace(
  name: string,
  description?: string
): Promise<ActionResult<Workspace>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("workspaces")
    .insert({ user_id: user.id, name, description: description ?? null })
    .select()
    .single();

  if (error) return { error: error.message };

  const locale = await getLocale();
  revalidatePath(localePath(locale, "/dashboard"));
  revalidatePath(localePath(locale, "/settings"));

  return { success: true, data };
}

export async function updateWorkspace(
  id: string,
  fields: { name?: string; description?: string }
): Promise<ActionResult<Workspace>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workspaces")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  const locale = await getLocale();
  revalidatePath(localePath(locale, "/settings"));

  return { success: true, data };
}

export async function deleteWorkspace(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  const locale = await getLocale();
  revalidatePath(localePath(locale, "/dashboard"));
  revalidatePath(localePath(locale, "/settings"));

  return { success: true };
}
