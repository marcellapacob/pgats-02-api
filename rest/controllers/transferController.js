const transferService = require('../../service/transferService');

exports.create = async (req, res) => {
  try {
    const { from, to, value } = req.body;
    const result = await transferService.transfer(from, to, value);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const result = await transferService.getAll();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};