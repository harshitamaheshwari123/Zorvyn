import Joi from "joi";

export const recordCreateSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    "number.base": "Amount must be a number",
    "number.positive": "Amount must be positive",
  }),
  type: Joi.string().valid("income", "expense").required(),
  category: Joi.string().trim().min(1).required(),
  date: Joi.date().optional(),
  notes: Joi.string().allow("").optional(),
});

export const recordUpdateSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  type: Joi.string().valid("income", "expense").optional(),
  category: Joi.string().trim().min(1).optional(),
  date: Joi.date().optional(),
  notes: Joi.string().allow("").optional(),
}).or("amount", "type", "category", "date", "notes");
