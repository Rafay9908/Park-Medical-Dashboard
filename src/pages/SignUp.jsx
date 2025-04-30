import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation after signup

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Hook to navigate after successful signup

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://your-api.com/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token); // store token for later auth
        alert("Signup successful!");
        // Navigate to the dashboard or wherever
        navigate("/"); // Redirect to homepage or login page
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      alert("An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create an Account</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            Sign Up
          </button>
        </form>

        <div className="my-6 flex items-center justify-between">
          <hr className="w-full border-gray-300" />
          <span className="mx-2 text-gray-500">or</span>
          <hr className="w-full border-gray-300" />
        </div>

        <button
          className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition cursor-pointer"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span className="text-gray-700">Sign up with Google</span>
        </button>

        {/* Link for already having an account */}
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600">Already have an account? </span>
          <button
            onClick={() => navigate("/login")} // Assuming you have a login route
            className="text-blue-600 font-medium hover:underline cursor-pointer"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
