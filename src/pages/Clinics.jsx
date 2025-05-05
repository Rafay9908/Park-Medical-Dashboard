import { useState, useEffect } from "react";
import {
  FaClinicMedical,
  FaMapMarkerAlt,
  FaUserMd,
  FaTrain,
  FaBus,
  FaWifi,
  FaWheelchair,
  FaWalking,
  FaInfoCircle,
  FaBullseye,
  FaCalendarAlt,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function Clinics() {
  const [formData, setFormData] = useState({
    clinicName: "",
    address: "",
    ownerName: "",
    localStation: "",
    nearestBus: "",
    wifiDetails: "",
    checkInInstructions: "",
    tflZone: "1",
    minSessionPerWeek: 1,
    walkingMinutesToStations: 5,
    wheelchairAccessible: false,
  });

  const [clinicHours, setClinicHours] = useState(
    daysOfWeek.map((day) => ({
      day,
      startTime: "08:00",
      endTime: "20:00",
      isOpen: true,
    }))
  );

  const [expandedCard, setExpandedCard] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Fetch all clinics on component mount
  useEffect(() => {
    fetchClinics();
  }, []);

  // Fetch all clinics
  const fetchClinics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/clinics');
      if (!response.ok) {
        throw new Error('Failed to fetch clinics');
      }
      const data = await response.json();
      setClinics(data);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      alert('Failed to fetch clinics. Please try again.');
    }
  };

  // Add or update clinic
  const saveClinic = async (clinicData, id = null) => {
    try {
      const url = id 
        ? `http://localhost:5000/api/clinics/${id}`
        : 'http://localhost:5000/api/clinics';
      
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clinicData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save clinic');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving clinic:', error);
      throw error;
    }
  };

  // Delete clinic
  const deleteClinic = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/clinics/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete clinic');
      }
    } catch (error) {
      console.error('Error deleting clinic:', error);
      throw error;
    }
  };

  // Load clinic data for editing
  const loadClinicForEdit = (clinic) => {
    setEditingId(clinic._id);
    setFormData({
      clinicName: clinic.clinicName,
      address: clinic.address,
      ownerName: clinic.ownerName,
      localStation: clinic.localStation,
      nearestBus: clinic.nearestBus,
      wifiDetails: clinic.wifiDetails,
      checkInInstructions: clinic.checkInInstructions,
      tflZone: clinic.tflZone,
      minSessionPerWeek: clinic.minSessionPerWeek,
      walkingMinutesToStations: clinic.walkingMinutesToStations,
      wheelchairAccessible: clinic.wheelchairAccessible,
    });

    // Set operating hours if they exist
    if (clinic.operatingHours) {
      const updatedHours = daysOfWeek.map(day => {
        const hourData = clinic.operatingHours.find(h => h.day === day);
        return hourData 
          ? { 
              day, 
              startTime: hourData.openingTime || "08:00",
              endTime: hourData.closingTime || "20:00",
              isOpen: hourData.open 
            }
          : { 
              day, 
              startTime: "08:00", 
              endTime: "20:00", 
              isOpen: false 
            };
      });
      setClinicHours(updatedHours);
    }
  };

  const handleTimeChange = (index, field, value) => {
    const updatedHours = [...clinicHours];
    updatedHours[index][field] = value;
    setClinicHours(updatedHours);
  };

  const toggleOpen = (index) => {
    const updatedHours = [...clinicHours];
    updatedHours[index].isOpen = !updatedHours[index].isOpen;
    setClinicHours(updatedHours);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleIncrement = (field) => {
    setFormData((prev) => ({ ...prev, [field]: prev[field] + 1 }));
  };

  const handleDecrement = (field) => {
    setFormData((prev) => ({ ...prev, [field]: Math.max(0, prev[field] - 1) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.clinicName.trim()) {
      alert('Clinic name is required');
      return;
    }
    if (!formData.address.trim()) {
      alert('Address is required');
      return;
    }

    setIsSubmitting(true);
    
    const clinicData = {
      ...formData,
      operatingHours: clinicHours.map(hour => ({
        day: hour.day,
        open: hour.isOpen,
        openingTime: hour.startTime,
        closingTime: hour.endTime
      }))
    };

    try {
      const result = await saveClinic(clinicData, editingId);
      console.log('Success:', result);
      alert(`Clinic ${editingId ? 'updated' : 'added'} successfully!`);
      resetForm();
      fetchClinics();
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      clinicName: "",
      address: "",
      ownerName: "",
      localStation: "",
      nearestBus: "",
      wifiDetails: "",
      checkInInstructions: "",
      tflZone: "1",
      minSessionPerWeek: 1,
      walkingMinutesToStations: 5,
      wheelchairAccessible: false,
    });
    
    setClinicHours(
      daysOfWeek.map((day) => ({
        day,
        startTime: "08:00",
        endTime: "20:00",
        isOpen: true,
      }))
    );
    
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this clinic?')) {
      try {
        await deleteClinic(id);
        alert('Clinic deleted successfully');
        fetchClinics();
      } catch (error) {
        alert('Failed to delete clinic');
      }
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      const hr = hour.toString().padStart(2, "0");
      options.push(
        <option key={`${hr}:00`} value={`${hr}:00`}>{`${hr}:00`}</option>
      );
    }
    return options;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-4xl mb-8">
        <h3 className="text-3xl font-bold self-start">🏥 Clinics Management</h3>
        </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl w-full max-w-4xl space-y-8 mb-8"
      >
        <h2 className="text-2xl font-semibold">
          {editingId ? 'Edit Clinic' : 'Add New Clinic'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Clinic Name */}
          <div className="flex flex-col space-y-1">
            <label className="flex items-center gap-2 text-gray-700 font-medium text-sm">
              <FaClinicMedical /> Clinic Name
            </label>
            <input
              type="text"
              name="clinicName"
              value={formData.clinicName}
              onChange={handleChange}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Minimum Sessions */}
          <div className="flex flex-col space-y-1">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <FaCalendarAlt /> Minimum Sessions per Week
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleDecrement("minSessionPerWeek")}
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                disabled={formData.minSessionPerWeek <= 0}
              >
                -
              </button>
              <input
                type="number"
                name="minSessionPerWeek"
                value={formData.minSessionPerWeek}
                readOnly
                className="w-16 text-center border rounded-lg py-2"
              />
              <button
                type="button"
                onClick={() => handleIncrement("minSessionPerWeek")}
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              >
                +
              </button>
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col space-y-1 md:col-span-2">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <FaMapMarkerAlt /> Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="4"
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Owner Name */}
          <div className="flex flex-col space-y-1">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <FaUserMd /> Owner Name
            </label>
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Check-In Instructions */}
          <div className="flex flex-col space-y-1">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <FaInfoCircle /> Check-In Instructions
            </label>
            <textarea
              name="checkInInstructions"
              value={formData.checkInInstructions}
              onChange={handleChange}
              rows="4"
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Local Station */}
          <div className="flex flex-col space-y-1">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <FaTrain /> Local Station
            </label>
            <input
              type="text"
              name="localStation"
              value={formData.localStation}
              onChange={handleChange}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Wheelchair Accessible */}
          <div className="flex items-center mt-6 gap-2">
            <input
              type="checkbox"
              name="wheelchairAccessible"
              checked={formData.wheelchairAccessible}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600"
            />
            <span className="flex items-center gap-2 text-gray-700 font-medium">
              <FaWheelchair /> Wheelchair Accessible
            </span>
          </div>

          {/* Nearest Bus */}
          <div className="flex flex-col space-y-1">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <FaBus /> Nearest Bus
            </label>
            <input
              type="text"
              name="nearestBus"
              value={formData.nearestBus}
              onChange={handleChange}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* WiFi Details */}
          <div className="flex flex-col space-y-1">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <FaWifi /> WiFi Details
            </label>
            <input
              type="text"
              name="wifiDetails"
              value={formData.wifiDetails}
              onChange={handleChange}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* TFL Zone */}
          <div className="flex flex-col space-y-1">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <FaBullseye /> TFL Zone
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleDecrement("tflZone")}
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                disabled={formData.tflZone <= 1}
              >
                -
              </button>
              <input
                type="text"
                name="tflZone"
                value={formData.tflZone}
                onChange={handleChange}
                className="w-16 text-center border rounded-lg py-2"
              />
              <button
                type="button"
                onClick={() => handleIncrement("tflZone")}
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                disabled={formData.tflZone >= 9}
              >
                +
              </button>
            </div>
          </div>

          {/* Walking Minutes to Station */}
          <div className="flex flex-col space-y-1">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <FaWalking /> Walking Minutes to Station
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleDecrement("walkingMinutesToStations")}
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                disabled={formData.walkingMinutesToStations <= 0}
              >
                -
              </button>
              <input
                type="number"
                name="walkingMinutesToStations"
                value={formData.walkingMinutesToStations}
                readOnly
                className="w-16 text-center border rounded-lg py-2"
              />
              <button
                type="button"
                onClick={() => handleIncrement("walkingMinutesToStations")}
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              >
                +
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-semibold flex items-center gap-2 col-span-2">
            <span className="text-red-500">⏰</span> Preferred Operating Hours
          </h2>

          {clinicHours.map((clinic, index) => (
            <div
              key={clinic.day}
              className="flex justify-around items-center gap-4 mb-6 col-span-2"
            >
              <div className="w-24 font-semibold text-gray-800">
                {clinic.day}
              </div>

              <select
                className="border border-gray-300 rounded-md p-2"
                value={clinic.startTime}
                onChange={(e) =>
                  handleTimeChange(index, "startTime", e.target.value)
                }
                disabled={!clinic.isOpen}
              >
                {generateTimeOptions()}
              </select>

              <select
                className="border border-gray-300 rounded-md p-2"
                value={clinic.endTime}
                onChange={(e) =>
                  handleTimeChange(index, "endTime", e.target.value)
                }
                disabled={!clinic.isOpen}
              >
                {generateTimeOptions()}
              </select>

              <label className="flex items-center gap-2 ml-2">
                <input
                  type="checkbox"
                  checked={clinic.isOpen}
                  onChange={() => toggleOpen(index)}
                  className="accent-blue-600 w-5 h-5"
                />
                <span>Open</span>
              </label>
            </div>
          ))}
        </div>

        {/* Submit and Cancel Buttons */}
        <div className="flex justify-center gap-4">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? 'Saving...' 
              : editingId 
                ? 'Update Clinic' 
                : 'Add Clinic'}
          </button>
        </div>
      </form>

      <div className="rounded-3xl w-full max-w-4xl space-y-2 mt-8">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-[#262730]">Existing Clinics</h4>
            <h3 className="text-[#262730] text-[28px]">🟢 Active Clinics</h3>
          </div>
          <button 
            onClick={fetchClinics}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Refresh Clinics
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-4 mt-8">
          {clinics.map((clinic) => (
            <div
              key={clinic._id}
              className="bg-white rounded-xl p-4 transition-all duration-300"
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() =>
                  setExpandedCard((prev) =>
                    prev === clinic._id ? null : clinic._id
                  )
                }
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {clinic.clinicName}
                  </h3>
                  <p className="text-gray-600">{clinic.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      loadClinicForEdit(clinic);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(clinic._id);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash size={18} />
                  </button>
                  <span className="text-blue-600 font-semibold">
                    {expandedCard === clinic._id ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    )}
                  </span>
                </div>
              </div>

              {expandedCard === clinic._id && (
                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <p>
                    <strong>Owner:</strong> {clinic.ownerName}
                  </p>
                  <p>
                    <strong>Transport:</strong> {clinic.localStation}, {clinic.nearestBus}, Zone {clinic.tflZone}
                  </p>
                  <p>
                    <strong>Accessibility:</strong>{" "}
                    {clinic.wheelchairAccessible ? "Wheelchair accessible" : "Not wheelchair accessible"},{" "}
                    {clinic.walkingMinutesToStations} min walk
                  </p>
                  <p>
                    <strong>WiFi:</strong> {clinic.wifiDetails || "Not specified"}
                  </p>
                  <p>
                    <strong>Minimum Sessions:</strong> {clinic.minSessionPerWeek}
                  </p>
                  <p>
                    <strong>Check-In Instructions:</strong>{" "}
                    {clinic.checkInInstructions || "None"}
                  </p>

                  <div className="mt-4">
                    <h4 className="text-lg font-semibold mt-4 mb-4 text-gray-800">
                      Operating Hours
                    </h4>
                    <div className="space-y-4 mb-4">
                      {daysOfWeek.map((day) => {
                        const hour = clinic.operatingHours?.find(h => h.day === day) || {
                          day,
                          open: false,
                          openingTime: null,
                          closingTime: null
                        };
                        
                        return (
                          <div
                            key={day}
                            className="grid grid-cols-12 items-center gap-x-4"
                          >
                            <div className="col-span-3 font-medium text-gray-700 flex justify-center items-center">
                              {day}
                            </div>

                            <div className="col-span-3 p-2 bg-gray-100 rounded text-center">
                              {hour.open && hour.openingTime ? hour.openingTime : "--"}
                            </div>

                            <div className="col-span-3 p-2 bg-gray-100 rounded text-center">
                              {hour.open && hour.closingTime ? hour.closingTime : "--"}
                            </div>

                            <div className="col-span-3 flex justify-center items-center gap-2">
                              <div
                                className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                                  hour.open
                                    ? "bg-blue-600 border-blue-600"
                                    : "bg-gray-200 border-gray-400"
                                }`}
                              >
                                {hour.open && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span className="text-sm text-gray-600">
                                {hour.open ? "Open" : "Closed"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}