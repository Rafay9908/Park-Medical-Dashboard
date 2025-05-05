import React, { useState, useEffect } from "react";
import axios from "axios";

import { FaTimes } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";

const Clinicians = () => {
  const [formData, setFormData] = useState({
    clinicianName: "",
    homePostcode: "",
    nearestStation: "",
    selectedClinics: [],
    selectedSlots: [],
    preferredHoursPerWeek: 0,
    minimumHoursPerWeek: 0,
    maximumHoursPerWeek: 0,
    maximumTravelTime: 0,
    shiftsPerDay: 1,
    workingDays: [],
    contactEmail: "",
    contactPhone: "",
  });

  const [selectedDays, setSelectedDays] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const allDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const [slots, setSlots] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/slots")
      .then((response) => setSlots(response.data))
      .catch((error) => console.error("Error fetching slots:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDropdownChange = (e, field) => {
    const options = Array.from(e.target.selectedOptions).map(
      (opt) => opt.value
    );
    setFormData((prev) => ({ ...prev, [field]: options }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-4xl mb-8">
        <h3 className="text-3xl font-bold self-start">👥 Clinicians Management</h3>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-3xl w-full max-w-4xl space-y-8"
        >
          <div className="flex flex-col space-y-4">
            <label className="flex items-center gap-2 text-gray-700 font-medium text-sm">
              Clinician Name
            </label>
            <input
              type="text"
              name="clinicianName"
              placeholder="Clinician Name"
              value={formData.clinicianName}
              onChange={handleChange}
              className="border p-3 rounded-lg w-full"
            />
            <label className="flex items-center gap-2 text-gray-700 font-medium text-sm">
              Home Postcode
            </label>
            <input
              type="text"
              name="homePostcode"
              placeholder="Home Postcode"
              value={formData.homePostcode}
              onChange={handleChange}
              className="border p-3 rounded-lg w-full"
            />
            <label className="flex items-center gap-2 text-gray-700 font-medium text-sm">
              Nearest Station
            </label>
            <input
              type="text"
              name="nearestStation"
              placeholder="Nearest Station"
              value={formData.nearestStation}
              onChange={handleChange}
              className="border p-3 rounded-lg w-full"
            />

            <h2 className="text-xl font-semibold mt-4">
              Preferred Clinic Locations
            </h2>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Select All Clinics
            </label>
            <select
              className="w-full border p-2 rounded"
              onChange={(e) => handleDropdownChange(e, "selectedClinics")}
            >
              <option>Option 1</option>
            </select>

            <h2 className="text-xl font-semibold mt-4">Preferred Time Slots</h2>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Select All Time Slots
            </label>
            <select
              className="w-full border p-2 rounded"
              onChange={(e) => handleDropdownChange(e, "selectedSlots")}
            >
              {slots.map((slot) => (
                <option key={slot._id} value={slot.slotName}>
                  {slot.slotName}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="">
                <label className="flex text-gray-700 font-medium text-sm">
                  Preferred Hours per Week
                </label>
                <input
                  type="number"
                  name="preferredHoursPerWeek"
                  value={formData.preferredHoursPerWeek}
                  onChange={handleChange}
                  placeholder="Preferred Hours per Week"
                  className="w-full border p-3 rounded-lg"
                />
              </div>

              <div>
                <label className="flex items-center text-gray-700 font-medium text-sm">
                  Maximum Travel Time (minutes)
                </label>
                <input
                  type="number"
                  name="maximumTravelTime"
                  value={formData.maximumTravelTime}
                  onChange={handleChange}
                  placeholder="Maximum Travel Time (minutes)"
                  className="w-full border p-3 rounded-lg"
                />
              </div>

              <div>
                <label className="flex text-gray-700 font-medium text-sm">
                  Minimum Hours per Week
                </label>
                <input
                  type="number"
                  name="minimumHoursPerWeek"
                  value={formData.minimumHoursPerWeek}
                  onChange={handleChange}
                  placeholder="Minimum Hours per Week"
                  className="w-full border p-3 rounded-lg"
                />
              </div>

              <div>
                <label className="flex text-gray-700 font-medium text-sm">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  onChange={handleChange}
                  className="w-full border p-3 rounded-lg"
                />
              </div>

              <div>
                <label className="flex text-gray-700 font-medium text-sm">
                  Maximum Hours per Week
                </label>
                <input
                  type="number"
                  name="maximumHoursPerWeek"
                  value={formData.maximumHoursPerWeek}
                  onChange={handleChange}
                  placeholder="Maximum Hours per Week"
                  className="w-full border p-3 rounded-lg"
                />
              </div>

              <div>
                <label className="flex text-gray-700 font-medium text-sm">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  name="endDate"
                  onChange={handleChange}
                  className="w-full border p-3 rounded-lg"
                />
              </div>

              <div>
                <label className="flex text-gray-700 font-medium text-sm">
                  Shifts Per Day
                </label>
                <input
                  type="number"
                  name="shiftsPerDay"
                  value={formData.shiftsPerDay}
                  onChange={handleChange}
                  placeholder="Shifts Per Day"
                  className="w-full border p-3 rounded-lg"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="flex text-gray-700 font-medium text-sm mb-2">
                Working Days
              </label>

              <div className="relative">
                {/* Custom select box */}
                <div
                  className="flex flex-wrap items-center gap-2 border p-3 rounded-lg min-h-[52px] cursor-pointer bg-white"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {selectedDays.length === 0 ? (
                    <span className="text-gray-400">Select working days</span>
                  ) : (
                    selectedDays.map((day) => (
                      <div
                        key={day}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                      >
                        {day}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDay(day);
                          }}
                          className="ml-1.5 text-blue-500 hover:text-blue-700"
                        >
                          <FaTimes className="w-3 h-3 cursor-pointer" />
                        </button>
                      </div>
                    ))
                  )}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg">
                    {allDays.map((day) => (
                      <div
                        key={day}
                        className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                          selectedDays.includes(day) ? "bg-blue-50" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDay(day);
                        }}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedDays.includes(day)}
                            readOnly
                            className="mr-2"
                          />
                          {day}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="flex text-gray-700 font-medium text-sm">
                Contact Email
              </label>
              <input
                type="text"
                name="contactEmail"
                placeholder="Contact Email"
                value={formData.contactEmail}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
              />
            </div>

            <div>
              <label className="flex text-gray-700 font-medium text-sm">
                Contact Phone
              </label>
              <input
                type="text"
                name="contactPhone"
                placeholder="Contact Phone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
              />
            </div>

            <div className="text-center mt-6">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg cursor-pointer"
              >
                Add Clinician
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default Clinicians;
