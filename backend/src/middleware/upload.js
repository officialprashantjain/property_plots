const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const randomStr = crypto.randomBytes(4).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomStr}${ext}`);
  }
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only jpg, jpeg, png and webp files are allowed'), false);
  }
};

const multerInstance = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});

exports.uploadSingle = multerInstance.single('image');
exports.uploadMultiple = multerInstance.array('images', 10);

exports.uploadPropertyImages = multerInstance.fields([
  { name: 'primaryImage', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]);

// Excel Upload Config (Memory Storage for fast processing without saving locally)
const excelFilter = (req, file, cb) => {
  const allowed = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel (.xlsx, .xls) or CSV files are allowed'), false);
  }
};

const excelMulter = multer({
  storage: multer.memoryStorage(),
  fileFilter: excelFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for excel
});

exports.uploadExcel = excelMulter.single('file');

exports.handleMulterError = (err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Max size is 5MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ success: false, message: 'Too many files. Max 10 allowed.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};
