import { Router } from "express";
import { signupLoginControll } from "./auth.controller";

const router = Router();
router.post("/signup", signupLoginControll.signup);
router.post("/login", signupLoginControll.createLogin);
export const userRoute = router;
