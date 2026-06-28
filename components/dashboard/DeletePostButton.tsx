"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { deletePost } from "@/app/actions/posts";
import { useRouter } from "@/lib/navigation";

export function DeletePostButton({ postId }: { postId: string }) {
  const t = useTranslations("Posts");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(t("deleteConfirm"))) return;
    setLoading(true);
    const result = await deletePost(postId);
    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success(t("deleted"));
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-brand-red/10 hover:text-brand-red disabled:opacity-50"
      title={t("delete")}
    >
      <Trash2 size={14} />
    </button>
  );
}
