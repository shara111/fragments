/**
 
The main entry-point for the v1 version of the fragments API.*/
const express = require('express');
const { Fragment } = require('../../model/fragments');

// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const getAllFragment = require('./get');
const getId = require('./getid');
const getInfo = require('./getinfo');
const { deleteFragment } = require('./deletefragment');  // Import your delete function
// Create a router on which to mount our API endpoints
const router = express.Router();

router.get('/fragments', getAllFragment);
router.get('/fragments/:id', getId);
router.get('/fragments/:id/:info', getInfo);

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      // See if we can parse this content type. If we can, req.body will be
      // a Buffer (e.g., Buffer.isBuffer(req.body) === true). If not, req.body
      // will be equal to an empty Object {} and Buffer.isBuffer(req.body) === false
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });

// Use a raw body parser for POST, which will give a Buffer Object or {} at req.body
// You can use Buffer.isBuffer(req.body) to test if it was parsed by the raw body parser.
router.post('/fragments', rawBody(), require('./post'));

// Other routes (POST, DELETE, etc.) will go here later on...
// DELETE route for deleting fragments
router.delete('/fragments/:id', async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user.id;  // Assuming you have user authentication set up

  try {
    const success = await deleteFragment(ownerId, id);  // Call your delete function

    if (success) {
      res.status(200).send('Fragment deleted');
    } else {
      res.status(404).send('Fragment not found');
    }
  } catch (error) {
    console.error('Error deleting fragment:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;