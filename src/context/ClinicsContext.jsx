import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const ClinicsContext = createContext();

const apiUrl = import.meta.env.VITE_API_URL;

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function ClinicsProvider({ children }) {
  const [clinics, setClinics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [listOfSlots, setListOfSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const initialFormData = {
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
    operatingHours: daysOfWeek.map((day) => ({
      day,
      open: true,
      openingTime: "08:00",
      closingTime: "20:00",
    })),
    slotIds: [],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);

  const fetchClinics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${apiUrl}/clinics`);
      setClinics(response.data);
    } catch (error) {
      console.error("Error fetching clinics:", error);
      setError("Failed to fetch clinics. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveClinic = async (clinicData, id = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const cleanedData = {
        ...clinicData,
        slotIds: clinicData.slotIds.map(id => id.toString())
      };

      let response;
      if (id) {
        response = await axios.put(`${apiUrl}/clinics/${id}`, cleanedData);
      } else {
        response = await axios.post(`${apiUrl}/clinics`, cleanedData);
      }
      await fetchClinics();
      return response.data;
    } catch (error) {
      console.error("Error saving clinic:", error.response?.data || error);
      setError(error.response?.data?.message || "Failed to save clinic");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteClinic = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`${apiUrl}/clinics/${id}`);
      await fetchClinics();
    } catch (error) {
      console.error("Error deleting clinic:", error);
      setError(error.response?.data?.message || "Failed to delete clinic");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadClinicForEdit = (clinic) => {
    setEditingId(clinic._id);
    
    const completeOperatingHours = daysOfWeek.map(day => {
      const hourData = clinic.operatingHours?.find(h => h.day === day);
      return hourData ? {
        day,
        open: true,
        openingTime: hourData.openingTime || "08:00",
        closingTime: hourData.closingTime || "20:00"
      } : {
        day,
        open: false,
        openingTime: "08:00",
        closingTime: "20:00"
      };
    });

    setFormData({
      ...clinic,
      operatingHours: completeOperatingHours
    });

    if (clinic.slotIds && clinic.slotIds.length > 0) {
      const slotsToSelect = listOfSlots.filter(slot => 
        clinic.slotIds.some(id => id.toString() === slot._id.toString())
      );
      setSelectedSlots(slotsToSelect.map(slot => ({
        _id: slot._id,
        slotName: slot.slotName
      })));
    } else {
      setSelectedSlots([]);
    }
  };

  const fetchListOfSlots = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${apiUrl}/slots`);
      setListOfSlots(response.data);
    } catch (error) {
      console.error("Error fetching list of clinics:", error);
      setError(
        error.response?.data?.message || "Failed to fetching list of clinics"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setSelectedSlots([]);
  };

  // Add this new function to handle toggling operating hours
  const toggleOperatingHour = (index) => {
    setFormData(prev => {
      const updatedHours = [...prev.operatingHours];
      updatedHours[index] = {
        ...updatedHours[index],
        open: !updatedHours[index].open
      };
      return {
        ...prev,
        operatingHours: updatedHours
      };
    });
  };

  useEffect(() => {
    fetchClinics();
    fetchListOfSlots();
  }, []);

  return (
    <ClinicsContext.Provider
      value={{
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
        toggleOperatingHour // Add this to the context
      }}
    >
      {children}
    </ClinicsContext.Provider>
  );
}

export const useClinics = () => {
  const context = useContext(ClinicsContext);
  if (!context) {
    throw new Error("useClinics must be used within a ClinicsProvider");
  }
  return context;
};