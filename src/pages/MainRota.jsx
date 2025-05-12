import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, addDays, addWeeks, startOfWeek, endOfWeek } from 'date-fns';

const MainRota = () => {
  const [clinics, setClinics] = useState([]);
  const [clinicians, setClinicians] = useState([]);
  const [rotaData, setRotaData] = useState({});
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;


  // Session times
  const sessions = [
    { name: 'Morning', start: 9, end: 12 },
    { name: 'Afternoon', start: 13, end: 17 },
    { name: 'Evening', start: 17, end: 20 }
  ];

  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const weekStart = startOfWeek(currentWeek);
        const weekEnd = endOfWeek(currentWeek);
        
        const [clinicsRes, cliniciansRes, rotaRes] = await Promise.all([
          axios.get(`${apiUrl}/clinics`),
          axios.get(`${apiUrl}/clinicians`),
          axios.get(`${apiUrl}/rota/view`, {
            params: {
              startDate: weekStart.toISOString(),
              endDate: weekEnd.toISOString()
            }
          })
        ]);

        setClinics(clinicsRes.data);
        console.log("Abc", clinicsRes.data);
        setClinicians(cliniciansRes.data);
        setRotaData(rotaRes.data.data || {});

        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load data');
        console.error('API Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentWeek]);

  // Navigation handlers
  const handlePreviousWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };

  // Get assignments for a specific clinic/day/session
  const getAssignments = (clinicId, date, session) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (!rotaData[dateStr] || !rotaData[dateStr].clinics[clinicId]) return null;
    
    return rotaData[dateStr].clinics[clinicId].slots.filter(slot => {
      const slotHour = new Date(slot.startTime).getHours();
      return slotHour >= session.start && slotHour < session.end;
    });
  };

  // Render cell content
  const renderCellContent = (clinic, day, session) => {
    const date = addDays(startOfWeek(currentWeek), days.indexOf(day));
    const assignments = getAssignments(clinic._id, date, session);

    if (!assignments || assignments.length === 0) {
      return (
        <div className="p-2 rounded bg-gray-100 text-gray-500 text-sm">
          Available
        </div>
      );
    }

    return assignments.map(assignment => (
      <div key={assignment._id} className="mb-1 last:mb-0">
        <div className="p-2 rounded bg-blue-50 text-gray-800 text-sm">
          <div className="font-medium">{assignment.clinician.name}</div>
          <div className="text-xs">
            {format(new Date(assignment.startTime), 'HH:mm')} - 
            {format(new Date(assignment.endTime), 'HH:mm')}
          </div>
        </div>
      </div>
    ));
  };

  // Days of week
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (isLoading) return <div className="p-4 text-center">Loading rota data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Weekly Clinic Rota ({format(startOfWeek(currentWeek), 'MMM dd')} - {format(endOfWeek(currentWeek), 'MMM dd')})
        </h1>
        <div className="flex space-x-2">
          <button 
            onClick={handlePreviousWeek}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Previous Week
          </button>
          <button 
            onClick={() => setCurrentWeek(new Date())}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
          >
            Current Week
          </button>
          <button 
            onClick={handleNextWeek}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Next Week
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full bg-white rounded-lg shadow overflow-hidden">
          {/* Clinic Header Row */}
          <div className="flex border-b">
            <div className="w-48 flex-shrink-0 border-r bg-gray-100 p-2 font-medium">
              <div className="h-10 flex items-center justify-between">
                <span>Day/Session</span>
                <span className="text-xs text-gray-500">Location →</span>
              </div>
            </div>
            {clinics.map(clinic => (
              <div key={clinic._id} className="w-64 flex-shrink-0 text-center p-2 bg-gray-100">
                <div className="font-medium truncate">{clinic.clinicName}</div>
                <div className="text-xs text-gray-600 truncate">{clinic.address}</div>
              </div>
            ))}
          </div>
          
          {/* Days and Sessions */}
          {days.map(day => (
            <React.Fragment key={day}>
              {/* Day Header */}
              <div className="flex border-b">
                <div className="w-48 flex-shrink-0 border-r bg-gray-50 p-2 font-medium">
                  {day}
                </div>
                {clinics.map(clinic => (
                  <div key={`${clinic._id}-${day}-header`} className="w-64 flex-shrink-0 text-center p-2 bg-gray-50 font-medium">
                    {day.slice(0, 3)}
                  </div>
                ))}
              </div>
              
              {/* Session Rows */}
              {sessions.map(session => (
                <div key={`${day}-${session.name}`} className="flex border-b last:border-b-0">
                  <div className="w-48 flex-shrink-0 border-r p-2 pl-4 text-sm text-gray-600 bg-gray-50">
                    {session.name}
                  </div>
                  
                  {clinics.map(clinic => (
                    <div key={`${clinic._id}-${day}-${session.name}`} className="w-64 flex-shrink-0 p-2 border-r">
                      {renderCellContent(clinic, day, session)}
                    </div>
                  ))}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-100 rounded-full mr-2 border border-blue-300"></div>
          <span className="text-sm">Available Slot</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm">Booked Session</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-200 rounded-full mr-2"></div>
          <span className="text-sm">Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export default MainRota;