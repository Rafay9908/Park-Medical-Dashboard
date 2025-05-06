import React from 'react'

function RotaDraftGenerator() {
  return (
   <>
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <div className="w-full max-w-4xl mb-8">
        <h3 className="text-3xl font-bold self-start">📅 Draft Rota Generator</h3>
        <p className='text-base my-4'>Generate a rota for a selected date range. The system will optimize assignments based on clinician availability and clinic requirements.</p>
        <button className='bg-blue-700 py-2 px-4 rounded-lg text-white cursor-pointer text-sm hover:bg-blue-800'>Generate Draft Rota</button>
      </div>
    </div>
   </>
  )
}

export default RotaDraftGenerator