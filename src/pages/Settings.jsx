import React, { useEffect, useMemo } from "react";
import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import axios from "axios";
import { DateTime } from "luxon";

function Settings() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    slotName: "",
    startDate: "",
    endDate: "",
  });

  const [editSlotId, setEditSlotId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    slotName: "",
    startDate: "",
    endDate: "",
  });

  const [error, setError] = useState("");
  const [slots, setSlots] = useState([]);
  const [openSlotId, setOpenSlotId] = useState(null);

  // Generate time slots every 15 minutes
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatToUTC = (timeString) => {
    const baseDate = DateTime.now().setZone("Europe/London").toISODate();
    return DateTime.fromISO(`${baseDate}T${timeString}`, {
      zone: "Europe/London",
    }).toUTC().toISO();
  };

  const fetchSlots = async () => {
    try {
      const response = await axios.get(`${API_URL}/slots`);
      setSlots(response.data);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setError("Failed to fetch slots. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const newStart = formatToUTC(formData.startDate);
      const newEnd = formatToUTC(formData.endDate);

      // Only validate that end time is after start time
      if (DateTime.fromISO(newEnd) <= DateTime.fromISO(newStart)) {
        setError("End time must be after start time");
        return;
      }

      await axios.post(`${API_URL}/slots`, {
        slotName: formData.slotName,
        startDate: newStart,
        endDate: newEnd,
      });

      await fetchSlots();
      setFormData({ slotName: "", startDate: "", endDate: "" });
    } catch (error) {
      console.error("Failed to add slot:", error);
      const errorMessage = error.response?.data?.message || "Failed to add slot. Please try again.";
      setError(errorMessage);
    }
  };

  const toggleSlot = (id) => {
    setOpenSlotId(prev => prev === id ? null : id);
  };

  const handleUpdate = (id) => {
    const slotToEdit = slots.find((slot) => slot._id === id);
    if (slotToEdit) {
      setEditSlotId(id);
      setEditFormData({
        slotName: slotToEdit.slotName,
        startDate: formatTime(slotToEdit.startDate, "HH:mm"),
        endDate: formatTime(slotToEdit.endDate, "HH:mm"),
      });
    }
  };

  const handleSaveUpdate = async (id) => {
    setError("");

    try {
      const updatedStart = formatToUTC(editFormData.startDate);
      const updatedEnd = formatToUTC(editFormData.endDate);

      // Only validate that end time is after start time
      if (DateTime.fromISO(updatedEnd) <= DateTime.fromISO(updatedStart)) {
        setError("End time must be after start time");
        return;
      }

      await axios.put(`${API_URL}/slots/${id}`, {
        slotName: editFormData.slotName,
        startDate: updatedStart,
        endDate: updatedEnd,
      });

      await fetchSlots();
      setEditSlotId(null);
    } catch (error) {
      console.error("Failed to update slot:", error);
      const errorMessage = error.response?.data?.message || "Failed to update slot. Please try again.";
      setError(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;

    try {
      await axios.delete(`${API_URL}/slots/${id}`);
      await fetchSlots();
    } catch (error) {
      console.error("Failed to delete slot:", error);
      setError("Failed to delete slot. Please try again.");
    }
  };

  const formatTime = (isoString, format = "HH:mm") => {
    return DateTime.fromISO(isoString).setZone("Europe/London").toFormat(format);
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <div className="w-full max-w-4xl mb-8">
        <h3 className="text-3xl font-bold self-start mb-4">Settings</h3>
        <h5 className="text-xl font-bold">Shift Slots Management</h5>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-medium mb-4 max-w-4xl w-full text-center">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl w-full max-w-4xl space-y-4"
      >
        <p className="text-2xl font-bold">Add New Shift Slot</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1 col-span-2">
            <label className="flex items-center gap-2 text-gray-700 font-medium text-sm">
              Shift Name (e.g., Morning Shift)
            </label>
            <input
              type="text"
              name="slotName"
              value={formData.slotName}
              onChange={handleChange}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div className="flex flex-col space-y-4 col-span-2">
            <label>Start Time</label>
            <select
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select start time</option>
              {timeSlots.map((time, index) => (
                <option key={index} value={time}>
                  {time}
                </option>
              ))}
            </select>

            <label>End Time</label>
            <select
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select end time</option>
              {timeSlots.map((time, index) => (
                <option key={index} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-left">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 cursor-pointer"
          >
            Add Slot
          </button>
        </div>
      </form>

      <div className="w-full max-w-4xl space-y-4 mt-10">
        <h3 className="text-2xl font-bold">View and Edit Shift Slots</h3>
        {slots.map((slot) => (
          <div
            key={slot._id}
            className="bg-white rounded-3xl overflow-hidden transition-all duration-300"
          >
            <div
              onClick={() => toggleSlot(slot._id)}
              className="flex items-center justify-between cursor-pointer px-6 py-4 bg-white"
            >
              <p className="font-semibold text-lg">{slot.slotName}</p>
              {openSlotId === slot._id ? (
                <FiChevronUp className="w-5 h-5" />
              ) : (
                <FiChevronDown className="w-5 h-5" />
              )}
            </div>

            {openSlotId === slot._id && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col space-y-1 col-span-2">
                    <label className="text-gray-700 text-sm font-medium">
                      Shift Name
                    </label>
                    {editSlotId === slot._id ? (
                      <input
                        type="text"
                        name="slotName"
                        value={editFormData.slotName}
                        onChange={handleEditChange}
                        className="border p-3 rounded-lg"
                        required
                      />
                    ) : (
                      <input
                        type="text"
                        value={slot.slotName}
                        disabled
                        className="border p-3 rounded-lg bg-gray-100"
                      />
                    )}
                  </div>

                  <div className="flex flex-col space-y-1 col-span-2">
                    <label>Start Time</label>
                    {editSlotId === slot._id ? (
                      <select
                        name="startDate"
                        value={editFormData.startDate}
                        onChange={handleEditChange}
                        className="border p-3 rounded-lg"
                        required
                      >
                        {timeSlots.map((time, index) => (
                          <option key={index} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="p-3 bg-gray-100 rounded-lg border">
                        {formatTime(slot.startDate)}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-1 col-span-2">
                    <label>End Time</label>
                    {editSlotId === slot._id ? (
                      <select
                        name="endDate"
                        value={editFormData.endDate}
                        onChange={handleEditChange}
                        className="border p-3 rounded-lg"
                        required
                      >
                        {timeSlots.map((time, index) => (
                          <option key={index} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="p-3 bg-gray-100 rounded-lg border">
                        {formatTime(slot.endDate)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-x-4">
                  {editSlotId === slot._id ? (
                    <>
                      <button
                        onClick={() => handleSaveUpdate(slot._id)}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-full cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditSlotId(null)}
                        className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-6 rounded-full cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleUpdate(slot._id)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-6 rounded-full cursor-pointer"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(slot._id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-full cursor-pointer"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Settings;