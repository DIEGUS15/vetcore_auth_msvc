import { sequelize } from "./db.js";
import "./models/associations.js";

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB conectada");
    await sequelize.sync({ alter: true });
    console.log("Tablas sincronizadas correctamente");
  } catch (error) {
    console.error("Hubo un error al conectar la DB:", error.message);
  }
};
