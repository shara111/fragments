// src/middleware/authenticateUser.js
module.exports = (req, res, next) => {
    // Check if req.user exists to simulate authenticated requests
    if (req.user) {
      next();
    } else {
      res.status(401).json({ status: 'error', error: { message: 'Authentication required' } });
    }
  };
  