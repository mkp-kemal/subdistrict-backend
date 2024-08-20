import multer from 'multer';
import { Storage } from '@google-cloud/storage';

// Inisialisasi Google Cloud Storage dengan kredensial dari variabel lingkungan
const storage = new Storage({
    credentials: {
        type: "service_account",
        project_id: "fifth-sunup-433003-f1",
        private_key_id: process.env.PRIVATE_KEY_ID,
        private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCTX1y7iKAq3Vcx\nvs54MPBkCDyeiEcqKzHO8Cl0Dk0rA7LAW0HAPgJ001EXT5KmLUaqUQkOpcRQ6FhS\nEWl1ea7zMiQH2681Swpb11VCcH9iCGQnSJSVdF3F3xSVXcSTDtKCPxLnKwKlFe9+\n8ECg6qRHCPuW7k50SUi52XNJwsJPYS/hBRtUBotKz40ZRLdowil8gD5ZQVnnwrwS\n2hTxHJeoUOIlbrrgMV7FwAWjYXOqWBVlaI/TcWKI2OGTaA/Cs5E4CZ8gdzzgARBG\nZUQ/vfDOKqjUdG6D4XFFOqNMaTIAhJkDEGjG5QjONcvSgQJWP+S9+pqotk65wOO9\nUqWMLXO5AgMBAAECggEAFqrMyHAlHo1ei3a11X5wLcVR5EUWw7woFD8T89dSnuKZ\n5wSXnOTiG4D4kIrQhhchrtxO9dNLr5wadZOwXP14iiHKBpwPcLWC5DRp1zxsGLKC\nC8QZ99DnBCJ3TTAX0PyvJpG4ARli9exlTWjRBU8shwaGgqT909yvvxzcotmTadel\nBCD5R6+XBxv4M0h1pxzO2EFj+lAVQBKNc3rXAbu3qOOiAP0xW1g/bvnCq/UWM32n\nwVR74qIw0M+bMQCSy08Sl7Er1RXVOsQGDx0YB8zXXhy4H22cPqjDz9YvxIgE0axP\nit8GYv9Pa5gTXBLaEtXmGlDjkPwoUu4nk4K3OguMBwKBgQDIEs14AwxVzIAoB3Wh\nwqPqrkJm4JMwIwE52fOMoRtuIdJjlFADZiKVGZHKTbw0VsFBQo569uc3GLz6Q9fR\n831ksvINFyIDHvPH+aKQQ1EIUpDvRpsJX0uZvponu40C0WwLcJb8C6W5Vc6biMST\nzh6aYudNFL5eCrrtFnHojlolowKBgQC8kUu8vyvkP91baZq+hCfaz1YK8vD5qwaf\n2KqIp0yKnPVRhN6kKXA+YEdMa7mv/LueGOHHk8XaPt4KxizDwMgIPiyj8ErGg/Io\nxnKiDOcJAiGqcq12oC9l0+zUgLWMJ8QIVFyItHuNhCP7gZtlUQqtMFrIwgyA37AF\nmheDI+z+8wKBgAQ2gSUZy1SzLa+qGIwDcTgr2zIXYIIO+qOhN0Oq0M0M4UU/hj/M\nEsZY93zvDht8CC27nQxxzoSWfMQ4UX8WRXmtWvNznT+7kx6O3yFyiW5Hbs3bCsCz\nxP/Dx7M2e82nY0MKZ+N+y0qPx/32b009dd+CXaR931RTnYQIiPWAqd1JAoGAeBDH\nubG7/8SObIMsbbx2KAO2lJglycMVH7h0tThZKzVPmo1QuhRMjNr+6vD4tc7lo3/S\nWyKDazh2Z0PSAv6AH4d/Iw+AfTBMg5wAJ6CxhvHdf8svGgZax6qN9KzTbB9x2Z/l\nn4HT3cLSqnTW/kcA1k+gro2oKnLDgH2iFPVOFPMCgYAqdh8wAKMhp0iLl3xcDIH0\nvL9Pf09izDBnIu/4Wc4toL7msvCYzzWo0HUfI9kad8RsUwlVQXLLAzUBJq/GeGQF\nh1HGvVDbbVRVNX25Cuo2t6L9GtOn9ommVNC4hWYB3IqZjl3pkygFYrSk/0l6Jzr4\nietxlz5p2nRATqHDmeAOHQ==\n-----END PRIVATE KEY-----\n',
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
