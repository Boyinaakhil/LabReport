import mongoose from 'mongoose';

const reportMetadataSchema = new mongoose.Schema({
  fhirReportId: { type: String, required: true, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isBookmarked: { type: Boolean, default: false },
  viewedAt: { type: Date },
  status: { type: String, enum: ['Normal', 'Abnormal', 'Critical'], default: 'Normal' },
  // Local caching/metadata on top of FHIR
}, { timestamps: true });

export const ReportMetadata = mongoose.model('ReportMetadata', reportMetadataSchema);
