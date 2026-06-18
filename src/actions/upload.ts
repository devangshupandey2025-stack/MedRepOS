"use server";

import { prisma } from "@/lib/prisma";
import { parseExcel } from "@/lib/excel/parser";
import { DetailedUploadResult } from "@/types";

export async function uploadExcel(formData: FormData): Promise<DetailedUploadResult> {
  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      return {
        success: false, fileName: "", fileHash: "", totalRows: 0,
        recordsImported: 0, recordsFailed: 0, errors: [],
        month: "", isDuplicate: false,
      };
    }

    const buffer = await file.arrayBuffer();
    const parseResult = parseExcel(buffer);

    if (parseResult.records.length === 0 && parseResult.errors.length === 0) {
      return {
        success: false, fileName: file.name, fileHash: parseResult.fileHash,
        totalRows: parseResult.totalRows, recordsImported: 0, recordsFailed: 0,
        errors: parseResult.errors, month: "", isDuplicate: false,
      };
    }

    const existing = await prisma.uploadBatch.findUnique({
      where: { fileHash: parseResult.fileHash },
    });

    if (existing) {
      return {
        success: false, fileName: file.name, fileHash: parseResult.fileHash,
        totalRows: parseResult.totalRows, recordsImported: 0, recordsFailed: 0,
        errors: [{ row: 0, column: "", message: `Duplicate file. Already uploaded as "${existing.fileName}" on ${existing.uploadedAt.toLocaleDateString("en-IN")}.` }],
        month: parseResult.month, isDuplicate: true, existingBatchId: existing.id,
      };
    }

    const month = parseResult.month;

    const batch = await prisma.uploadBatch.create({
      data: {
        fileName: file.name,
        fileHash: parseResult.fileHash,
        month,
        recordsCount: parseResult.records.length,
      },
    });

    const batchSize = 1000;
    for (let i = 0; i < parseResult.records.length; i += batchSize) {
      const chunk = parseResult.records.slice(i, i + batchSize);
      await prisma.salesRecord.createMany({
        data: chunk.map((r) => ({
          ...r,
          uploadBatchId: batch.id,
        })),
      });
    }

    return {
      success: true, fileName: file.name, fileHash: parseResult.fileHash,
      totalRows: parseResult.totalRows,
      recordsImported: parseResult.records.length,
      recordsFailed: parseResult.errors.length,
      errors: parseResult.errors, month, isDuplicate: false,
    };
  } catch (error) {
    const fileName = formData.get("file") instanceof File ? (formData.get("file") as File).name : "";
    return {
      success: false, fileName, fileHash: "", totalRows: 0,
      recordsImported: 0, recordsFailed: 0,
      errors: [{ row: 0, column: "", message: error instanceof Error ? error.message : "Upload failed" }],
      month: "", isDuplicate: false,
    };
  }
}

export async function deleteUploadBatch(batchId: string): Promise<void> {
  await prisma.salesRecord.deleteMany({ where: { uploadBatchId: batchId } });
  await prisma.uploadBatch.delete({ where: { id: batchId } });
}
