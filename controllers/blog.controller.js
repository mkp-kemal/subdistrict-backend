import BlogData from "../models/blog.model.js";
import fs from 'fs';

const createBlog = async (req, res) => {
    const { publisher, title, description, date, gotongRoyong, masyarakat, wisata } = req.body;
    const image = req.file;

    if (!publisher || !title || !description || !date || !image) {
        return res.status(400).json({ message: 'Isi semua kolom' });
    }

    try {
        const newBlog = new BlogData({
            publisher,
            title,
            description,
            date,
            image: image.path,
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
    const { publisher, title, description, date, story } = req.body;
    const image = req.file;

    // Validasi input
    if (!publisher || !title || !description || !date || !story) {
        return res.status(400).json({ message: 'All fields except image are required' });
    }

    try {
        const blog = await BlogData.findById(id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        blog.publisher = publisher;
        blog.title = title;
        blog.description = description;
        blog.date = date;
        blog.story = story;

        if (image) {
            blog.image = image.path;
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

        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        res.json({ message: 'Blog berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createBlog, getBlogs, updateBlog, getBlogByTitle, deleteBlog };
