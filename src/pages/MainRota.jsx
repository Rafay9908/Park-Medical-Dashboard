// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { format } from "date-fns";

// const MainRota = () => {
//   const apiUrl = import.meta.env.VITE_API_URL;
//   const [rotaData, setRotaData] = useState([]);
//   const [clinics, setClinics] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Updated to match actual session types from the API
//   const staticDaysWithSessions = [
//     { day: "Monday", sessions: ["Morning", "Afternoon", "Evening"] },
//     { day: "Tuesday", sessions: ["Morning", "Afternoon", "Evening"] },
//     { day: "Wednesday", sessions: ["Morning", "Afternoon", "Evening"] },
//     { day: "Thursday", sessions: ["Morning", "Afternoon", "Evening"] },
//     { day: "Friday", sessions: ["Morning", "Afternoon", "Evening"] },
//     { day: "Saturday", sessions: ["Morning", "Afternoon", "Evening"] },
//     { day: "Sunday", sessions: ["Morning", "Afternoon", "Evening"] }
//   ];

//   useEffect(() => {
//     const fetchRotaData = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(`${apiUrl}/rota`);
//         const data = response.data;

//         // Extract unique clinic names and sort alphabetically
//         const uniqueClinics = [
//           ...new Set(data.map((item) => item.clinic?.clinicName).filter(Boolean)),
//         ].sort();

//         setRotaData(data);
//         setClinics(uniqueClinics);
//         setError(null);
//       } catch (error) {
//         console.error("Error fetching rota data:", error);
//         setError("Failed to load rota data. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRotaData();
//   }, []);

//   const formatDayName = (dayAbbr) => {
//     const dayMap = {
//       "Monday": "Monday",
//       "Tuesday": "Tuesday",
//       "Wednesday": "Wednesday",
//       "Thursday": "Thursday",
//       "Friday": "Friday",
//       "Saturday": "Saturday",
//       "Sunday": "Sunday",
//       "mo": "Monday",
//       "tu": "Tuesday",
//       "we": "Wednesday",
//       "th": "Thursday",
//       "fr": "Friday",
//       "sa": "Saturday",
//       "su": "Sunday"
//     };
//     return dayMap[dayAbbr] || dayAbbr;
//   };

//   const formatSessionTime = (startDate, endDate) => {
//     if (!startDate || !endDate) return "";
//     try {
//       const startTime = format(new Date(startDate), "HH:mm");
//       const endTime = format(new Date(endDate), "HH:mm");
//       return `${startTime} - ${endTime}`;
//     } catch (e) {
//       return "";
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
//         <strong className="font-bold">Error: </strong>
//         <span className="block sm:inline">{error}</span>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold text-gray-800 mb-6">Clinic Rota Schedule</h1>
//       <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200">
//         <table className="w-full">
//           <thead>
//             <tr>
//               <th className="bg-[#1E2939] text-white p-4 border border-gray-200 sticky left-0 z-10 min-w-[180px] text-left">
//                 Day/Session
//               </th>
//               {clinics.map((clinic, index) => (
//                 <th
//                   key={index}
//                   className="bg-[#1E2939] text-white p-4 border border-gray-200 min-w-[220px] text-left"
//                 >
//                   {clinic}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {staticDaysWithSessions.map((dayData, dayIndex) => (
//               <React.Fragment key={dayIndex}>
//                 {/* Day Header Row */}
//                 <tr className="bg-gray-100">
//                   <td className="p-3 border border-gray-200 sticky left-0 z-10 bg-gray-100 font-bold text-gray-700">
//                     {dayData.day}
//                   </td>
//                   {clinics.map((clinic, clinicIndex) => (
//                     <td key={clinicIndex} className="p-3 border border-gray-200 bg-gray-100"></td>
//                   ))}
//                 </tr>
                
//                 {/* Session Rows for this Day */}
//                 {dayData.sessions.map((session, sessionIndex) => (
//                   <tr 
//                     key={`${dayIndex}-${sessionIndex}`} 
//                     className={sessionIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
//                   >
//                     <td className="p-3 border border-gray-200 sticky left-0 z-10 bg-blue-50">
//                       <div className="flex items-center pl-4">
//                         <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
//                         <div className="font-medium text-blue-800">
//                           {session}
//                         </div>
//                       </div>
//                     </td>
//                     {clinics.map((clinic, clinicIndex) => {
//                       // Find entries that match the current clinic, day AND session type
//                       const entries = rotaData.filter(entry => 
//                         entry.clinic?.clinicName === clinic && 
//                         formatDayName(entry.day) === dayData.day &&
//                         entry.sessionType === session
//                       );
                      
//                       return (
//                         <td
//                           key={clinicIndex}
//                           className="p-3 border border-gray-200"
//                         >
//                           {entries.length > 0 ? (
//                             <div className="space-y-2">
//                               {entries.map((entry, entryIndex) => {
//                                 const timeSlot = entry.slot 
//                                   ? formatSessionTime(entry.slot.startDate, entry.slot.endDate)
//                                   : "";
                                
//                                 return (
//                                   <div 
//                                     key={entryIndex} 
//                                     className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow"
//                                   >
//                                     <div className="font-semibold text-blue-700">
//                                       {entry.clinician?.clinicianName || "No Clinician"}
//                                     </div>
//                                     <div className="text-gray-500 text-sm mt-1">
//                                       {entry.sessionType || "Unassigned"}
//                                     </div>
//                                     {timeSlot && (
//                                       <div className="text-gray-500 text-sm mt-1">
//                                         {timeSlot}
//                                       </div>
//                                     )}
//                                   </div>
//                                 );
//                               })}
//                             </div>
//                           ) : (
//                             <div className="text-gray-400 italic p-2 bg-gray-50 rounded">
//                               Available
//                             </div>
//                           )}
//                         </td>
//                       );
//                     })}
//                   </tr>
//                 ))}
//               </React.Fragment>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default MainRota;


import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

const MainRota = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [rotaData, setRotaData] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [days, setDays] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRotaData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/rota`);
        const data = response.data;

        // Extract unique clinic names and sort alphabetically
        const uniqueClinics = [
          ...new Set(data.map((item) => item.clinic?.clinicName).filter(Boolean)),
        ].sort();

        // Extract unique days from the data
        const uniqueDays = [
          ...new Set(data.map((item) => formatDayName(item.day))),
        ].sort((a, b) => {
          const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
          return dayOrder.indexOf(a) - dayOrder.indexOf(b);
        });

        // Extract unique session types
        const uniqueSessions = [
          ...new Set(data.map((item) => item.sessionType).filter(Boolean)),
        ].sort();

        setRotaData(data);
        setClinics(uniqueClinics);
        setDays(uniqueDays);
        setSessions(uniqueSessions);
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

  const formatDayName = (dayAbbr) => {
    const dayMap = {
      "Monday": "Monday",
      "Tuesday": "Tuesday",
      "Wednesday": "Wednesday",
      "Thursday": "Thursday",
      "Friday": "Friday",
      "Saturday": "Saturday",
      "Sunday": "Sunday",
      "mo": "Monday",
      "tu": "Tuesday",
      "we": "Wednesday",
      "th": "Thursday",
      "fr": "Friday",
      "sa": "Saturday",
      "su": "Sunday"
    };
    return dayMap[dayAbbr] || dayAbbr;
  };

  const formatSessionTime = (startDate, endDate) => {
    if (!startDate || !endDate) return "";
    try {
      const startTime = format(new Date(startDate), "h:mm a");
      const endTime = format(new Date(endDate), "h:mm a");
      return `${startTime} - ${endTime}`;
    } catch (e) {
      return "";
    }
  };

  const getGroupedData = () => {
    const grouped = {};
    
    rotaData.forEach((entry) => {
      const clinicName = entry.clinic?.clinicName;
      const day = formatDayName(entry.day);
      const sessionType = entry.sessionType;
      
      if (!clinicName || !day || !sessionType) return;
      
      if (!grouped[clinicName]) grouped[clinicName] = {};
      if (!grouped[clinicName][day]) grouped[clinicName][day] = {};
      if (!grouped[clinicName][day][sessionType]) {
        grouped[clinicName][day][sessionType] = [];
      }
      
      grouped[clinicName][day][sessionType].push(entry);
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Clinic Rota Schedule</h1>
      
      {/* Responsive container */}
      <div className="relative">
        {/* Horizontal scroll indicator for mobile */}
        <div className="md:hidden absolute right-0 top-0 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
          ← Scroll →
        </div>
        
        <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200">
          <div className="min-w-[800px]"> {/* Minimum width to prevent squeezing */}
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
                {days.map((day, dayIndex) => (
                  <React.Fragment key={dayIndex}>
                    {/* Day Header Row */}
                    <tr className="bg-gray-100">
                      <td className="p-3 border border-gray-200 sticky left-0 z-10 bg-gray-100 font-bold text-gray-700 whitespace-nowrap">
                        {day}
                      </td>
                      {clinics.map((clinic, clinicIndex) => (
                        <td key={clinicIndex} className="p-3 border border-gray-200 bg-gray-100"></td>
                      ))}
                    </tr>
                    
                    {/* Session Rows for this Day */}
                    {sessions.map((session, sessionIndex) => (
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
                          const entries = groupedData[clinic]?.[day]?.[session] || [];
                          
                          return (
                            <td
                              key={clinicIndex}
                              className="p-3 border border-gray-200"
                            >
                              {entries.length > 0 ? (
                                <div className="space-y-2">
                                  {entries.map((entry, entryIndex) => {
                                    const timeSlot = entry.slot 
                                      ? formatSessionTime(entry.slot.startDate, entry.slot.endDate)
                                      : "";
                                    
                                    return (
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
                                        {timeSlot && (
                                          <div className="text-gray-500 text-sm mt-1 whitespace-nowrap">
                                            {timeSlot}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainRota;