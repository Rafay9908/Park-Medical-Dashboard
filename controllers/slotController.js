const Slot = require('../models/slot');

// Create slot
exports.createSlot = async (req, res) => {
  try {
    const { slotName, startDate, endDate } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const breakStart = new Date(start);
    breakStart.setUTCHours(12, 30, 0, 0);
    const breakEnd = new Date(start);
    breakEnd.setUTCHours(13, 30, 0, 0);

    if (start < breakEnd && end > breakStart) {
      return res.status(400).json({
        message: "Slot overlaps with the lunch break (12:30 PM – 1:30 PM)."
      });
    }

    const bufferBefore = new Date(start.getTime() - 60 * 60 * 1000);
    const bufferAfter = new Date(end.getTime() + 60 * 60 * 1000);

    // const overlappingSlot = await Slot.findOne({
    //   $or: [
    //     {
    //       startDate: { $lt: bufferAfter },
    //       endDate: { $gt: bufferBefore }
    //     }
    //   ]
    // });

    // if (overlappingSlot) {
    //   return res.status(400).json({
    //     message: "Slot conflicts with an existing slot or violates 1-hour gap rule."
    //   });
    // }

    const slot = await Slot.create({ slotName, startDate, endDate });
    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all slots
exports.getSlots = async (req, res) => {
  try {
    const slots = await Slot.find();
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update slot
exports.updateSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { slotName, startDate, endDate } = req.body;

    const updatedSlot = await Slot.findByIdAndUpdate(
      id,
      { slotName, startDate, endDate },
      { new: true }
    );

    if (!updatedSlot) {
      return res.status(404).json({ message: 'Slot not found' });
    } 

    res.status(200).json(updatedSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete slot
exports.deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Slot.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    res.status(200).json({ message: 'Slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};