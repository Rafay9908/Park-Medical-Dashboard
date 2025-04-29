import { useState } from "react";
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
} from "react-icons/fa";

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
    tflZone: 1,
    minimumSessions: 1,
    walkingMinutes: 5,
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

  const addClinic = () => {
    alert("Add Clinic clicked!");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        <div className="pt-5 pb-20">
          <h3 className="text-[#262730] text-5xl font-bold leading-[53px]">
            Clinics Management
          </h3>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-4xl space-y-8"
        >
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
                  onClick={() => handleDecrement("minimumSessions")}
                  className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                >
                  -
                </button>
                <input
                  type="number"
                  value={formData.minimumSessions}
                  readOnly
                  className="w-16 text-center border rounded-lg py-2"
                />
                <button
                  type="button"
                  onClick={() => handleIncrement("minimumSessions")}
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
                clssName="h-5 w-5 text-blue-600"
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
                >
                  -
                </button>
                <input
                  type="number"
                  value={formData.tflZone}
                  readOnly
                  className="w-16 text-center border rounded-lg py-2"
                />
                <button
                  type="button"
                  onClick={() => handleIncrement("tflZone")}
                  className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Walking Minutes */}
            <div className="flex flex-col space-y-1">
              <label className="flex items-center gap-2 text-gray-700 font-medium">
                <FaWalking /> Walking Minutes to Station
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleDecrement("walkingMinutes")}
                  className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                >
                  -
                </button>
                <input
                  type="number"
                  value={formData.walkingMinutes}
                  readOnly
                  className="w-16 text-center border rounded-lg py-2"
                />
                <button
                  type="button"
                  onClick={() => handleIncrement("walkingMinutes")}
                  className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <span className="text-red-500">⏰</span> Preferred Operating Hours
            </h2>

            <div className="mb-6 col-span-2">
              <label className="block mb-2 font-medium text-gray-700">
                Select one or more time slots
              </label>
              <select
                className="w-full border border-gray-300 rounded-md p-2"
                disabled
              >
                <option>Choose an option</option>
              </select>
            </div>

            {clinicHours.map((clinic, index) => (
            <div key={clinic.day} className="flex justify-around items-center gap-4 mb-6 col-span-2">
              <div className="w-24 font-semibold text-gray-800">
                {clinic.day}
              </div>

              <select
                className="border border-gray-300 rounded-md p-2"
                value={clinic.startTime}
                onChange={(e) =>
                  handleTimeChange(index, "startTime", e.target.value)
                }
              >
                {generateTimeOptions()}
              </select>

              <select
                className="border border-gray-300 rounded-md p-2"
                value={clinic.endTime}
                onChange={(e) =>
                  handleTimeChange(index, "endTime", e.target.value)
                }
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

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 cursor-pointer"
            >
              Add Clinic
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

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
