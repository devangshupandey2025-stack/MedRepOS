"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteUploadBatch } from "@/actions/upload";

interface Props {
  batchId: string;
  fileName: string;
}

export function DeleteBatchButton({ batchId, fileName }: Props) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete "${fileName}" and all its records? This cannot be undone.`)) return;
    setDeleting(true);
    await deleteUploadBatch(batchId);
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={deleting}
      className="text-gray-500 hover:text-red-400"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
