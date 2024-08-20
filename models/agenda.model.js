import mongoose from 'mongoose';

const agendaSchema = new mongoose.Schema({
  publisher: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
}, {
  timestamps: true,
  versionKey: false
});

const AgendaData = mongoose.model('agendas', agendaSchema);

export default AgendaData;
