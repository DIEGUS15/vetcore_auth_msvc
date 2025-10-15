export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const userRole = req.user.role.name;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
        });
      }

      next();
    } catch (error) {
      console.error("Role middleware error:", error);
      res.status(500).json({
        success: false,
        message: "Error checking role permissions",
      });
    }
  };
};
