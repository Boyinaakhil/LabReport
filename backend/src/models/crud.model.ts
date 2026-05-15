import mongoose from 'mongoose';

// 1. Doctor Notes Model
const doctorNoteSchema = new mongoose.Schema({
  fhirReportId: { type: String, required: true },
  patientId: { type: String, required: true },
  doctorId: { type: String, required: true },
  content: { type: String, required: true },
}, { timestamps: true });

// 2. Patient Comments Model
const patientCommentSchema = new mongoose.Schema({
  fhirReportId: { type: String, required: true },
  patientId: { type: String, required: true },
  content: { type: String, required: true },
}, { timestamps: true });

// 3. Shared Reports Model
const sharedReportSchema = new mongoose.Schema({
  fhirReportId: { type: String, required: true },
  patientId: { type: String, required: true },
  sharedWithEmail: { type: String, required: true },
  accessLevel: { type: String, enum: ['read-only', 'comment'], default: 'read-only' },
  expiresAt: { type: Date },
}, { timestamps: true });

// 4. Notifications Model
const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  type: { type: String, enum: ['alert', 'info', 'system'], default: 'info' },
}, { timestamps: true });

// 5. Alert Configurations Model
const alertConfigSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  biomarker: { type: String, required: true },
  condition: { type: String, enum: ['greater_than', 'less_than'], required: true },
  threshold: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// 6. Saved Filters Model
const savedFilterSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  filterConfig: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

// 7. Uploaded Reports Model
const uploadedReportSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  testName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending', 'Processed'], default: 'Pending' }
}, { timestamps: true });

export const DoctorNote = mongoose.model('DoctorNote', doctorNoteSchema);
export const PatientComment = mongoose.model('PatientComment', patientCommentSchema);
export const SharedReport = mongoose.model('SharedReport', sharedReportSchema);
export const Notification = mongoose.model('Notification', notificationSchema);
export const AlertConfig = mongoose.model('AlertConfig', alertConfigSchema);
export const SavedFilter = mongoose.model('SavedFilter', savedFilterSchema);
export const UploadedReport = mongoose.model('UploadedReport', uploadedReportSchema);
