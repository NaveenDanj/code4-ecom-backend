import jwt from "jsonwebtoken";

export default {

  generateToken(email:string) {
    return jwt.sign({ email: email }, process.env.JWT_SECRET+'', {
      expiresIn: "30d",
    });
  },
    
}