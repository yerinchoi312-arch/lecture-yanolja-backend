import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import "../schemas/category.schema";

const categoryRoute = Router();
const categoryController = new CategoryController();

categoryRoute.get("/", categoryController.getCategories);
categoryRoute.get("/:path/:subId", categoryController.getSubCategoryDetail);

export default categoryRoute;