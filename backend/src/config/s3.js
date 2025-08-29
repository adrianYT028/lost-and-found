const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Check if S3 is configured
const isS3Configured = () => {
  return !!(process.env.AWS_ACCESS_KEY_ID &&
           process.env.AWS_SECRET_ACCESS_KEY &&
           process.env.AWS_S3_BUCKET);
};

// S3 storage configuration
const s3Storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_S3_BUCKET,
  acl: 'public-read', // Makes files publicly accessible
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = require('path').extname(file.originalname);
    const filename = `images-${uniqueSuffix}${extension}`;
    console.log('📤 Uploading to S3:', filename);
    cb(null, filename);
  }
});

// Local storage fallback (for development)
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = require('path').join(__dirname, '../../uploads');

    // Ensure directory exists
    if (!require('fs').existsSync(uploadPath)) {
      require('fs').mkdirSync(uploadPath, { recursive: true });
      console.log('📁 Created uploads directory during file upload:', uploadPath);
    }

    console.log('📤 File upload destination:', uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + require('path').extname(file.originalname);
    console.log('📝 Generated filename:', filename);
    cb(null, filename);
  }
});

// Choose storage based on configuration
const storage = isS3Configured() ? s3Storage : localStorage;

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Max 5 files
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create upload middleware that handles both files and text fields
const uploadFields = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'title', maxCount: 1 },
  { name: 'description', maxCount: 1 },
  { name: 'type', maxCount: 1 },
  { name: 'category', maxCount: 1 },
  { name: 'location', maxCount: 1 },
  { name: 'dateTime', maxCount: 1 },
  { name: 'contactInfo', maxCount: 1 },
  { name: 'reward', maxCount: 1 }
]);

// Helper function to get full image URL
const getImageUrl = (filename) => {
  if (!filename) return null;

  if (isS3Configured()) {
    // Return S3 URL
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${filename}`;
  } else {
    // Return local URL (for development)
    return `/uploads/${filename}`;
  }
};

module.exports = {
  upload,
  uploadFields,
  getImageUrl,
  isS3Configured
};
