import { User, Role } from "../models/associations.js";
import jwt from "jsonwebtoken";

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
