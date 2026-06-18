import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

const hqs = [
  "Mumbai Region", "Delhi Region", "Bangalore Region", "Chennai Region",
  "Kolkata Region", "Hyderabad Region", "Ahmedabad Region", "Pune Region",
  "Jaipur Region", "Lucknow Region", "Surat Region", "Indore Region",
  "Bhopal Region", "Nagpur Region", "Patna Region", "Vadodara Region",
  "Coimbatore Region", "Guwahati Region", "Chandigarh Region", "Thiruvananthapuram Region",
  "Visakhapatnam Region", "Ranchi Region", "Jodhpur Region", "Raipur Region",
  "Bhubaneswar Region", "Mysore Region", "Aurangabad Region", "Nashik Region",
  "Vijayawada Region", "Madurai Region", "Rajkot Region", "Varanasi Region",
  "Agra Region", "Dehradun Region", "Srinagar Region", "Amritsar Region",
  "Jabalpur Region", "Gwalior Region", "Udaipur Region", "Jammu Region",
  "Kochi Region", "Mangalore Region", "Tiruchirappalli Region", "Pondicherry Region",
  "Shimla Region", "Panaji Region", "Gandhinagar Region", "Siliguri Region",
  "Dharamshala Region", "Haridwar Region",
];

const productPrefixes = [
  "Cardio", "Neuro", "Respir", "Gastro", "Hepato", "Renal", "Derma", "Ortho",
  "Ophthal", "Onco", "Psycho", "Immuno", "Pulmo", "Endo", "Pediatric",
];

const productSuffixes = [
  "win", "cap", "aid", "heal", "care", "med", "relief", "max",
  "forte", "pro", "plus", "zen", "guard", "shield", "safe",
];

const productForms = ["10mg", "20mg", "50mg", "100mg", "250mg", "500mg", "750mg", "1g"];

const months = [
  "2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06",
];

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomFloat(min, max + 1));
}

async function seed() {
  console.log("Seeding MedRepOS database...");

  await prisma.salesRecord.deleteMany();
  await prisma.uploadBatch.deleteMany();

  const productNames: { code: string; name: string }[] = [];
  let codeIndex = 1;

  for (const prefix of productPrefixes) {
    for (const suffix of productSuffixes) {
      if (productNames.length >= 200) break;
      const form = productForms[randomInt(0, productForms.length - 1)];
      const name = `${prefix}${suffix} ${form}`;
      const code = `MAT${String(codeIndex).padStart(3, "0")}`;
      productNames.push({ code, name });
      codeIndex++;
    }
    if (productNames.length >= 200) break;
  }

  const dummyBuffer = Buffer.from("medrepos-seed");
  const fileHash = createHash("sha256").update(dummyBuffer).digest("hex");

  const batch = await prisma.uploadBatch.create({
    data: {
      fileName: "seed_data_import.xlsx",
      fileHash,
      month: "2024-01,2024-02,2024-03,2024-04,2024-05,2024-06",
      recordsCount: 0,
    },
  });

  const batchSize = 1000;
  const totalRecords = hqs.length * productNames.length * months.length;
  let importedCount = 0;

  console.log(`Generating ${totalRecords} records (${hqs.length} HQs × ${productNames.length} products × ${months.length} months)...`);

  let data: any[] = [];

  for (const month of months) {
    for (const hqName of hqs) {
      const hqCode = `HQ${String(hqs.indexOf(hqName) + 1).padStart(3, "0")}`;

      for (const product of productNames) {
        const targetAmount = Math.round(randomFloat(80000, 600000));
        const achievementFactor = randomFloat(0.5, 1.3);
        const salesAmount = Math.round(targetAmount * achievementFactor);
        const netSales = Math.round(salesAmount * randomFloat(0.92, 0.99));
        const achievement = (salesAmount / targetAmount) * 100;

        data.push({
          hqCode,
          hqName,
          materialCode: product.code,
          materialName: product.name,
          targetAmount,
          salesAmount,
          netSales,
          achievement: Math.round(achievement * 100) / 100,
          reportMonth: month,
          uploadBatchId: batch.id,
        });

        if (data.length >= batchSize) {
          await prisma.salesRecord.createMany({ data });
          importedCount += data.length;
          console.log(`Imported ${importedCount} records...`);
          data = [];
        }
      }
    }
  }

  if (data.length > 0) {
    await prisma.salesRecord.createMany({ data });
    importedCount += data.length;
  }

  await prisma.uploadBatch.update({
    where: { id: batch.id },
    data: { recordsCount: importedCount },
  });

  console.log(`\nSeed complete!`);
  console.log(`- HQs: ${hqs.length}`);
  console.log(`- Products: ${productNames.length}`);
  console.log(`- Records: ${importedCount}`);
  console.log(`- Months: ${months.length}`);
  console.log(`- MoM comparisons: ${months.length - 1}`);

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
