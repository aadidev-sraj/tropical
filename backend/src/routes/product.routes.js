const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/product.controller');

// Strapi webhook to upsert products on publish/update
router.post('/webhook/strapi', ctrl.strapiWebhook);

router.post('/sync', ctrl.syncFromStrapi);
router.get('/sync', ctrl.syncFromStrapi);
router.get('/', ctrl.list);
router.get('/:idOrSlug', ctrl.getOne);

module.exports = router;
