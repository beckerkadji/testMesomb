import Joi from "joi";
import  {schema}  from "../utils/schema";

export const paymentSchema = Joi.object({
    amount : schema.amount,
    phone : schema.phoneNumber,
})
