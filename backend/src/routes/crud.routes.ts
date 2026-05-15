import { Router, Request, Response } from 'express';
import { 
  DoctorNote, PatientComment, SharedReport, 
  Notification, AlertConfig, SavedFilter, UploadedReport 
} from '../models/crud.model';

const router = Router();

const handleCrud = (Model: any) => {
  const routes = Router();
  // CREATE
  routes.post('/', async (req, res) => {
    try {
      const doc = await Model.create(req.body);
      res.status(201).json(doc);
    } catch (err: any) { res.status(400).json({ error: err.message }); }
  });
  // READ ALL
  routes.get('/', async (req, res) => {
    try {
      const docs = await Model.find(req.query);
      res.json(docs);
    } catch (err: any) { res.status(400).json({ error: err.message }); }
  });
  // READ ONE
  routes.get('/:id', async (req, res) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json(doc);
    } catch (err: any) { res.status(400).json({ error: err.message }); }
  });
  // UPDATE
  routes.put('/:id', async (req, res) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(doc);
    } catch (err: any) { res.status(400).json({ error: err.message }); }
  });
  // DELETE
  routes.delete('/:id', async (req, res) => {
    try {
      await Model.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err: any) { res.status(400).json({ error: err.message }); }
  });
  return routes;
};

router.use('/notes', handleCrud(DoctorNote));
router.use('/comments', handleCrud(PatientComment));
router.use('/shares', handleCrud(SharedReport));
router.use('/notifications', handleCrud(Notification));
router.use('/alerts', handleCrud(AlertConfig));
router.use('/filters', handleCrud(SavedFilter));
router.use('/uploads', handleCrud(UploadedReport));

// Custom Notification Mark Read
router.put('/notifications/mark-read/:id', async (req, res) => {
  try {
    const n = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json(n);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});

router.put('/notifications/mark-all-read/:userId', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.params.userId }, { isRead: true });
    res.json({ success: true });
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});

export default router;
