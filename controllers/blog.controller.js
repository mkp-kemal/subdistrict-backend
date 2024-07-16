import BlogData from "../models/blog.model.js";

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
    const { publisher, title, description, date } = req.body;
    const image = req.file;

    // Validasi input
    if (!publisher || !title || !description || !date) {
        return res.status(400).json({ message: 'All fields except image are required' });
    }

    try {
        // Temukan blog berdasarkan ID
        const blog = await BlogData.findById(id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Update field blog
        blog.publisher = publisher;
        blog.title = title;
        blog.description = description;
        blog.date = date;

        // Jika ada file image baru, update path image
        if (image) {
            blog.image = image.path;
        }

        // Simpan perubahan ke database
        const updatedBlog = await blog.save();

        // Kirim respon sukses
        res.status(200).json(updatedBlog);
    } catch (error) {
        // Tangani error
        console.error(error);
        res.status(500).json({ message: 'Server error. Could not update blog.' });
    }
};

export { createBlog, getBlogs, updateBlog };
