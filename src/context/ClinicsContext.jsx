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
    operatingHours: daysOfWeek.map(day => ({
      day,
      open: true,
      openingTime: "08:00",
      closingTime: "20:00"
    }))
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
      console.error('Error fetching clinics:', error);
      setError('Failed to fetch clinics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveClinic = async (clinicData, id = null) => {
    setIsLoading(true);
    setError(null);
    try {
      // Clean up operating hours data before sending
      const cleanedData = {
        ...clinicData,
        operatingHours: clinicData.operatingHours.map(hour => ({
          day: hour.day,
          open: hour.open,
          openingTime: hour.open ? hour.openingTime : undefined,
          closingTime: hour.open ? hour.closingTime : undefined
        }))
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
      console.error('Error saving clinic:', error.response?.data || error);
      setError(error.response?.data?.message || 'Failed to save clinic. Please check your data.');
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
      console.error('Error deleting clinic:', error);
      setError(error.response?.data?.message || 'Failed to delete clinic');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadClinicForEdit = (clinic) => {
    setEditingId(clinic._id);
    setFormData({
      clinicName: clinic.clinicName,
      address: clinic.address,
      ownerName: clinic.ownerName || "",
      localStation: clinic.localStation || "",
      nearestBus: clinic.nearestBus || "",
      wifiDetails: clinic.wifiDetails || "",
      checkInInstructions: clinic.checkInInstructions || "",
      tflZone: clinic.tflZone || "1",
      minSessionPerWeek: clinic.minSessionPerWeek || 1,
      walkingMinutesToStations: clinic.walkingMinutesToStations || 5,
      wheelchairAccessible: clinic.wheelchairAccessible || false,
      operatingHours: daysOfWeek.map(day => {
        const hourData = clinic.operatingHours?.find(h => h.day === day);
        return hourData || {
          day,
          open: true,
          openingTime: "08:00",
          closingTime: "20:00"
        };
      })
    });
  };

  const fetchListOfSlots = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${apiUrl}/slots`);
      setListOfSlots(response.data);
    } catch (error) {
      console.error('Error fetching list of clinics:', error);
      setError(error.response?.data?.message || 'Failed to fetching list of clinics');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
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
        resetForm
      }}
    >
      {children}
    </ClinicsContext.Provider>
  );
}

export const useClinics = () => {
  const context = useContext(ClinicsContext);
  if (!context) {
    throw new Error('useClinics must be used within a ClinicsProvider');
  }
  return context;
};