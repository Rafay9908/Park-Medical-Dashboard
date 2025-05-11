import React, { useState, useEffect } from "react";
import axios from "axios";

const Main = () => {
  const [clinicData, setClinicData] = useState(null);
  const [cliniciansData, setCliniciansData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  
  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        const response = await axios.get(`${API_URL}/clinics`);
        setClinicData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchClinicansData = async () => {
      try {
        const response = await axios.get(`${API_URL}/clinicians`);
        setCliniciansData(response.data);
         setLoading(false);
      } catch (error) {
        console.error("Error Fetching Clinicians Count", error);
         setLoading(false);
      }
    }

    fetchClinicansData()
    fetchClinicData();
    
  }, []);

  const activeClinicsCount = clinicData?.filter(clinic => clinic.status === "active").length || 0;
  const totalClinicsCount = clinicData?.length || 0;

  const totalClinicianCount = cliniciansData?.length || 0; 

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Audiology Clinic Rota Management</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Audiology Clinic Rota Management</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error loading clinic data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Audiology Clinic Rota Management</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clinics Card */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Clinics</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-800 mr-2">{activeClinicsCount}</span>
              <span className="text-green-600 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                <span className="text-xs ml-1">Total: {totalClinicsCount}</span>
              </span>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <h3 className="text-gray-600 font-medium mb-2">Total Clinicians</h3>
            <span className="text-3xl font-bold text-gray-800">{totalClinicianCount}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <p className="text-gray-600">
            <span className="font-medium">Navigate to Clinics in the sidebar</span>
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-gray-700 font-medium mb-2">Active Rota Overview</h3>
          {clinicData && clinicData.length > 0 ? (
            <p className="text-gray-500 text-sm">Rota data available</p>
          ) : (
            <p className="text-gray-500 text-sm">No rota data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Main;