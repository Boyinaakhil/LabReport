import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Patient', 'Doctor', 'Admin', 'Lab Technician'], default: 'Patient' },
  fhirPatientId: { type: String }, // Links to FHIR Patient resource
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
