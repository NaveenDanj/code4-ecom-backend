import express from "express";
import authController from '../controllers/auth.controller'
import productController from '../controllers/product.controller'
import searchController from '../controllers/search.controller'
import favouriteController from '../controllers/favourite.controller'

const router = express.Router();
import userAuthRequired from '../middlewares/userAuthRequired.middleware'


router.get("/", (req, res) => {
  return res.json({ message: "code94labs e-com API v1.0.0" });
});

router.use("/auth", authController);
router.use("/product", userAuthRequired() , productController);
router.use("/search", userAuthRequired() , searchController);
router.use("/favourite", userAuthRequired() , favouriteController);

export default router;
