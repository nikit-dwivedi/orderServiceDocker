const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './audio/');
  },
  filename: function (req, file, cb) {
    cb(null, `${new Date().toDateString().replaceAll(" ","_")}_${new Date().getTime()}_${file.originalname}`);
  },
});

// const fileFilter = (req,file,cb) =>{
//   if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
//     cb(null,true);
//   }else{
//     cb(new Error('Invalid file type'),false);
//   }
// };

const uploads = multer({
  storage: storage,
  // limits:{
  //   fileSize: 1024 * 1024 * 3
  // },
  // fileFilter:fileFilter
});

module.exports = uploads;























// const multer = require("multer");
// const GridFsStorage = require("multer-gridfs-storage");

// const storage = new GridFsStorage({
//     url: process.env.DB,
//     options: { useNewUrlParser: true, useUnifiedTopology: true },
//     file: (req, file) => {
//         const match = ["image/png", "image/jpeg"];

//         if (match.indexOf(file.mimetype) === -1) {
//             const filename = `${Date.now()}-any-name-${file.originalname}`;
//             return filename;
//         }

//         return {
//             bucketName: "photos",
//             filename: `${Date.now()}-any-name-${file.originalname}`,
//         };
//     },
// });

// module.exports = multer({ storage });photos

// const util = require("util");
// const multer = require("multer");
// const { GridFsStorage } = require("multer-gridfs-storage");
// const dbConfig = {
//     url: "mongodb+srv://nikit:nikit@cluster0.053sm.mongodb.net/",
//     database: "blogDatabase",
//     imgBucket: "photos",
//   };
// var storage = new GridFsStorage({
//   url: dbConfig.url + dbConfig.database,
//   options: { useNewUrlParser: true, useUnifiedTopology: true },
//   file: (req, file) => {
//     const match = ["image/png", "image/jpeg"];
//     if (match.indexOf(file.mimetype) === -1) {
//       const filename = `${Date.now()}-bezkoder-${file.originalname}`;
//       return filename;
//     }
//     return {
//       bucketName: dbConfig.imgBucket,
//       filename: `${Date.now()}-bezkoder-${file.originalname}`
//     };
//   }
// });
// var uploadFiles = multer({ storage: storage }).single("file");
// var uploadFilesMiddleware = util.promisify(uploadFiles);
// module.exports = uploadFilesMiddleware;
