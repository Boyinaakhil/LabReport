import { Router, Request, Response } from 'express';
import { ReportMetadata } from '../models/report.model';

const router = Router();

// Mock analytics data for the dashboard (In a real scenario, this would aggregate from FHIR + DB)
router.get('/analytics', (req: Request, res: Response) => {
  res.json({
    totalReports: 124,
    normalReports: 95,
    abnormalReports: 25,
    criticalReports: 4,
    pendingReports: 2,
    reportsThisMonth: 12,
    bloodSugarTrends: [90, 95, 110, 105, 98, 92],
    cholesterolTrends: [180, 185, 190, 175, 160, 165],
    thyroidTrends: [2.5, 2.6, 2.1, 2.8, 3.0, 2.4],
    insights: [
      { text: 'Blood sugar trend is improving compared to last quarter.', type: 'positive' },
      { text: 'Cholesterol increased by 15%. Recommend doctor consultation.', type: 'warning' }
    ]
  });
});

// Get Bookmarks
router.get('/bookmarks/:patientId', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const bookmarks = await ReportMetadata.find({ patientId, isBookmarked: true });
    res.json(bookmarks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle Bookmark
router.post('/bookmark', async (req: Request, res: Response) => {
  try {
    const { fhirReportId, patientId, isBookmarked } = req.body;
    let metadata = await ReportMetadata.findOne({ fhirReportId, patientId });
    if (metadata) {
      metadata.isBookmarked = isBookmarked;
      await metadata.save();
    } else {
      metadata = await ReportMetadata.create({ fhirReportId, patientId, isBookmarked });
    }
    
    // Emit realtime event
    const io = req.app.get('io');
    if (io) {
      io.emit('bookmarkUpdated', metadata);
    }
    
    res.json({ success: true, metadata });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Share Report
router.post('/share', (req: Request, res: Response) => {
  const { fhirReportId, email } = req.body;
  // Mock sending email
  res.json({ success: true, message: `Report ${fhirReportId} securely shared with ${email}.` });
});

export default router;
