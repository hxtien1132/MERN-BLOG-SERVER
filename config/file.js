const fs = require("fs");

// Đường dẫn của thư mục bạn muốn tạo
const directoryPath = "./uploads";
function createFile() {
  if (!fs.existsSync(directoryPath)) {
    // Nếu chưa tồn tại, sử dụng hàm mkdir để tạo thư mục
    fs.mkdir(directoryPath, (err) => {
      if (err) {
        console.error("Error creating directory:", err);
      } else {
        // console.log("Directory created successfully");
      }
    });
  } else {
    console.log("Directory already exists");
  }
}
module.exports = createFile;
// Kiểm tra xem thư mục đã tồn tại chưa
