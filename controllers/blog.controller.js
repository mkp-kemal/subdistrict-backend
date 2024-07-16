import BlogData from "../models/blog.model.js";

const createBlog = async (req, res) => {
    const { publisher, title, description, date } = req.body;
    const image = req.file;

    // Validasi input
    if (!publisher || !title || !description || !date || !image) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Buat instance baru dari model BlogData
        const newBlog = new BlogData({
            publisher,
            title,
            description,
            date,
            image: image.path
        });

        // Simpan blog baru ke database
        const savedBlog = await newBlog.save();

        // Kirim respon sukses
        res.status(201).json(savedBlog);
    } catch (error) {
        // Tangani error
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

export { createBlog, getBlogs };
