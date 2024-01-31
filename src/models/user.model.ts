import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    fullname: {
      type: String,
      required: false,
    },

    email: {
      type: String,
      required: false,
    },

    favouriteProducts : [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],

    password: {
      type: String,
      required: false,
    },

  },
  { timestamps: true, strict: false }
);

const User = mongoose.model("User", UserSchema);
export default User;
