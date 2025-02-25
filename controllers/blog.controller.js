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
            const bucketName = "image_blogs_subdistrict";
            const storage = new Storage({
                credentials: {
                    type: "service_account",
                    project_id: "fifth-sunup-433003-f1",
                    private_key_id: process.env.PRIVATE_KEY_ID,
                    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
                    client_email: "nagrak@fifth-sunup-433003-f1.iam.gserviceaccount.com",
                    client_id: "102360794015599937986",
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
