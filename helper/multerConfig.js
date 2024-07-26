import multer from 'multer';
import { Storage } from '@google-cloud/storage';

// Inisialisasi Google Cloud Storage dengan kredensial dari variabel lingkungan
const storage = new Storage({
    credentials: {
        type: "service_account",
        project_id: "mkp-project-01",
        private_key_id: process.env.PRIVATE_KEY_ID,
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDvJytxjEG5rfNp\npt+BgBFoLGY5egPqDI0w7Q5DLFkFParcJiqcMeTw7Z3/KyJOArxz8snpmIBblWej\n6zcfM10pifwDws/jlQw7vAw/vcbY5668mqdD2rD2KezYodguOkG3MoOzs0d3wVWk\ndAMnnwWyfF/lkG4+XWSJDavjpPTpGuImFNNe9oEu5ZcJgBacuRKZnmxnAtQqgklq\n2jFAUTpC5waClZcXZGD8txC7s/ZV4BrYU/J/8/gEdUQjMvN/I5V/WtYt7/Q+9VdJ\nnA0pjFzwetT5w1+CHbTlGJfupphBGShVOEZtQLJ8bP2YaaQ7Yhx/RrbULeSTqjDt\n6zrpWqKlAgMBAAECggEATAaltukhk8eK1BFqiB6Qag+DR85UJDltQRp7KDuW6SWb\nhXTUoubxou3HBnFN7ILOKgYKzine1D6Avglucoq/mQ72gLOTpwOg6fRz6GeKKTYt\nxGNdvSJukzLsyklZEgkPDxAN8jiSBa3+bdM7lYLmKsGDMtVhVo4WAcPI2wt7mAaI\nb/ohCtvSU8cIGz9KRnJ20zDDHAsbYMTrx1MgtZMX47foFe/7n/grzlKLZ6FI/17M\nh7MZC+d3OGtyz1s6Xn7lFzk9FUG0wRUUekemx+oWt1gREV6QegOetwc4Ime/56/4\ntmSyT+WecA9J75+O5FHeoq93uSSnPk/yzWAtTSahWQKBgQD+niJSjPRziXGpHQKA\nqON9XqakN/J8zsDbaKmHA/ZEmMd24I8k9CPBlR8vDbOvZwLegHyyAcIA/umTLDE7\nyVA3DGwA/nkSl727ckVaS3LSY47jaju5FulWAOi+BsUFFb2wKxIbFxG7kuyXTDWH\nPLUeOcgWYz0JVjtkugrnjvzRgwKBgQDwc4r62UWL/g3rSnLzV222YvTzvuyqRtah\no1fcrheB2y2L+R5vx3EjDErElJs9nGq3aOBDCVVwDlXbP7lrs9gXq78temJvS4d1\ngv601sQDACUsmOXGaJkxnagoO0p1RKvZmdN9VjvDml9rcn96pwf7yFTxMBUNCsTF\ny/wcodtKtwKBgQDP11PbIPaWrXZbfrPBRJvWhgHvgT/vA3LIZ6oi7WgE3NXNw0b1\n+liJt+mppjysDKF58VZYlDjCSVNvcJ6L2Cwjk39CXHeGZtlY/tGAAKCs/tnv55Ly\n5rH4I2vZWntPSEz8VlxEQtOV0zxP0MTNLRAHqVEcfUugqIR5F6i5Fq5ncwKBgA5Y\ndmQ87j9J6v6stGr8PllxUffw3iHSlB+UpTtPT6u5rd/5/uzgU0mqBBPyYcitOliy\n8x5MwkIrOMgZ5zAbzLqszn0iHhlRwkUqiZO0dIFRUuZ0QNEzkGA7bbrovqp8bFxR\nJyMFMA+deC/q5twkdv94lkjFe5wJlm/Omb4DkhfFAoGAGex2iQaThIUwA7mJNbOA\nCf0VapvXqzH6BFMN8o7KHSXCGLxHCP9QVO3mJLBaSdgIyFPKR4PIU414rAIcp8Xv\nP9ascFg7FdWyxDxyTa/aH+c+carK1KD9Qfyh+DtqbDEjGwIyhT2ceioNGz+gxy8a\nKnbEMdasOn+aQvXR5A4DhPg=\n-----END PRIVATE KEY-----\n",
        client_email: "blogs-subdistrict@mkp-project-01.iam.gserviceaccount.com",
        client_id: "116541783390188450970",
    },
});

const bucketName = "blogs_subdistrict";
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
