import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes, FaChevronDown, FaEdit, FaTrash } from "react-icons/fa";

const Clinicians = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const [formData, setFormData] = useState({
    clinicianName: "",
    preferredClinic: "",
    preferredTimeSlot: "",
    minHoursPerWeek: 0,
    maxHoursPerWeek: 0,
    shiftsPerDay: 0,
    workingDay: [],
    homePostcode: "",
    nearestStation: "",
    maxTravelTime: 0,
    startDate: "",
    endDate: "",
    contactEmail: "",
    contactPhone: ""
  });

  const [selectedDays, setSelectedDays] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [clinicians, setClinicians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const allDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Fetch clinicians data
  useEffect(() => {
    const fetchClinicians = async () => {
      try {
        const response = await axios.get(`${API_URL}/clinicians`);
        setClinicians(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching clinicians:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchClinicians();
  }, []);

  // Fetch clinics data
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await axios.get(`${API_URL}/clinics`);
        setClinics(response.data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching clinics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/clinicians/${id}`);
      setClinicians(clinicians.filter((clinician) => clinician._id !== id));
      alert("Clinician deleted successfully!");
    } catch (error) {
      console.error("Error deleting clinician:", error);
      alert("Failed to delete clinician. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleDay = (day) => {
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    
    setSelectedDays(newSelectedDays);
    setFormData((prev) => ({ ...prev, workingDay: newSelectedDays }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    
    try {
      // Validate required fields
      if (!formData.clinicianName) {
        throw new Error("Clinician name is required");
      }
      if (!formData.preferredClinic) {
        throw new Error("Preferred clinic is required");
      }
      if (selectedDays.length === 0) {
        throw new Error("At least one working day must be selected");
      }

      // Prepare the data to send
      const dataToSend = {
        ...formData,
        minHoursPerWeek: Number(formData.minHoursPerWeek),
        maxHoursPerWeek: Number(formData.maxHoursPerWeek),
        maxTravelTime: Number(formData.maxTravelTime),
        shiftsPerDay: Number(formData.shiftsPerDay),
        workingDay: selectedDays,
      };
      
      const response = await axios.post(`${API_URL}/clinicians`, dataToSend, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Add the new clinician to the list
      setClinicians([...clinicians, response.data]);
      
      // Reset the form
      setFormData({
        clinicianName: "",
        preferredClinic: "",
        preferredTimeSlot: "Afternoon Shift",
        minHoursPerWeek: 3,
        maxHoursPerWeek: 10,
        shiftsPerDay: 10,
        workingDay: [],
        homePostcode: "74000",
        nearestStation: "Bexley Road",
        maxTravelTime: 3,
        startDate: "",
        endDate: "",
        contactEmail: "sample@gmail.com",
        contactPhone: "0300 0000000"
      });
      setSelectedDays([]);

      alert("Clinician added successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         "Failed to add clinician. Please try again.";
      setSubmitError(errorMessage);
      alert(`Error: ${errorMessage}`);
    }
  };

  if (loading) return <div className="p-2 text-gray-500">Loading clinics...</div>;
  if (error) return <div className="p-2 text-red-500">Error loading data: {error}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-4xl mb-8">
        <h3 className="text-3xl font-bold self-start">
          👥 Clinicians Management
        </h3>
      </div>
      
      {submitError && (
        <div className="w-full max-w-4xl mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {submitError}
        </div>
      )}

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
            required
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
            Preferred Clinic Location
          </h2>
          <select
            name="preferredClinic"
            value={formData.preferredClinic}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            required
          >
            <option value="">Select a clinic</option>
            {clinics.map((clinic) => (
              <option key={clinic._id} value={clinic._id}>
                {clinic.clinicName}
              </option>
            ))}
          </select>

          <h2 className="text-xl font-semibold mt-4">Preferred Time Slot</h2>
          <select
            name="preferredTimeSlot"
            value={formData.preferredTimeSlot}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          >
            <option value="Morning Shift">Morning Shift</option>
            <option value="Afternoon Shift">Afternoon Shift</option>
            <option value="Evening Shift">Evening Shift</option>
            <option value="Night Shift">Night Shift</option>
          </select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex text-gray-700 font-medium text-sm">
                Minimum Hours per Week
              </label>
              <input
                type="number"
                name="minHoursPerWeek"
                value={formData.minHoursPerWeek}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
                min="0"
              />
            </div>

            <div>
              <label className="flex items-center text-gray-700 font-medium text-sm">
                Maximum Travel Time (minutes)
              </label>
              <input
                type="number"
                name="maxTravelTime"
                value={formData.maxTravelTime}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
                min="0"
              />
            </div>

            <div>
              <label className="flex text-gray-700 font-medium text-sm">
                Maximum Hours per Week
              </label>
              <input
                type="number"
                name="maxHoursPerWeek"
                value={formData.maxHoursPerWeek}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
                min="0"
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
                className="w-full border p-3 rounded-lg"
                min="1"
              />
            </div>

            <div>
              <label className="flex text-gray-700 font-medium text-sm">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
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
                value={formData.endDate}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="flex text-gray-700 font-medium text-sm mb-2">
              Working Days
            </label>

            <div className="relative">
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
              type="email"
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
              type="tel"
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full cursor-pointer"
            >
              Add Clinician
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white p-8 rounded-3xl w-full max-w-4xl mt-8">
        <h3 className="text-2xl font-bold mb-6">Existing Clinicians</h3>

        {isLoading ? (
          <p>Loading clinicians...</p>
        ) : clinicians.length === 0 ? (
          <p>No clinicians found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nearest Station
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preferred Clinic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Working Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clinicians.map((clinician) => (
                  <tr key={clinician._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {clinician.clinicianName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {clinician.nearestStation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {clinics.find(c => c._id === clinician.preferredClinic)?.clinicName || clinician.preferredClinic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {clinician.workingDay?.join(", ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        onClick={() => {
                          setFormData({
                            ...clinician,
                            _id: clinician._id,
                          });
                          setSelectedDays(clinician.workingDay || []);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(clinician._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clinicians;