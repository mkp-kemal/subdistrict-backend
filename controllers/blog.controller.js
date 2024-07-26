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
            const bucketName = "blogs_subdistrict";
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
