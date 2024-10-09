const express = require('express');

// Create a router on which to mount our API endpoints
const router = express.Router();

// Define our first route, which will be: GET /v1/fragments
router.get('/fragments', require('./get'));

// POST route for creating fragments
router.post('/fragments', require('./post'));

// DELETE route for deleting fragments
//router.delete('/fragments/:id', require('./delete'));

// PUT route for updating fragments
//router.put('/fragments/:id', require('./put'));

module.exports = router;
