import React from "react";
import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

function Settings() {
  const [formData, setFormData] = useState({
    clinicName: "",
  });
  const [slots, setSlots] = useState([
    { id: 1, clinicName: "Morning Shift", startTime: "09:00", endTime: "12:00" },
    { id: 2, clinicName: "Evening Shift", startTime: "15:00", endTime: "18:00" },
  ]);
  const [openSlotId, setOpenSlotId] = useState(null);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  }

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
    alert(`Update slot ${id}`);
  };

  const handleDelete = (id) => {
    alert(`Delete slot ${id}`);
  };


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

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-3xl w-full max-w-4xl space-y-8"
        >
          <p className="">Add New Shift Slot</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Clinic Name */}
            <div className="flex flex-col space-y-1 col-span-2">
              <label className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                Shift Name (e.g., Morning Shift)
              </label>
              <input
                type="text"
                name="clinicName"
                value={formData.clinicName}
                onChange={handleChange}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col space-y-1 col-span-2">
              <label htmlFor="">Start Time</label>
            <select className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
              {timeSlots.map((time, index) => (
                <option key={index} value={time}>
                  {time}
                </option>
              ))}
            </select>
            </div>

            <div className="flex flex-col space-y-1 col-span-2">
              <label htmlFor="">End Time</label>
            <select className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
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
      key={slot.id}
      className="bg-white rounded-3xl overflow-hidden transition-all duration-300"
    >
      {/* Header */}
      <div
        onClick={() => toggleSlot(slot.id)}
        className="flex items-center justify-between cursor-pointer px-6 py-4 bg-white"
      >
        <p className="font-semibold text-lg">{slot.clinicName}</p>
        {openSlotId === slot.id ? (
          <FiChevronUp className="w-5 h-5" />
        ) : (
          <FiChevronDown className="w-5 h-5" />
        )}
      </div>

      {/* Body */}
      {openSlotId === slot.id && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col space-y-1 col-span-2">
              <label className="text-gray-700 text-sm font-medium">
                Shift Name
              </label>
              <input
                type="text"
                value={slot.clinicName}
                disabled
                className="border p-3 rounded-lg bg-gray-100"
              />
            </div>
            <div className="flex flex-col space-y-1 col-span-2">
              <label>Start Time</label>
              <select disabled className="border p-3 rounded-lg bg-gray-100">
                <option>{slot.startTime}</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1 col-span-2">
              <label>End Time</label>
              <select disabled className="border p-3 rounded-lg bg-gray-100">
                <option>{slot.endTime}</option>
              </select>
            </div>
          </div>

          <div className="space-x-4">
            <button
              onClick={() => handleUpdate(slot.id)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-6 rounded-full"
            >
              Update
            </button>
            <button
              onClick={() => handleDelete(slot.id)}
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
