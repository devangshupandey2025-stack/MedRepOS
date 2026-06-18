import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const records = await p.salesRecord.count();
  const batches = await p.uploadBatch.count();
  const hqs = (await p.salesRecord.findMany({ distinct: ["hqCode"], select: { hqCode: true } })).length;
  const products = (await p.salesRecord.findMany({ distinct: ["materialCode"], select: { materialCode: true } })).length;
  const months = await p.salesRecord.findMany({ distinct: ["reportMonth"], select: { reportMonth: true } });
  const agg = await p.salesRecord.aggregate({ _sum: { salesAmount: true, targetAmount: true } });

  console.log("=== Database Verification ===");
  console.log(`  Sales Records: ${records}`);
  console.log(`  Upload Batches: ${batches}`);
  console.log(`  HQs: ${hqs}`);
  console.log(`  Products: ${products}`);
  console.log(`  Months: ${months.map((m) => m.reportMonth).join(", ")}`);
  console.log(`  Total Sales: \u20B9${(agg._sum.salesAmount ?? 0).toLocaleString("en-IN")}`);
  console.log(`  Total Target: \u20B9${(agg._sum.targetAmount ?? 0).toLocaleString("en-IN")}`);
  console.log(`  Achievement: ${agg._sum.targetAmount ? (((agg._sum.salesAmount ?? 0) / (agg._sum.targetAmount ?? 0)) * 100).toFixed(1) : 0}%`);

  await p.$disconnect();
}

main();
