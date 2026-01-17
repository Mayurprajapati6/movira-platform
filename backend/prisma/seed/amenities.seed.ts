import { prisma } from "../../src/config/prisma";

async function seedAmenities() {
  await (prisma as any).amenity.createMany({
    data: [
      // ===== GYM =====
      { name: "Parking", category: "GYM" },
      { name: "Locker", category: "GYM" },
      { name: "Shower", category: "GYM" },
      { name: "Personal Trainer", category: "GYM" },
      { name: "Cardio Equipment", category: "GYM" },
      { name: "Weight Training Area", category: "GYM" },
      { name: "Air Conditioning", category: "GYM" },
      { name: "Drinking Water", category: "GYM" },
      { name: "Washroom", category: "GYM" },
      { name: "Changing Room", category: "GYM" },
      { name: "Music System", category: "GYM" },
      { name: "CCTV Security", category: "GYM" },

      // ===== YOGA =====
      { name: "Meditation Hall", category: "YOGA" },
      { name: "Yoga Mats Provided", category: "YOGA" },
      { name: "Air Conditioning", category: "YOGA" },
      { name: "Natural Ventilation", category: "YOGA" },
      { name: "Peaceful Environment", category: "YOGA" },
      { name: "Instructor Guidance", category: "YOGA" },
      { name: "Drinking Water", category: "YOGA" },
      { name: "Changing Room", category: "YOGA" },
      { name: "Washroom", category: "YOGA" },
      { name: "Music / Chant System", category: "YOGA" },

      // ===== SWIMMING =====
      { name: "Lifeguard", category: "SWIMMING" },
      { name: "Changing Room", category: "SWIMMING" },
      { name: "Locker", category: "SWIMMING" },
      { name: "Shower", category: "SWIMMING" },
      { name: "Kids Pool", category: "SWIMMING" },
      { name: "Adult Pool", category: "SWIMMING" },
      { name: "Pool Cleaning System", category: "SWIMMING" },
      { name: "Water Filtration", category: "SWIMMING" },
      { name: "First Aid Kit", category: "SWIMMING" },
      { name: "CCTV Security", category: "SWIMMING" },
      { name: "Drinking Water", category: "SWIMMING" },
      { name: "Washroom", category: "SWIMMING" },

      // ===== DANCE =====
      { name: "Mirror Wall", category: "DANCE" },
      { name: "Sound System", category: "DANCE" },
      { name: "Air Conditioning", category: "DANCE" },
      { name: "Changing Room", category: "DANCE" },
      { name: "Washroom", category: "DANCE" },
      { name: "Drinking Water", category: "DANCE" },
      { name: "Wooden Flooring", category: "DANCE" },
      { name: "Instructor Guidance", category: "DANCE" },
      { name: "Waiting Area", category: "DANCE" },
      { name: "CCTV Security", category: "DANCE" },
    ],
    skipDuplicates: true, 
  });

  console.log("✅ Amenities seeded successfully");
}

seedAmenities()
  .catch((e) => {
    console.error("❌ Error seeding amenities", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
