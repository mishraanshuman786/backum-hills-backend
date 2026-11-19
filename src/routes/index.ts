import { Router } from "express";
import productRoutes from "../modules/products/products.routes";
import categoryRoutes from "../modules/categories/categories.routes";
import inventoryRoutes from "../modules/inventory/inventory.routes";
import authRoutes from "../modules/auth/auth.routes";
import profileRoutes from "../modules/profile/profile.routes";

const router = Router();

router.get("/",(req,res)=>{
    res.status(200).json({success:true, message:"Server is Running....."});
});

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use(categoryRoutes);
router.use(productRoutes);
router.use("/admin/inventory",inventoryRoutes);



export default router;