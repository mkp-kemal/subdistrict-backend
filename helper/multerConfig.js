import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `${Date.now()}-${file.fieldname}${ext}`;
        cb(null, filename);
    }
});

const fileFilter = async (req, file, cb) => {
    try {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            throw new Error('File hanya mendukung PNG, JPG dan JPEG');
        }
    } catch (err) {
        cb(err, false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 1 }
});

export default upload;
