//============================= AUTH =============================
const asyncHandler = require("express-async-handler");
const { v4: uuid } = require("uuid");
const HttpError = require("../models/errorModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const { generateToken } = require("../config/token");
// register
const registerUser = asyncHandler(async (req, res, next) => {
  try {
    const { name, email, password, password2 } = req.body;
    if (!name || !email || !password || !password2) {
      return next(new HttpError("Fill in all Fields", 422));
    }
    const newEmail = email.toLowerCase();
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return next(new HttpError("'email' is already in use", 422));
    }
    if (password.trim().length < 6) {
      return next(new HttpError("'password should be at least 6 characters", 422));
    }
    if (password != password2) {
      return next(new HttpError("password do not match", 422));
    }
    // const salt = await bcrypt.genSaltSync(10);
    // const hasdedPass = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      name,
      email: newEmail,
      password,
    });

    res.status(201).json(`new user ${newUser.email} registed}`);
  } catch (error) {
    next(new HttpError("User register failed", 422));
  }
  // next();
});
// login
const loginUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new HttpError("Fill in all Fields", 422));
    }
    const newEmail = email.toLowerCase();
    const user = await User.findOne({ email: newEmail });
    if (!user) {
      return next(new HttpError("Invalid credentials", 422));
    }
    const comparsePass = await user.matchPassword(password);
    if (!comparsePass) {
      return next(new HttpError("Invalid password", 422));
    }
    const { _id: id, name: name } = user;
    const token = generateToken(id, name);
    res.status(200).json({ id, name, token });
  } catch (error) {
    return next(new HttpError("Invalid credentialss", 422));
  }
});

// Logout
const logoutUser = asyncHandler(async (req, res, next) => {
  res.json("logout User");
});

// CHANGE AVATAR
const changeAvatar = asyncHandler(async (req, res, next) => {
  // console.log(req.files.avatar);
  try {
    if (!req.files.avatar) {
      next(new HttpError("Please choose an image"), 422);
    }

    const user = await User.findById(req.user.id);
    // console.log(user);
    if (user.avatar) {
      const filePath = path.join(__dirname, "..", "uploads", user.avatar);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) return next(new HttpError(err));
          // else console.log("Deleted file:", filePath);
        });
      } else {
        console.log("file not found", filePath);
      }
    }
    const { avatar } = req.files;
    if (avatar.size > 500000) {
      next(new HttpError("Profile picture too big.should be less than 500kb", 422));
    }
    let filename;
    filename = avatar.name;
    let splittedFilename = filename.split(".");
    let newFilename =
      splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1];
    // console.log("newFilename", newFilename);
    // upload file image into uploads
    avatar.mv(path.join(__dirname, "..", "uploads", newFilename), async (err) => {
      if (err) return next(new HttpError(err));
      const updateAvatar = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: newFilename },
        { new: true }
      );
      if (!updateAvatar) return next(new HttpError("Avatar couldn' be changed", 422));
      res.status(200).json(updateAvatar);
    });
    // console.log(avatar);
  } catch (error) {
    next(new HttpError(error));
  }
});

//============================= USER =============================
// get user
const getUser = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return next(new HttpError("User not found", 404));
    }
    res.status(200).json(user);
  } catch (error) {
    return next(new HttpError(error));
  }
});
// const addUser = asyncHandler(async (req, res, next) => {
//   res.json("add User");
// });

// edit user
const editUser = asyncHandler(async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword, confirmNewPassword } = req.body;
    if (!name || !email || !currentPassword || !newPassword || !confirmNewPassword) {
      return next(new HttpError("Fill in all Fields", 422));
    }
    //check user exist
    console.log(req.user.id);
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(HttpError("User not found", 403));
    }
    //check email exist
    const emailExist = await User.findOne({ email: email });
    if (emailExist && emailExist._id != req.user.id) {
      return next(new HttpError("Email already exists", 422));
    }

    //compare currentpassword is the same as password  db
    const validateUserPassword = await user.matchPassword(currentPassword);
    console.log(validateUserPassword);
    if (!validateUserPassword) {
      return next(new HttpError("Invalid current password", 422));
    }
    //compare new password
    if (newPassword != confirmNewPassword) {
      return next(new HttpError("New password do not match", 422));
    }
    // hash new password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    //update user
    const newInfo = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        email,
        password: hash,
      },
      { new: true }
    );
    res.status(200).json(newInfo);
  } catch (error) {
    next(new HttpError(error));
  }
});
const getAuthors = asyncHandler(async (req, res, next) => {
  try {
    const authors = await User.find().select("-password");
    res.json(authors);
  } catch (error) {
    return next(new HttpError(error));
  }
});

// const deleteUser = asyncHandler(async (req, res, next) => {
//   const id = req.params.id;
//   let product = await User.findByIdAndDelete(id);
//   res.json("deleted successfully");
// });

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  changeAvatar,
  getUser,
  editUser,
  getAuthors,
};
