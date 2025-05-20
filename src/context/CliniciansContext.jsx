import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CliniciansContext = createContext();

export const CliniciansProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  
  const [clinicians, setClinicians] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);

  const fetchClinicians = async () => {
    try {
      const response = await axios.get(`${API_URL}/clinicians`);
      setClinicians(response.data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching clinicians:", err);
    }
  };

  const fetchClinics = async () => {
    try {
      const response = await axios.get(`${API_URL}/clinics`);
      setClinics(response.data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching clinics:", err);
    }
  };

  const addClinician = async (clinicianData) => {
    try {
      const response = await axios.post(`${API_URL}/clinicians`, clinicianData);
      setClinicians([...clinicians, response.data]);
      return response.data;
    } catch (error) {
      console.error("Error adding clinician:", error);
      throw error;
    }
  };

  const updateClinician = async (id, updatedData) => {
    try {
      const response = await axios.put(`${API_URL}/clinicians/${id}`, updatedData);
      setClinicians(clinicians.map(clin => 
        clin._id === id ? response.data : clin
      ));
      return response.data;
    } catch (error) {
      console.error("Error updating clinician:", error);
      throw error;
    }

    console.log("aagaya", updatedData);

  };

  const deleteClinician = async (id) => {
    try {
      await axios.delete(`${API_URL}/clinicians/${id}`);
      setClinicians(clinicians.filter(clin => clin._id !== id));
    } catch (error) {
      console.error("Error deleting clinician:", error);
      throw error;
    }
  };

  const fetchTimeSlots = async () => {
  try {
    const response = await axios.get(`${API_URL}/slots`);
    setTimeSlots(response.data);
  } catch (err) {
    setError(err.message);
    console.error("Error fetching time slots:", err);
  }
};

  useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchClinicians(), fetchClinics(), fetchTimeSlots()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);


  return (
    <CliniciansContext.Provider
      value={{
          clinicians,
          clinics,
          timeSlots,
          loading,
          error,
          addClinician,
          updateClinician,
          deleteClinician,
          fetchClinicians,
      }}
    >
      {children}
    </CliniciansContext.Provider>
  );
};

export const useClinicians = () => {
  const context = useContext(CliniciansContext);
  if (!context) {
    throw new Error("useClinicians must be used within a CliniciansProvider");
  }
  return context;
};