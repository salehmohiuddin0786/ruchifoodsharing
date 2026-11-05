const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `dish_${Date.now()}_${cleanBase}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  if (allowed.test(ext) && allowed.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WEBP, GIF) are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
});

/**
 * POST /api/upload
 * Multi-part form-data image upload
 */
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please choose an image file to upload.' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      url: imageUrl,
      imageUrl: imageUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    console.error('File Upload Error:', error);
    res.status(500).json({ error: error.message || 'Image upload failed.' });
  }
});

/**
 * POST /api/upload/base64
 * Base64 image payload upload
 */
router.post('/base64', (req, res) => {
  try {
    const rawData = req.body.base64Data || req.body.dataUrl || req.body.image;
    if (!rawData) {
      return res.status(400).json({ error: 'Missing base64 data.' });
    }

    // Strip data:image/...;base64,
    const matches = rawData.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    let ext = '.png';
    let dataBuffer;

    if (matches) {
      ext = '.' + matches[1];
      dataBuffer = Buffer.from(matches[2], 'base64');
    } else {
      dataBuffer = Buffer.from(rawData, 'base64');
    }

    const outFilename = `dish_${Date.now()}_upload${ext}`;
    const filePath = path.join(uploadDir, outFilename);
    fs.writeFileSync(filePath, dataBuffer);

    const host = req.get('host');
    const protocol = req.protocol;
    const imageUrl = `${protocol}://${host}/uploads/${outFilename}`;

    res.json({
      success: true,
      url: imageUrl,
      imageUrl: imageUrl,
      filename: outFilename,
    });
  } catch (error) {
    console.error('Base64 Upload Error:', error);
    res.status(500).json({ error: error.message || 'Image upload failed.' });
  }
});

module.exports = router;
