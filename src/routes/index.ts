import { Router } from "express";
import productRoutes from "../modules/products/products.routes";
import categoryRoutes from "../modules/categories/categories.routes";

// import authRoutes from "../modules/auth/auth.routes";
// import productRoutes from "../modules/products/products.routes";
// import categoryRoutes from "../modules/categories/categories.routes";
// import collectionRoutes from "../modules/collections/collections.routes";

const router = Router();

router.get("/",(req,res)=>{
    res.status(200).json({success:true, message:"Server is Running....."});
});

router.use(categoryRoutes);
router.use(productRoutes);

// router.use("/auth", authRoutes);
// router.use("/products", productRoutes);
// router.use("/categories", categoryRoutes);
// router.use("/collections", collectionRoutes);

export default router;