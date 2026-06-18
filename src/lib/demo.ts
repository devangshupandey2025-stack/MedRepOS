import { prisma } from "@/lib/prisma";

const SEED_BATCH_NAME = "seed_data_import.xlsx";

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export async function hasRealData(): Promise<boolean> {
  const count = await prisma.uploadBatch.count({
    where: {
      fileName: { not: SEED_BATCH_NAME },
    },
  });
  return count > 0;
}

export async function hasAnyData(): Promise<boolean> {
  const count = await prisma.salesRecord.count();
  return count > 0;
}

export async function shouldShowData(): Promise<boolean> {
  const real = await hasRealData();
  if (real) return true;
  if (isDemoMode()) {
    const any = await hasAnyData();
    return any;
  }
  return false;
}
