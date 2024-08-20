import { Storage } from "@google-cloud/storage";
import { uploadFile } from "../helper/multerConfig.js";
import AgendaData from "../models/agenda.model.js";

const createAgenda = async (req, res) => {
    const { publisher, title, description, date } = req.body;

    try {
        const newAgenda = new AgendaData({
            publisher,
            title,
            description,
            date,
        });

        const savedAgenda = await newAgenda.save();

        res.status(201).json(savedAgenda);
    } catch (error) {
        res.status(500).json({ message: 'Server error, coba lagi membuat agenda' });
    }
};

const getAgendas = async (req, res) => {
    try {
        const agendas = await AgendaData.find().sort({ createdAt: -1 }).limit(4);

        res.status(200).json(agendas);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mendapatkan data agenda', error: error.message });
    }
};


const updateAgenda = async (req, res) => {
    const { id } = req.params;
    const { title, description, date, story } = req.body;

    try {
        const agenda = await AgendaData.findById(id);
        if (!agenda) {
            return res.status(404).json({ message: 'agenda tidak ada' });
        }

        agenda.title = title;
        agenda.description = description;
        agenda.date = date;
        agenda.story = story;

        const updatedagenda = await agenda.save();

        res.status(200).json(updatedagenda);
    } catch (error) {
        res.status(500).json({ message: 'Server error. Could not update blog.' });
    }
};

const deleteAgenda = async (req, res) => {
    const { id } = req.params;

    try {
        const agenda = await AgendaData.findByIdAndRemove(id);

        if (!agenda) return res.status(404).send('Agenda tidak ditemukan');

        const imagePath = agenda.image;

        if (imagePath) {
            const bucketName = "image_blogs_subdistrict";
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
            const bucket = storage.bucket(bucketName);
            const fileName = imagePath.split('/').pop();

            await bucket.file(fileName).delete();
        }

        res.json({ message: 'Agenda berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export { createAgenda, getAgendas, updateAgenda, deleteAgenda };
