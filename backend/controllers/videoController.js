const { v4: uuidv4 } = require('uuid');

exports.getRoomId = (req, res) => {
  res.status(200).json({ roomId: uuidv4() });
};