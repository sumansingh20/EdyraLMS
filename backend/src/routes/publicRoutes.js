import express from 'express';
import homepageController from '../controllers/homepageController.js';

const router = express.Router();

router.get('/homepage', homepageController.getPublicHomepage);

export default router;