import { User, Role } from "../models/associations.js";
import bcrypt from "bcryptjs";

export const getUsers = async (req, res) => {
  try {
    // Obtener parámetros de paginación de la query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Validar que los parámetros sean válidos
    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be positive numbers.",
      });
    }

    // Limitar el número máximo de resultados por página
    const maxLimit = 100;
    const validLimit = limit > maxLimit ? maxLimit : limit;

    // Obtener usuarios con paginación
    const { count, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ["password"] }, // Excluir la contraseña
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
        },
      ],
      limit: validLimit,
      offset: offset,
      order: [["createdAt", "DESC"]], // Ordenar por fecha de creación
    });

    // Calcular información de paginación
    const totalPages = Math.ceil(count / validLimit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully.",
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers: count,
          usersPerPage: validLimit,
          hasNextPage,
          hasPrevPage,
        },
      },
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving users.",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, telephone, address, email, password, roleName, isActive } =
      req.body;

    // Buscar el usuario
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Verificar si el email ya existe en otro usuario
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use by another user.",
        });
      }
    }

    // Si se proporciona un nuevo rol, buscar su ID
    let roleId = user.roleId;
    if (roleName) {
      const role = await Role.findOne({ where: { name: roleName } });
      if (!role) {
        return res.status(400).json({
          success: false,
          message: `Role "${roleName}" not found.`,
        });
      }
      roleId = role.id;
    }

    // Preparar datos para actualizar
    const updateData = {
      fullname: fullname || user.fullname,
      telephone: telephone !== undefined ? telephone : user.telephone,
      address: address !== undefined ? address : user.address,
      email: email || user.email,
      roleId,
      isActive: isActive !== undefined ? isActive : user.isActive,
    };

    // Si se proporciona una nueva contraseña, hashearla
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Actualizar el usuario
    await user.update(updateData);

    // Obtener el usuario actualizado con el rol
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user.",
      error: error.message,
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const {
      fullname,
      telephone,
      address,
      email,
      password,
      roleName,
      isActive,
    } = req.body;

    // Validar campos obligatorios
    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Fullname, email, and password are required.",
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "The email address is already registered.",
      });
    }

    // Buscar el rol especificado o usar 'client' por defecto
    const roleToAssign = roleName || "client";
    const role = await Role.findOne({ where: { name: roleToAssign } });

    if (!role) {
      return res.status(400).json({
        success: false,
        message: `Role "${roleToAssign}" not found. Please make sure roles are seeded.`,
      });
    }

    // La contraseña será hasheada automáticamente por el hook beforeCreate del modelo User
    const newUser = await User.create({
      fullname,
      telephone,
      address,
      isActive: isActive !== undefined ? isActive : true,
      email,
      password, // Se encripta automáticamente en el hook del modelo
      roleId: role.id,
    });

    // Obtener el usuario creado con el rol
    const createdUser = await User.findByPk(newUser.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "User created successfully by admin.",
      data: createdUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user.",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el usuario
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Verificar si el usuario ya está inactivo
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: "User is already inactive.",
      });
    }

    // Soft delete: cambiar isActive a false
    await user.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: "User deactivated successfully.",
      data: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user.",
      error: error.message,
    });
  }
};
