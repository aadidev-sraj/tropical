const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/featured.controller');

// Strapi webhook to upsert featured items on publish/update
router.post('/webhook/strapi', ctrl.strapiWebhook);

router.post('/sync', ctrl.syncFromStrapi);
router.get('/sync', ctrl.syncFromStrapi);
router.get('/', ctrl.list);

module.exports = router;
