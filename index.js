import express from "express";
import dotenv from "dotenv";
import { sequelize, testConnection } from "./src/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import { seedRoles } from "./src/seeders/roleSeeder.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/auth", authRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

// Iniciar servidor y sincronizar base de datos
const startServer = async () => {
  try {
    // Probar conexión
    await testConnection();

    // Sincronizar modelos con la base de datos
    await sequelize.sync({ alter: true });
    console.log("✅ Modelos sincronizados con la base de datos");

    // Seed roles
    await seedRoles();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();
