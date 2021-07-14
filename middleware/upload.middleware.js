const multer = require('multer')

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads')
  },
  filename: (req, file, cb ) => {
    cb(null, file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  const excludeMimeType = [
    'application/bat',
    'application/x-bat',
    'application/x-msdos-program',
    'application/vnd.microsoft.portable-executable'
  ]

  if (!excludeMimeType.includes(file.mimetype)) { // checking the MIME type of the uploaded file
      cb(null, true);
  } else {
      cb(null, false);
  }
}

const upload = multer({
  fileFilter,
  storage : fileStorageEngine
})

module.exports = upload