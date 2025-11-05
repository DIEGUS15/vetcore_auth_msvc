import { User, Role } from "../models/associations.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { publishEvent } from "../config/rabbitmq.js";

export const register = async (req, res) => {
  try {
    const {
      fullname,
      telephone,
      address,
      isActive,
      email,
      password,
      roleName,
    } = req.body;

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "The email address is already registered.",
      });
    }

    const roleToAssign = roleName || "client";
    const role = await Role.findOne({ where: { name: roleToAssign } });

    if (!role) {
      return res.status(400).json({
        success: false,
        message: `Role "${roleToAssign}" not found. Please make sure roles are seeded.`,
      });
    }

    const newUser = await User.create({
      fullname,
      telephone,
      address,
      isActive,
      email,
      password,
      roleId: role.id,
    });

    // Publicar evento de usuario creado para notificaciones
    try {
      await publishEvent("client.created", {
        email: newUser.email,
        fullname: newUser.fullname,
        userId: newUser.id,
        roleName: role.name,
      });
      console.log(`Event client.created published for user: ${newUser.email}`);
    } catch (error) {
      // No fallar el registro si falla la publicación del evento
      console.error("Error publishing client.created event:", error);
    }

    res.status(201).json({
      success: true,
      message: "User successfully registered.",
      data: {
        id: newUser.id,
        fullname: newUser.fullname,
        telephone: newUser.telephone,
        address: newUser.address,
        isActive: newUser.isActive,
        email: newUser.email,
        createdAt: newUser.createdAt,
        role: role.name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive.",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "The password is incorrect. Please try again.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: {
          id: user.role.id,
          name: user.role.name,
        },
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successfully.",
      data: {
        token,
        user: {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          telephone: user.telephone,
          address: user.address,
          role: user.role.name,
          isActive: user.isActive,
          mustChangePassword: user.mustChangePassword, // Indicar si debe cambiar contraseña
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error during login.",
      error: error.message,
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    // El middleware verifyToken ya validó el token y agregó el usuario a req.user
    res.status(200).json({
      success: true,
      message: "Token is valid.",
      data: {
        user: {
          id: req.user.id,
          fullname: req.user.fullname,
          email: req.user.email,
          telephone: req.user.telephone,
          address: req.user.address,
          role: req.user.role.name,
          isActive: req.user.isActive,
        },
      },
    });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying token",
      error: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // El usuario viene del middleware de autenticación

    // Validar que se envíen ambos campos
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    // Validar longitud mínima de la nueva contraseña
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long.",
      });
    }

    // Buscar el usuario
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Verificar que la contraseña actual sea correcta
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar la contraseña y desactivar el flag mustChangePassword
    await user.update({
      password: hashedPassword,
      mustChangePassword: false,
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Error changing password.",
      error: error.message,
    });
  }
};
