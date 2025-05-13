import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const MainRota = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [rotaData, setRotaData] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const fetchRotaData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/rota`);
        const data = response.data;

        // Extract unique clinic names
        const uniqueClinics = [...new Set(data.map(item => item.clinic.clinicName))];

        // Extract unique slots
        const uniqueSlots = [...new Set(data.map(item => item.slot.slotName))];

        setRotaData(data);
        setClinics(uniqueClinics);
        setSlots(uniqueSlots);
      } catch (error) {
        console.error('Error fetching rota data:', error);
      }
    };

    fetchRotaData();
  }, []);

   console.log("data", clinics); 
  // Helper function to find a matching rota entry
  const findRotaEntry = (clinicName, slotName) => {
    return rotaData.find(
      entry => entry.clinic.clinicName === clinicName && entry.slot.slotName === slotName
    );
  };

  // Helper function to format slot times
  const formatSlotTime = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const startTime = format(new Date(startDate), 'hh:mm a');
    const endTime = format(new Date(endDate), 'hh:mm a');
    return `${startTime} - ${endTime}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200">
        <thead>
          <tr>
            <th className="bg-gray-100 p-4 border border-gray-200">Slot / Clinic</th>
            {clinics.map((clinic, index) => (
              <th key={index} className="bg-gray-100 p-4 border border-gray-200">
                {clinic}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot, slotIndex) => (
            <tr key={slotIndex}>
              <td className="bg-gray-100 p-4 border border-gray-200">{slot}</td>
              {clinics.map((clinic, clinicIndex) => {
                const entry = findRotaEntry(clinic, slot);
                return (
                  <td key={clinicIndex} className="text-gray-500 italic p-4 border border-gray-200">
                    {entry ? (
                      <>
                        <span className="font-semibold">
  {entry.clinician ? entry.clinician.clinicianName : 'No Clinician Assigned'}
</span>
                        <br />
                        <span className="text-gray-400 text-sm">
                          {formatSlotTime(entry.slot.startDate, entry.slot.endDate)}
                        </span>
                      </>
                    ) : (
                      'Available'
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MainRota;
