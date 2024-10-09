const updateFragment = async (req, res) => {
    const { id } = req.params; // Extract the fragment ID from the URL
    const updatedData = req.body; // Get updated data from the request body
  
    try {
      // Insert logic to update the fragment using the ID and updatedData
      res.status(200).json({ message: 'Fragment updated successfully', fragment: updatedData });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update fragment' });
    }
  };
  
  module.exports = updateFragment;
  