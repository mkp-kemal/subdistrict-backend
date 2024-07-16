import { ObjectId } from 'mongodb'
import mongoose from 'mongoose'

const navbarSchema = mongoose.Schema({
  home: {
    type: String,
    required: true
  },
  profile: {
    type: String,
    required: true
  },
  activity: {
    type: String,
    required: true
  },
  history: {
    type: String,
    required: true
  },
  header: {
    type: [String],
    required: true
  },
}, { timestamps: true });
const NavbarData = mongoose.model('navbars', navbarSchema)

export default NavbarData