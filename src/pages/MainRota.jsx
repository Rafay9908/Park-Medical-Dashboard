import React from "react";

const MainRota = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const sessions = ["Morning", "Afternoon", "Evening"];
  const clinics = [
    { name: "Clinic A", location: "Central London" },
    { name: "Clinic B", location: "West London" },
    { name: "Clinic C", location: "East London" },
    { name: "Clinic D", location: "North London" },
    { name: "Clinic E", location: "South London" },
    { name: "Clinic F", location: "Camden" },
    { name: "Clinic G", location: "Chelsea" },
    { name: "Clinic H", location: "Greenwich" },
    { name: "Clinic I", location: "Hackney" },
    { name: "Clinic J", location: "Islington" },
  ];
  
  const generateSampleSchedule = () => {
    const schedule = {};
    clinics.forEach(clinic => {   
      schedule[clinic.name] = {};
      days.forEach(day => {
        schedule[clinic.name][day] = {
          "Morning": Math.random() > 0.3 ? `Dr. ${["Smith","Johnson","Williams","Brown"][Math.floor(Math.random()*4)]} (9-12)` : "Available",
          "Afternoon": Math.random() > 0.3 ? `Nurse ${["Wilson","Taylor","Davis","White"][Math.floor(Math.random()*4)]} (1-5)` : "Available",
          "Evening": Math.random() > 0.5 ? `Dr. ${["Smith","Johnson","Williams","Brown"][Math.floor(Math.random()*4)]} (5-8)` : "Closed"
        };
      });
    });
    return schedule;
  };

  const schedule = generateSampleSchedule();

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Weekly Clinic Rota</h1>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full bg-white rounded-lg shadow overflow-hidden">
          <div className="flex border-b">
            <div className="w-48 flex-shrink-0 border-r bg-gray-100 p-2 font-medium">
              <div className="h-10 flex items-center justify-between">
                <span>Day/Session</span>
                <span className="text-xs text-gray-500">Location →</span>
              </div>
            </div>
            {clinics.map(clinic => (
              <div key={clinic.name} className="w-64 flex-shrink-0 text-center p-2 bg-gray-100">
                <div className="font-medium">{clinic.name}</div>
                <div className="text-xs text-gray-600 truncate">{clinic.location}</div>
              </div>
            ))}
          </div>
          
          {days.map(day => (
            <React.Fragment key={day}>
              <div className="flex border-b">
                <div className="w-48 flex-shrink-0 border-r bg-gray-50 p-2 font-medium">
                  {day}
                </div>
                {clinics.map(clinic => (
                  <div key={`${clinic.name}-${day}-header`} className="w-64 flex-shrink-0 text-center p-2 bg-gray-50 font-medium">
                    {day.slice(0, 3)}
                  </div>
                ))}
              </div>
              
              {sessions.map(session => (
                <div key={`${day}-${session}`} className="flex border-b last:border-b-0">
                  <div className="w-48 flex-shrink-0 border-r p-2 pl-4 text-sm text-gray-600 bg-gray-50">
                    {session}
                  </div>
                  
                  {clinics.map(clinic => (
                    <div key={`${clinic.name}-${day}-${session}`} className="w-64 flex-shrink-0 p-2 border-r">
                      <div className={`p-2 rounded text-sm ${
                        schedule[clinic.name][day][session] === "Available" 
                          ? "bg-gray-100 text-gray-500" 
                          : schedule[clinic.name][day][session] === "Closed"
                            ? "bg-gray-200 text-gray-400 italic"
                            : "bg-blue-50 text-gray-800"
                      }`}>
                        {schedule[clinic.name][day][session]}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <div className="mt-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm">Booked Session</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-100 rounded-full mr-2"></div>
            <span className="text-sm">Available Slot</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-200 rounded-full mr-2"></div>
            <span className="text-sm">Closed</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
            Previous Week
          </button>
          <span className="px-4 py-2 font-medium text-sm">Week 24, 2023</span>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
            Next Week
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainRota;