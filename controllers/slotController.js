const Slot = require('../models/slot');

exports.createSlot = async (req, res) => {
  try {
    const { slotName, startDate, endDate } = req.body;

    // Check for overlap
    const overlapSlot = await Slot.findOne({
      $or: [
        { startDate: { $lt: endDate }, endDate: { $gt: startDate } }
      ]
    });

    if (overlapSlot) {
      return res.status(400).json({ message: "Slot overlaps with existing slot." });
    }

    const slot = await Slot.create({ slotName, startDate, endDate });
    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSlots = async (req, res) => {
  try {
    const slots = await Slot.find();
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSlot = async (req, res) => {
  try {
    const { slotName, startDate, endDate } = req.body;
    const slot = await Slot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    // Check for overlap
    const overlapSlot = await Slot.findOne({
      _id: { $ne: slot._id },
      $or: [
        { startDate: { $lt: endDate }, endDate: { $gt: startDate } }
      ]
    });

    if (overlapSlot) {
      return res.status(400).json({ message: "Slot overlaps with existing slot." });
    }

    slot.slotName = slotName;
    slot.startDate = startDate;
    slot.endDate = endDate;

    await slot.save();
    res.status(200).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSlot = async (req, res) => {
  try {
    const slot = await Slot.findByIdAndDelete(req.params.id);

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.status(200).json({ message: "Slot deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
