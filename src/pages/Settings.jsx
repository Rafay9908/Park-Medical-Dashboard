import React, { useEffect } from "react";
import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import axios from "axios";

function Settings() {
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

  const [slots, setSlots] = useState([{}]);

  const [openSlotId, setOpenSlotId] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const baseDate = new Date().toISOString().split("T")[0];

    const newStart = new Date(`${baseDate}T${formData.startDate}:00`);
    const newEnd = new Date(`${baseDate}T${formData.endDate}:00`);

    // Check for time conflicts
    const hasConflict = slots.some((slot) => {
      const existingStart = new Date(`${baseDate}T${slot.startDate}:00`);
      const existingEnd = new Date(`${baseDate}T${slot.endDate}:00`);

      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });

    if (hasConflict) {
      setError("Time slot overlaps with an existing shift.");
      return;
    }

    const payload = {
      slotName: formData.slotName,
      startDate: newStart.toISOString(),
      endDate: newEnd.toISOString(),
    };

    try {
      // Post the new slot
      await axios.post("http://localhost:5000/api/slots", payload);

      // Re-fetch the slots to update the UI
      const response = await axios.get("http://localhost:5000/api/slots");
      setSlots(response.data);

      // Clear form
      setFormData({
        slotName: "",
        startDate: "",
        endDate: "",
      });
    } catch (error) {
      console.error("Failed to add slot:", error);
      setError("Failed to add slot. Please try again.");
    }
  };

  const timeSlots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = String(h).padStart(2, "0");
      const minute = String(m).padStart(2, "0");
      timeSlots.push(`${hour}:${minute}`);
    }
  }

  const toggleSlot = (id) => {
    setOpenSlotId(openSlotId === id ? null : id);
  };

  const handleUpdate = (id) => {
    const slotToEdit = slots.find((slot) => slot._id === id);
    if (slotToEdit) {
      setEditSlotId(id);
      setEditFormData({
        slotName: slotToEdit.slotName,
        startDate: slotToEdit.startDate,
        endDate: slotToEdit.endDate,
      });
    }
  };

  const handleSaveUpdate = async (id) => {
    try {
      const payload = {
        slotName: editFormData.slotName,
        startDate: new Date(`${new Date().toISOString().split("T")[0]}T${editFormData.startDate}:00`).toISOString(),
        endDate: new Date(`${new Date().toISOString().split("T")[0]}T${editFormData.endDate}:00`).toISOString(),
      };
  
      await axios.put(`http://localhost:5000/api/slots/${id}`, payload);
  
      // Refresh list
      const response = await axios.get("http://localhost:5000/api/slots");
      setSlots(response.data);
  
      setEditSlotId(null);
    } catch (error) {
      console.error("Failed to update slot:", error);
      setError("Failed to update slot. Please try again.");
    }
  };
  
  

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this slot?");
    if (!confirmed) return;
  
    try {
      await axios.delete(`http://localhost:5000/api/slots/${id}`);
      const response = await axios.get("http://localhost:5000/api/slots");
      setSlots(response.data);
    } catch (error) {
      console.error("Failed to delete slot:", error);
      setError("Failed to delete slot. Please try again.");
    }
  };
  

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/slots");
        setSlots(response.data);
      } catch (err) {
        console.error("Error fetching slots:", err);
      }
    };

    fetchSlots();
  }, []);

  return (
    <>
      <div className="min-h-screen flex flex-col items-center  bg-gray-100 p-6">
        <div className="pt-5 pb-5">
          <h3 className="text-[#1E2939] text-5xl font-bold leading-[53px]">
            Settings
          </h3>
        </div>
        <div className="text-[#1E2939] text-2xl font-bold leading-[53px] pb-10">
          <h4>Shift Slots Management</h4>
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
          <p className="text-lg font-bold text">Add New Shift Slot</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Clinic Name */}
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
              />
            </div>
            <div className="flex flex-col space-y-4 col-span-2">
              <label htmlFor="">Start Time</label>
              <select
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {timeSlots.map((time, index) => (
                  <option key={index} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              <select
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 cursor-pointer"
            >
              Add Slot
            </button>
          </div>
        </form>

        <div className="w-full max-w-4xl space-y-4 mt-10">
          {slots.map((slot) => (
            <div
              key={slot._id}
              className="bg-white rounded-3xl overflow-hidden transition-all duration-300"
            >
              {/* Header */}
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

              {/* Body */}
              {openSlotId === slot._id && (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col space-y-1 col-span-2">
                      <label className="text-gray-700 text-sm font-medium">
                        Shift Name
                      </label>
                      <input
                        type="text"
                        value={slot.slotName}
                        disabled
                        className="border p-3 rounded-lg bg-gray-100"
                      />
                    </div>
                    <div className="flex flex-col space-y-1 col-span-2">
                      <label>Start Time</label>
                      <select
                        disabled
                        className="border p-3 rounded-lg bg-gray-100"
                      >
                        <option>{slot.startDate}</option>
                      </select>
                    </div>
                    <div className="flex flex-col space-y-1 col-span-2">
                      <label>End Time</label>
                      <select
                        disabled
                        className="border p-3 rounded-lg bg-gray-100"
                      >
                        <option>{slot.endDate}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-x-4">
                    <button
                      onClick={() => handleUpdate(slot._id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-6 rounded-full"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(slot._id)}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-full"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Settings;
