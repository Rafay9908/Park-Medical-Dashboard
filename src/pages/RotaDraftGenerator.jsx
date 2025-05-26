import React, { useState } from 'react'
import axios from 'axios';

function RotaDraftGenerator() {
  const [successMessage, setSuccessMessage] = useState('')

  const apiUrl = import.meta.env.VITE_API_URL;

  const getTheRota = async () => {
    try {
      const response = await axios.post(`${apiUrl}/rota/generate-weekly`);
      setSuccessMessage(response.data.message);
    } catch (error) {
      console.error('Error Creating the Rota', error);
      setSuccessMessage(''); // Clear success message on error
    }
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
        {/* Success Message */}
        {successMessage && (
          <div className="w-full max-w-4xl mb-6">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        <div className="w-full max-w-4xl mb-8">
          <h3 className="text-3xl font-bold self-start">📅 Draft Rota Generator</h3>
          <p className='text-base my-4'>Generate a rota for a selected date range. The system will optimize assignments based on clinician availability and clinic requirements.</p>
          <button 
            onClick={() => getTheRota()} 
            className='bg-blue-700 py-2 px-4 rounded-lg text-white cursor-pointer text-sm hover:bg-blue-800'
          >
            Generate Draft Rota
          </button>
        </div>
      </div>
    </>
  )
}

export default RotaDraftGenerator