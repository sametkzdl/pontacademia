import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 [Seed] Başlangıç verileri yükleniyor...");

  const adminEmail = "admin@pontacademy.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("admin123456", salt);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Pont Academy Admin",
        passwordHash,
        role: "ADMIN",
        mustChangePassword: false,
      },
    });

    console.log("✅ [Seed] Admin hesabı oluşturuldu:", admin.email);
  } else {
    console.log("ℹ️ [Seed] Admin hesabı zaten mevcut.");
  }
}

main()
  .catch((e) => {
    console.error("❌ [Seed Hatası]:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
