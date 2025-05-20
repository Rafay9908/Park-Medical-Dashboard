import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, addDays, startOfWeek, parseISO } from "date-fns";

const MainRota = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [rotaData, setRotaData] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  // Define static session labels
  const staticSessions = ["Session 1", "Session 2", "Session 3"];

  useEffect(() => {
    const fetchRotaData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/rota`);
        const data = response.data;

        console.log("Raw API data:", data); // Debugging

        // Extract unique clinic names
        const uniqueClinics = [
          ...new Set(data.map(item => item.clinic?.clinicName).filter(Boolean))
        ].sort();

        // Extract and format days - handle both date strings and day names
        const extractedDays = data.map(item => {
          try {
            if (!item.day) return null;
            
            // If it's already a day name
            const dayNames = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
            if (dayNames.includes(item.day)) return item.day;
            
            // If it's a date string
            const date = new Date(item.day);
            if (!isNaN(date.getTime())) {
              return format(date, "EEEE");
            }
            
            // If it's an abbreviation
            const abbrMap = { mo: "Monday", tu: "Tuesday", we: "Wednesday", 
                             th: "Thursday", fr: "Friday", sa: "Saturday", su: "Sunday" };
            const lowerDay = item.day.toLowerCase();
            if (abbrMap[lowerDay]) return abbrMap[lowerDay];
            
            return null;
          } catch (e) {
            console.error("Error processing day:", item.day, e);
            return null;
          }
        }).filter(Boolean);

        const uniqueDays = [...new Set(extractedDays)].sort((a, b) => {
          const dayOrder = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
          return dayOrder.indexOf(a) - dayOrder.indexOf(b);
        });

        console.log("Processed clinics:", uniqueClinics); // Debugging
        console.log("Processed days:", uniqueDays); // Debugging

        setRotaData(data);
        setClinics(uniqueClinics);
        setDays(uniqueDays);
        setError(null);
      } catch (error) {
        console.error("Error fetching rota data:", error);
        setError("Failed to load rota data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRotaData();
  }, []);

  const getDateForDay = (dayName) => {
    const dayIndex = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
      .indexOf(dayName);
    if (dayIndex === -1) return "";
    
    const dateForDay = addDays(currentWeekStart, dayIndex);
    return format(dateForDay, "do MMM");
  };

  const formatSessionTime = (startDate, endDate) => {
    if (!startDate || !endDate) return "";
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";
      
      return `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
    } catch (e) {
      console.error("Error formatting session time:", e);
      return "";
    }
  };

  const getGroupedData = () => {
    const grouped = {};
    
    rotaData.forEach((entry) => {
      try {
        const clinicName = entry.clinic?.clinicName;
        if (!clinicName) return;
        
        // Determine day name
        let dayName = "";
        if (["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].includes(entry.day)) {
          dayName = entry.day;
        } else {
          const date = new Date(entry.day);
          dayName = !isNaN(date.getTime()) ? format(date, "EEEE") : "Unknown";
        }
        
        const sessionType = entry.sessionType || "Unassigned";
        
        if (!grouped[clinicName]) grouped[clinicName] = {};
        if (!grouped[clinicName][dayName]) grouped[clinicName][dayName] = {};
        if (!grouped[clinicName][dayName][sessionType]) {
          grouped[clinicName][dayName][sessionType] = [];
        }
        
        grouped[clinicName][dayName][sessionType].push(entry);
      } catch (e) {
        console.error("Error processing entry:", entry, e);
      }
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  const groupedData = getGroupedData();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Clinic Rota Schedule</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Previous
          </button>
          <button 
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
      
      <div className="mb-2 text-sm text-gray-600">
        Week of {format(currentWeekStart, "do MMM yyyy")}
      </div>
      
      <div className="relative">
        <div className="md:hidden absolute right-0 top-0 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
          ← Scroll →
        </div>
        
        <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200">
          <div className="min-w-[800px]">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="bg-[#1E2939] text-white p-4 border border-gray-200 sticky left-0 z-20 min-w-[180px] text-left">
                    Day/Session
                  </th>
                  {clinics.map((clinic, index) => (
                    <th
                      key={index}
                      className="bg-[#1E2939] text-white p-4 border border-gray-200 min-w-[220px] text-left"
                    >
                      <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                        {clinic}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.length > 0 ? (
                  days.map((day, dayIndex) => (
                    <React.Fragment key={dayIndex}>
                      <tr className="bg-gray-100">
                        <td className="p-3 border border-gray-200 sticky left-0 z-10 bg-gray-100 font-bold text-gray-700 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span>{day}</span>
                            <span className="text-xs font-normal text-gray-500">
                              {getDateForDay(day)}
                            </span>
                          </div>
                        </td>
                        {clinics.map((clinic, clinicIndex) => (
                          <td key={clinicIndex} className="p-3 border border-gray-200 bg-gray-100"></td>
                        ))}
                      </tr>
                      
                      {staticSessions.map((session, sessionIndex) => (
                        <tr 
                          key={`${dayIndex}-${sessionIndex}`} 
                          className={sessionIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                          <td className="p-3 border border-gray-200 sticky left-0 z-10 bg-blue-50 whitespace-nowrap">
                            <div className="flex items-center pl-4">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              <div className="font-medium text-blue-800">
                                {session}
                              </div>
                            </div>
                          </td>
                          {clinics.map((clinic, clinicIndex) => {
                            const sessionsForDay = groupedData[clinic]?.[day] || {};
                            const sessionTypes = Object.keys(sessionsForDay);
                            const entries = sessionTypes[sessionIndex] 
                              ? sessionsForDay[sessionTypes[sessionIndex]] || [] 
                              : [];
                            
                            return (
                              <td
                                key={clinicIndex}
                                className="p-3 border border-gray-200"
                              >
                                {entries.length > 0 ? (
                                  <div className="space-y-2">
                                    {entries.map((entry, entryIndex) => (
                                      <div 
                                        key={entryIndex} 
                                        className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow"
                                      >
                                        <div className="font-semibold text-blue-700 whitespace-nowrap">
                                          {entry.clinician?.clinicianName || "No Clinician"}
                                        </div>
                                        <div className="text-gray-500 text-sm mt-1 whitespace-nowrap">
                                          {entry.sessionType || "Unassigned"}
                                        </div>
                                        {entry.slot && (
                                          <div className="text-gray-500 text-sm mt-1 whitespace-nowrap">
                                            {formatSessionTime(entry.slot.startDate, entry.slot.endDate)}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-gray-400 italic p-2 bg-gray-50 rounded whitespace-nowrap">
                                    Available
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={clinics.length + 1} className="p-4 text-center text-gray-500">
                      No days data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainRota;