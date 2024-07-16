import NavbarData from "../models/navbar.model.js.js";


const getNavbarData = async (req, res) => {
  try {
    const data = await NavbarData.find()
    if (data.length === 0) {
      return res.status(404).send({ message: 'Data navbar tidak ditemukan' })
    }
    return res.send(data)
  } catch (err) {
    return res.status(500).send({ message: err.message })
  }
};

export { getNavbarData }