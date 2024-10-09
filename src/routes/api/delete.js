const deleteFragment = async (req, res) => {
    const { id } = req.params; // Extract the fragment ID from the URL
    try {
      // Insert logic to delete the fragment using the ID
      // Return a success response
      res.status(204).send(); // No content for successful deletion
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete fragment' });
    }
  };
  
  module.exports = deleteFragment;
  