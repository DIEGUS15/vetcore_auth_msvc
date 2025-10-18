import { Role } from "../models/associations.js";

export const seedRoles = async () => {
  try {
    const roles = [
      { name: "client" },
      { name: "veterinarian" },
      { name: "receptionist" },
      { name: "admin" },
    ];

    for (const role of roles) {
      await Role.findOrCreate({
        where: { name: role.name },
        defaults: role,
      });
    }

    console.log("✅ Roles seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding roles:", error);
    throw error;
  }
};
