import Joi from "joi";

export const updateRoleSchema = Joi.object({
  role: Joi.string().valid("viewer", "analyst", "admin").required(),
});

export const updateStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

export const profileUpdateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(120).optional(),
  currentPassword: Joi.string().allow("").optional(),
  newPassword: Joi.string().min(6).max(128).optional(),
}).or("name", "newPassword");
