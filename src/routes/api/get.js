// GET /v1/fragments
 const { createSuccessResponse, createErrorResponse } = require('../../response'); 
//Import the functions 
const { getFragmentsByUser } = require('./index'); 
// Adjust according to your data handling logic // GET /v1/fragments 
module.exports = async (req, res) => {
   res.status(200).json(createSuccessResponse({fragments: []})) 
  };


