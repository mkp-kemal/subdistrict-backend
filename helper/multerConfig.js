import multer from 'multer';
import { Storage } from '@google-cloud/storage';

// Inisialisasi Google Cloud Storage dengan kredensial dari variabel lingkungan
const storage = new Storage({
    credentials: {
        type: "service_account",
        project_id: "fifth-sunup-433003-f1",
        private_key_id: process.env.PRIVATE_KEY_ID,
        private_key: process.env.PRIVATE_KEY,
        client_email: "nagrak@fifth-sunup-433003-f1.iam.gserviceaccount.com",
        client_id: "102360794015599937986",
    },
});

const bucketName = "image_blogs_subdistrict";
const bucket = storage.bucket(bucketName);

const multerStorage = multer.memoryStorage();

const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('File hanya mendukung PNG, JPG, dan JPEG'), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 2 }
});

async function uploadFile(file) {
    const filename = Date.now() + '-kkn';
    const filePath = `${filename}`;
    const blob = bucket.file(filePath);

    const blobStream = blob.createWriteStream({
        metadata: {
            contentType: file.mimetype,
        },
    });

    return new Promise((resolve, reject) => {
        blobStream
            .on('finish', () => {
                const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
                resolve(publicUrl);
            })
            .on('error', (err) => {
                reject('Gagal upload gambar, ulangi upload gambar');
            })
            .end(file.buffer);
    });
}

const getImages = async (req, res) => {
    try {
        const [files] = await bucket.getFiles();

        const imageDetails = files.map(file => ({
            name: file.name,
            url: `https://storage.googleapis.com/${bucketName}/${file.name}`
        }));

        return res.json(imageDetails);
    } catch (error) {
        return res.status(500).json({ message: 'Gagal mendapatkan gambar', error: error.message });
    }
};


const deleteImage = async (req, res) => {
    const { fileName } = req.body;
    if (!fileName) return res.status(400).json({ message: 'File name is required' });

    try {
        const file = bucket.file(fileName);
        await file.delete();
        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Error deleting image', error: error.message });
    }
};



export { upload, uploadFile, getImages, deleteImage };
