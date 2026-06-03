const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const env = require('../config/env');

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Configure S3 Client
const s3Config = new S3Client({
  region: env.aws.region,
  credentials: {
    accessKeyId: env.aws.accessKeyId,
    secretAccessKey: env.aws.secretAccessKey,
  }
});

exports.deleteFromS3 = async (url) => {
  if (!url) return;
  try {
    // Extract key from URL
    // e.g., https://bucket.s3.region.amazonaws.com/uploads/123-abc.jpg
    const bucketHostname = `${env.aws.bucketName}.s3.${env.aws.region}.amazonaws.com`;
    let key;
    if (url.includes(bucketHostname)) {
      key = url.split(`${bucketHostname}/`)[1];
    } else if (url.includes('.amazonaws.com/')) {
      // General fallback
      key = url.split('.amazonaws.com/')[1];
    } else {
      // Local URL or old setup (not S3), won't delete from S3
      return;
    }

    if (key) {
      await s3Config.send(new DeleteObjectCommand({
        Bucket: env.aws.bucketName,
        Key: key
      }));
    }
  } catch (err) {
    console.error(`Failed to delete S3 file: ${url}`, err);
  }
};

const storage = multerS3({
  s3: s3Config,
  bucket: env.aws.bucketName,
  // AWS S3 blocks ACLs by default now. Ensure Bucket Policy enables public read.
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
    const randomStr = crypto.randomBytes(4).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `uploads/${Date.now()}-${randomStr}${ext}`);
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
