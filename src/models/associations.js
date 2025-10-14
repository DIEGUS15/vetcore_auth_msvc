import User from "./User.js";
import Role from "./Role.js";

User.belongsTo(Role, { foreignKey: "roleId", as: "role" });
Role.hasMany(User, { foreignKey: "roleId", as: "users" });

export { User, Role };
