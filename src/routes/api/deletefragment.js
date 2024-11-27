const { deleteFragment } = require('../../model/data/aws/index');
async function deleteFragmentRoute(req, res) {
  try {
      const { id } = req.params;
      const ownerId = req.user.ownerId;

      console.log(`Attempting to delete fragment with id: ${id} for owner: ${ownerId}`);

      const success = await deleteFragment(ownerId, id);

      if (!success) {
          console.log(`Fragment with id: ${id} not found.`);
          return res.status(404).json({ error: 'Fragment not found' });
      }

      console.log(`Fragment with id: ${id} successfully deleted.`);
      res.status(200).json({ success: true, message: 'Fragment deleted successfully' });
  } catch (error) {
      console.error(`Error deleting fragment: ${error.message}`);
      res.status(500).json({ error: 'Failed to delete fragment', details: error.message });
  }
}
module.exports = { deleteFragmentRoute };
