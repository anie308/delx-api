// const multer = require('multer');

// const storage = multer.diskStorage({})
// const fileFilter = (req, file, cb) => {
//     if(!file.mimetype.includes('image')){
//         return cb('Invalid image format!', false);
//     }
//     cb(null, true)
// }

// module.exports = multer({storage, fileFilter})

const multer = require('multer');

const storage = multer.diskStorage({})
const fileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')){
        cb(null, true);
    } else {
        cb('Invalid file type. Only images and videos are allowed!', false);
    }
}

module.exports = multer({storage, fileFilter})
