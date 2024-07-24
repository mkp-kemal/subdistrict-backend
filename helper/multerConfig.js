import multer from 'multer';
import { Storage } from '@google-cloud/storage';

// Inisialisasi Google Cloud Storage dengan kredensial dari variabel lingkungan
const storage = new Storage({
    credentials: {
        type: "service_account",
        project_id: "latihan-project-mkp",
        private_key_id: process.env.PRIVATE_KEY_ID,
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCkK+vjon4VZlpp\nIpyBYi0LBW6VlMBdlwOCezPdYt0Hdqi1gAevEBR8anr+ooCnN+6JsOmgWrGFxKEC\nWjlLjTqeopylyJ3rzUEaqvcg3sLiJRdV6z/F/IfoMVHxGLHmZluOTZWcq0ejAM00\ndL+fO4XAXE4DAfyc9Odxtv9c0LyA+eKrUfSw6nX1VnralZcTbdmt/+njdEAiGDZg\n/lX3o25NTwH+dR4fYtKgyaBjB1/WeuMN8vN5neCtH3stR/47X+rVUBBFJ5Xjx567\nEzpUQ+mFpUConcKxKia9smAS0Mvoqz5EECuzrD1C5xITsJwmma//5QWfof+jO+gw\nCr93nbQDAgMBAAECggEAGW4CPoLzg84UcBef5Xy3HG9tdzcQ6w5SyVnbKU5AjYDo\nViDsT8YuXi1COwIh6oUD6okgTyntOJrCE/K00Eqii2MF37opGBb1oDNeT1WiG1SC\nflkPylO5G5LULgPUvqsZQHwtEhUH5ixgHOF+syQNrkO+A8JBhnB7D0a43IAqytFq\nPrCSHonvVBPLw7S9l1d/Gw/KzdpQVjRVl9/WngJbM4ZYLtl73HH4qc1IwuYkX0Mc\nUwoLEmu++L3iCmuGvGf8crZsFGorh8F55SxCPgMF1Xf7TrNzwYmzo7FvqX4Uce+b\napjvw4N3nwub/UchvNpF9zevzpRjUGNSp8QEG1luDQKBgQDnHjc+PbqXclOwZNm3\nbWR/2hjmX6QSLfRPsRMrzJeGqD70LHJvuIt7uCuQz5Uwd5ZkAGUs6Vlr5T/hCbY+\nvSCQymhY2ghKw/B8CgzupsmHxMMiIJ4l50J8/OoN98FM0QckBVBh7TxtokSOPFcS\nHcYRzTcpd42WF2BasRVmstG8rwKBgQC12JyNV4i9luRhyvH4ozKCBhA/mwk0godx\nA9VDXV6dSuuFQqEu8HwmDfqo2JVerpTrO/IQipKfNdPOO0j9hLXUTor+zU1RTf0y\nvSz+pIGiym7UFVA1yUaKiTAIfw5jcMKLV6sQAiWkQ9B5TY5LdN9mOhobf1D50ufe\n3zx27sva7QKBgGOf2LxRq48AzyZoMpko5HtgLf+QFo9nk7qOX+8vX9nByHFEf4e9\nCxMnjk/7yxl7Uy6EJRi49bzWszR0FUTyDYmcVmKGibCAybcONgjhiFmn7V1WphU8\nnKJ3+wROWdqc9/EFAWNU+glgOyD8zaOXhfvCdBbB3BxoszYkw07johktAoGAKUHU\n+whyILmcZUebMJMuQWvIwfWV2BEJU63P8/G6Jqu51ckxMqojMKsZRLem5A1uAhTe\nrbwS2gZnYLH4tHQooNuVE4xWz2yHVryu+bMvKlUNYhbX1Owukf3gJP1WsV8C9IRW\nblJeYe903CCpeRsyGEp0Y+q134hnTRyO5lj1bV0CgYBWd1GY2D4eVaYRHslWKGme\ni7ZqyX0TYJvNZLEqSk8x6lpuQFxC+CkUqWYoT8n1QjiDzzTjz1U+3gJMhQ1QjwOe\nr3593Rwr05zaPw6j2weX1Bcp+fxcaM7D/pEQ7tPn6TKHYPFzT2nQGl4XzWnp2PrZ\nYhfR8Yj8k9R/FSRr/vPopw==\n-----END PRIVATE KEY-----\n",
        client_email: "project1@latihan-project-mkp.iam.gserviceaccount.com",
        client_id: "112380159211277570284",
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
        console.log('Getting images...');
        const [files] = await bucket.getFiles();
        console.log(files);

        const imageUrls = files.map(file => `https://storage.googleapis.com/${bucketName}/${file.name}`);

        // res.status(200).json(imageUrls);
        return res.send(imageUrls)
    } catch (error) {
        return res.status(500).json({ message: 'Gagal mendapatkan gambar', error: error.message });
    }
};



export { upload, uploadFile, getImages };
