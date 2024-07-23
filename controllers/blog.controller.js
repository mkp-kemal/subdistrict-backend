import { Storage } from "@google-cloud/storage";
import { uploadFile } from "../helper/multerConfig.js";
import BlogData from "../models/blog.model.js";

const createBlog = async (req, res) => {
    const { publisher, title, description, date, gotongRoyong, masyarakat, wisata } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: 'Gambar harus di-upload' });
    }

    try {
        const imageUrl = await uploadFile(req.file);

        const newBlog = new BlogData({
            publisher,
            title,
            description,
            date,
            image: imageUrl,
            gotongRoyong,
            masyarakat,
            wisata
        });

        const savedBlog = await newBlog.save();

        res.status(201).json(savedBlog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error. Could not create blog.' });
    }
};

const getBlogs = async (req, res) => {
    try {
        const blogs = await BlogData.find().sort({ createdAt: -1 }); // Mengurutkan dari yang terbaru

        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mendapatkan data blog', error: error.message });
    }
};

const updateBlog = async (req, res) => {
    const { id } = req.params;
    const { title, description, date, story } = req.body;
    const image = req.file;

    // Validasi input
    if (!title || !description || !date || !story) {
        return res.status(400).json({ message: 'All fields except image are required' });
    }

    try {
        const blog = await BlogData.findById(id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        blog.title = title;
        blog.description = description;
        blog.date = date;
        blog.story = story;

        if (image) {
            const imageUrl = await uploadFile(image);
            blog.image = imageUrl;
        }

        const updatedBlog = await blog.save();

        res.status(200).json(updatedBlog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error. Could not update blog.' });
    }
};

const getBlogByTitle = async (req, res) => {
    try {
        const { title } = req.params;
        const blog = await BlogData.findOne({ title: new RegExp(title, 'i') });

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const deleteBlog = async (req, res) => {
    const { id } = req.params;

    try {
        const blog = await BlogData.findByIdAndRemove(id);

        if (!blog) return res.status(404).send('Blog tidak ditemukan');

        const imagePath = blog.image;

        if (imagePath) {
            const bucketName = 'image_blogs_subdistrict';
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
            const bucket = storage.bucket(bucketName);
            const fileName = imagePath.split('/').pop();

            await bucket.file(fileName).delete();
        }

        res.json({ message: 'Blog dan gambar berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export { createBlog, getBlogs, updateBlog, getBlogByTitle, deleteBlog };
