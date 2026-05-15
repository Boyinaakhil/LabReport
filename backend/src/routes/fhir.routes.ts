import { Router } from 'express';
import { FHIRService } from '../services/fhir.service';

const router = Router();

// Get patient data
router.get('/patient/:id', async (req, res) => {
  try {
    const patient = await FHIRService.getPatient(req.params.id);
    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get diagnostic reports for a patient
router.get('/reports/:patientId', async (req, res) => {
  try {
    const reports = await FHIRService.getDiagnosticReports(req.params.patientId);
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific diagnostic report with observations
router.get('/report-detail/:reportId', async (req, res) => {
  try {
    const reportDetail = await FHIRService.getDiagnosticReportById(req.params.reportId);
    res.json(reportDetail);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Alias for frontend compatibility
router.get('/observations/detail/:reportId', async (req, res) => {
  try {
    const reportDetail = await FHIRService.getDiagnosticReportById(req.params.reportId);
    res.json(reportDetail);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get observations for a patient
router.get('/observations/:patientId', async (req, res) => {
  try {
    const observations = await FHIRService.getObservations(req.params.patientId);
    res.json(observations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
