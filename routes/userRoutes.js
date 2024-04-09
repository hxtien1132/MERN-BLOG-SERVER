const { Router } = require("express");
// const { registerValidationRules } = require("../config/validator");
// const asyncHandler = require("express-async-handler");
const {
  registerUser,
  loginUser,
  logoutUser,
  changeAvatar,
  getUser,
  addUser,
  editUser,
  deleteUser,
  getAuthors,
} = require("../controller/userController");
const authMiddleware = require("../middleware/authMiddleware");
const userRouter = Router();

// userRouter.get(
//   "/",
//   asyncHandler(async (req, res, next) => {
//     res.json("this is router user");
//   })
// );
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);
userRouter.get("/:id", getUser);
userRouter.patch("/edit-user", authMiddleware, editUser);
userRouter.get("/", getAuthors);
userRouter.post("/change-avatar", authMiddleware, changeAvatar);

module.exports = userRouter;
