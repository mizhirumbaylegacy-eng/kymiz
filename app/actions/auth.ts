"use server";

import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n";
import type { ActionResult } from "@/types/kymiz";

function localePath(locale: string, path: string) {
  return locale === defaultLocale ? path : `/${locale}${path}`;
}

export async function signOut() {
  const [locale, supabase] = await Promise.all([getLocale(), createClient()]);
  await supabase.auth.signOut();
  redirect(localePath(locale, "/login"));
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const [locale, supabase] = await Promise.all([getLocale(), createClient()]);
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  redirect(localePath(locale, "/dashboard"));
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  const [locale, supabase] = await Promise.all([getLocale(), createClient()]);
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}${localePath(locale, "/auth/callback")}`,
    },
  });

  if (error) return { error: error.message };

  return { success: true };
}

export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string;

  const [locale, supabase] = await Promise.all([getLocale(), createClient()]);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}${localePath(locale, "/auth/callback")}?next=${localePath(locale, "/update-password")}`,
  });

  if (error) return { error: error.message };

  return { success: true };
}

export async function updateProfile({
  fullName,
}: {
  fullName: string;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });
  if (authError) return { error: authError.message };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);
  }

  const locale = await getLocale();
  revalidatePath(localePath(locale, "/settings"));
  revalidatePath(localePath(locale, "/dashboard"));

  return { success: true };
}
