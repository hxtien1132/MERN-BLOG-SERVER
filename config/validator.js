const { body } = require("express-validator");

module.exports.registerValidationRules = [
  body("name")
    .notEmpty()
    .withMessage("Username không được để trống")
    .isLength({ min: 3 })
    .withMessage("Username phải có ít nhất 3 ký tự"),
  body("email").isEmail().withMessage("Địa chỉ email không hợp lệ"),
  body("password").isLength({ min: 6 }).withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
  body("password2")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự")
    // Kiểm tra xem password2 có giống với password không
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Mật khẩu xác nhận không khớp với mật khẩu đã nhập");
      }
      return true;
    }),
];
