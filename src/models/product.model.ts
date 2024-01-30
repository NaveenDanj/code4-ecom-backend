import { number } from "joi";
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    sku: {
      type: String,
      unique: true,
    },

    productName: {
      type: String,
      required: false,
    },

    description: {
      type: String,
      required: false,
    },

    quantity: {
        type: number,
        default: 0
    },

    images : [{
        type: String,
    }],

  },
  { timestamps: true, strict: false }
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;
