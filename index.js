import express from "express";
import dotenv from "dotenv";
import { sequelize, testConnection } from "./src/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import { seedRoles } from "./src/seeders/roleSeeder.js";
import { connectRabbitMQ, closeConnection } from "./src/config/rabbitmq.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

// Iniciar servidor y sincronizar base de datos
const startServer = async () => {
  try {
    // Probar conexión
    await testConnection();

    // Sincronizar modelos con la base de datos (sin alter para evitar conflictos)
    await sequelize.sync({ force: false });
    console.log("Modelos sincronizados con la base de datos");

    // Seed roles
    await seedRoles();

    // Conectar a RabbitMQ (no crítico - el servicio puede funcionar sin él)
    try {
      await connectRabbitMQ();
      console.log("RabbitMQ connected in Auth Service");
    } catch (error) {
      console.warn("⚠️  Warning: RabbitMQ connection failed. Service will continue without event publishing.");
      console.warn("RabbitMQ error:", error.message);
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

// Manejo de cierre graceful
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await closeConnection();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nShutting down gracefully...");
  await closeConnection();
  process.exit(0);
});

startServer();
