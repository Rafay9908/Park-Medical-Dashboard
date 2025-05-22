import { useState, useMemo, useCallback } from "react";
import { useClinics } from "../context/ClinicsContext";
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
  FaChevronDown,
  FaTimes,
} from "react-icons/fa";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { DateTime } from "luxon";

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
  const {
    clinics,
    listOfSlots,
    isLoading,
    error,
    formData,
    editingId,
    setFormData,
    fetchClinics,
    saveClinic,
    deleteClinic,
    loadClinicForEdit,
    resetForm,
    selectedSlots,
    setSelectedSlots,
    toggleOperatingHour,
  } = useClinics();

  const [expandedCard, setExpandedCard] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const hr = hour.toString().padStart(2, "0");
        const min = minute.toString().padStart(2, "0");
        options.push(
          <option
            key={`${hr}:${min}`}
            value={`${hr}:${min}`}
          >{`${hr}:${min}`}</option>
        );
      }
    }
    return options;
  }, []);

  const handleSlotToggle = useCallback(
    (slot, e) => {
      e.stopPropagation();
      setSelectedSlots((prev) => {
        const exists = prev.some((s) => s._id === slot._id);
        return exists
          ? prev.filter((s) => s._id !== slot._id)
          : [...prev, { _id: slot._id, slotName: slot.slotName }];
      });
    },
    [setSelectedSlots]
  );

  const handleRemoveSlot = useCallback(
    (_id, e) => {
      e.stopPropagation();
      setSelectedSlots((prev) => prev.filter((s) => s._id !== _id));
    },
    [setSelectedSlots]
  );

  const isSlotSelected = useCallback(
    (_id) => selectedSlots.some((s) => s._id === _id),
    [selectedSlots]
  );

  const handleTimeChange = useCallback(
    (index, field, value) => {
      setFormData((prev) => {
        const updatedHours = [...prev.operatingHours];
        updatedHours[index][field] = value;
        return {
          ...prev,
          operatingHours: updatedHours,
        };
      });
    },
    [setFormData]
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    [setFormData]
  );

  const handleIncrement = useCallback(
    (field) => {
      setFormData((prev) => ({ ...prev, [field]: Number(prev[field]) + 1 }));
    },
    [setFormData]
  );

  const handleDecrement = useCallback(
    (field) => {
      setFormData((prev) => ({
        ...prev,
        [field]: Math.max(0, Number(prev[field]) - 1),
      }));
    },
    [setFormData]
  );

  const formatTime = useCallback(
    (isoString, format = "HH:mm") => {
      return DateTime.fromISO(isoString, { zone: "utc" })
        .setZone("Europe/London")
        .toFormat(format);
    },
    []
  );

  const formatTimeDisplay = useCallback((timeString) => {
    if (!timeString) return "--";
    return timeString.replace(/^(\d{2}):(\d{2})$/, (match, hh, mm) => {
      const hour = parseInt(hh, 10);
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${mm} ${period}`;
    });
  }, []);

  const setAllHours = useCallback(
    (open) => {
      setFormData((prev) => ({
        ...prev,
        operatingHours: prev.operatingHours.map((hour) => ({
          ...hour,
          open: open,
        })),
      }));
    },
    [setFormData]
  );

  const setStandardHours = useCallback(
    (start, end) => {
      setFormData((prev) => ({
        ...prev,
        operatingHours: prev.operatingHours.map((hour) => ({
          ...hour,
          openingTime: start,
          closingTime: end,
        })),
      }));
    },
    [setFormData]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.clinicName.trim()) {
      alert("Clinic name is required");
      return;
    }
    if (!formData.address.trim()) {
      alert("Address is required");
      return;
    }

    const hasInvalidHours = formData.operatingHours.some((hour) => {
      if (hour.open) {
        if (!hour.openingTime || !hour.closingTime) {
          return true;
        }
        return hour.openingTime >= hour.closingTime;
      }
      return false;
    });

    if (hasInvalidHours) {
      alert("For open days, closing time must be after opening time");
      return;
    }

    const hasAtLeastOneOpenDay = formData.operatingHours.some(
      (hour) => hour.open
    );
    if (!hasAtLeastOneOpenDay) {
      alert("At least one day must be open");
      return;
    }

    if (formData.minSessionPerWeek <= 0) {
      alert("Minimum sessions per week must be at least 1");
      return;
    }

    if (formData.tflZone < 1 || formData.tflZone > 9) {
      alert("TFL Zone must be between 1 and 9");
      return;
    }

    if (formData.walkingMinutesToStations < 0) {
      alert("Walking minutes cannot be negative");
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        slotIds: selectedSlots.map((slot) => slot._id),
        wheelchairAccessible: !!formData.wheelchairAccessible,
        minSessionPerWeek: Number(formData.minSessionPerWeek),
        walkingMinutesToStations: Number(formData.walkingMinutesToStations),
        tflZone: String(formData.tflZone),
        operatingHours: formData.operatingHours
          .filter((hour) => hour.open)
          .map((hour) => ({
            day: hour.day,
            isOpen: true,
            openingTime: hour.openingTime,
            closingTime: hour.closingTime,
          })),
      };

      await saveClinic(dataToSubmit, editingId);
      alert(`Clinic ${editingId ? "updated" : "added"} successfully!`);
      resetForm();
      setSelectedSlots([]);
    } catch (error) {
      console.error("Error:", error);
      alert(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this clinic?")) {
      try {
        await deleteClinic(id);
        alert("Clinic deleted successfully");
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const renderOperatingHours = useMemo(() => {
    return formData.operatingHours.map((hour, index) => (
      <div
        key={hour.day}
        className="flex justify-around items-center gap-4 mb-6 col-span-2"
      >
        <div className="w-24 font-semibold text-gray-800">{hour.day}</div>

        <select
          className="border border-gray-300 rounded-md p-2"
          value={hour.openingTime}
          onChange={(e) =>
            handleTimeChange(index, "openingTime", e.target.value)
          }
          disabled={!hour.open}
        >
          {timeOptions}
        </select>

        <span className="text-gray-500">to</span>

        <select
          className="border border-gray-300 rounded-md p-2"
          value={hour.closingTime}
          onChange={(e) =>
            handleTimeChange(index, "closingTime", e.target.value)
          }
          disabled={!hour.open}
        >
          {timeOptions}
        </select>

        <label className="flex items-center gap-2 ml-2">
          <input
            type="checkbox"
            checked={hour.open}
            onChange={() => toggleOperatingHour(index)}
            className="accent-blue-600 w-5 h-5"
          />
          <span className={hour.open ? "text-green-600" : "text-red-600"}>
            {hour.open ? "Open" : "Closed"}
          </span>
        </label>
      </div>
    ));
  }, [formData.operatingHours, handleTimeChange, timeOptions, toggleOperatingHour]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-4xl mb-8">
        <h3 className="text-3xl font-bold self-start">🏥 Clinics Management</h3>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full max-w-4xl">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl w-full max-w-4xl space-y-8 mb-8"
      >
        <h2 className="text-2xl font-semibold">
          {editingId ? "Edit Clinic" : "Add New Clinic"}
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
            <span className="text-red-500">⏰</span> Operating Hours
          </h2>

          <div className="relative w-full col-span-2">
            {/* Selected Slots Display Area */}
            <div
              className="flex flex-wrap items-center gap-2 border p-3 rounded-lg min-h-[52px] cursor-pointer bg-white"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen((prev) => !prev);
              }}
            >
              {selectedSlots.length === 0 ? (
                <span className="text-gray-400">Select time slots</span>
              ) : (
                selectedSlots.map((slot) => {
                  const fullSlot = listOfSlots.find((s) => s._id === slot._id);
                  const startTime = fullSlot
                    ? DateTime.fromISO(fullSlot.startDate, { zone: "utc" })
                        .setZone("Europe/London")
                        .toFormat("HH:mm")
                    : "";
                  const endTime = fullSlot
                    ? DateTime.fromISO(fullSlot.endDate, { zone: "utc" })
                        .setZone("Europe/London")
                        .toFormat("HH:mm")
                    : "";

                  return (
                    <div
                      key={slot._id}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-1"
                    >
                      <span>{slot.slotName}</span>
                      {startTime && endTime && (
                        <span className="text-gray-600">
                          ({startTime} - {endTime})
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveSlot(slot._id, e)}
                        className="ml-1 text-blue-500 hover:text-blue-700 cursor-pointer"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
              <FaChevronDown
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Dropdown Menu for Slot Selection */}
            {isDropdownOpen && (
              <div
                className="absolute z-10 w-full mt-1 border rounded-lg shadow-lg bg-white max-h-60 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {listOfSlots.map((slot) => {
                  const startTime = DateTime.fromISO(slot.startDate, { zone: "utc" })
                    .setZone("Europe/London")
                    .toFormat("HH:mm");
                  const endTime = DateTime.fromISO(slot.endDate, { zone: "utc" })
                    .setZone("Europe/London")
                    .toFormat("HH:mm");

                  return (
                    <div
                      key={slot._id}
                      className={`p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center ${
                        isSlotSelected(slot._id) ? "bg-blue-50" : ""
                      }`}
                      onClick={(e) => handleSlotToggle(slot, e)}
                    >
                      <div>
                        <div className="font-medium">{slot.slotName}</div>
                        <div className="text-sm text-gray-500">
                          {startTime} - {endTime}
                        </div>
                      </div>
                      {isSlotSelected(slot._id) && (
                        <div className="text-blue-500">✓</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="col-span-2 flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => setAllHours(true)}
              className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg"
            >
              Open All
            </button>
            <button
              type="button"
              onClick={() => setAllHours(false)}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg"
            >
              Close All
            </button>
            <button
              type="button"
              onClick={() => setStandardHours("09:00", "17:00")}
              className="bg-green-100 text-green-800 px-4 py-2 rounded-lg"
            >
              Set 9-5
            </button>
            <button
              type="button"
              onClick={() => setStandardHours("08:00", "20:00")}
              className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg"
            >
              Set 8-8
            </button>
          </div>

          {renderOperatingHours}
        </div>

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
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading
              ? "Saving..."
              : editingId
              ? "Update Clinic"
              : "Add Clinic"}
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
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {isLoading ? "Refreshing..." : "Refresh Clinics"}
          </button>
        </div>

        {isLoading && !clinics.length ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
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
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      disabled={isLoading}
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(clinic._id);
                      }}
                      className="text-red-600 hover:text-red-800"
                      disabled={isLoading}
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
                      <strong>Owner:</strong>{" "}
                      {clinic.ownerName || "Not specified"}
                    </p>
                    <p>
                      <strong>Transport:</strong>{" "}
                      {clinic.localStation || "Not specified"},{" "}
                      {clinic.nearestBus || "Not specified"}, Zone{" "}
                      {clinic.tflZone || "Not specified"}
                    </p>
                    <p>
                      <strong>Accessibility:</strong>{" "}
                      {clinic.wheelchairAccessible
                        ? "Wheelchair accessible"
                        : "Not wheelchair accessible"}
                      , {clinic.walkingMinutesToStations || "Not specified"} min
                      walk
                    </p>
                    <p>
                      <strong>WiFi:</strong>{" "}
                      {clinic.wifiDetails || "Not specified"}
                    </p>
                    <p>
                      <strong>Minimum Sessions:</strong>{" "}
                      {clinic.minSessionPerWeek || "Not specified"}
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
                          const hour = clinic.operatingHours?.find(
                            (h) => h.day === day
                          );
                          const isOpen = !!hour;

                          return (
                            <div
                              key={day}
                              className="grid grid-cols-12 items-center gap-x-4"
                            >
                              <div className="col-span-3 font-medium text-gray-700 flex justify-center items-center">
                                {day}
                              </div>

                              <div className="col-span-3 p-2 bg-gray-100 rounded text-center">
                                {isOpen && hour.openingTime
                                  ? formatTimeDisplay(hour.openingTime)
                                  : "--"}
                              </div>

                              <div className="col-span-3 p-2 bg-gray-100 rounded text-center">
                                {isOpen && hour.closingTime
                                  ? formatTimeDisplay(hour.closingTime)
                                  : "--"}
                              </div>

                              <div className="col-span-3 flex justify-center items-center gap-2">
                                <div
                                  className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                                    isOpen
                                      ? "bg-blue-600 border-blue-600"
                                      : "bg-gray-200 border-gray-400"
                                  }`}
                                >
                                  {isOpen && (
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
                                <span
                                  className={`text-sm ${
                                    isOpen ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {isOpen ? "Open" : "Closed"}
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
        )}
      </div>
    </div>
  );
}