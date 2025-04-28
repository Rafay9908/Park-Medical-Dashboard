import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { NavLink } from "react-router-dom";

export default function Layout() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-gray-800 text-white p-6 space-y-4 transition-all duration-300 ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mb-6 text-white focus:outline-none cursor-pointer"
        >
          {isOpen ? "⮜" : "⮞"}
        </button>

        <img
          className="w-36"
          src="https://msgsndr-private.storage.googleapis.com/companyPhotos/0c6e2ac1-9ff0-409a-84df-cd707aa9e15a.png"
          alt="logo"
        />

        <nav className="flex flex-col gap-3">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "bg-gray-700 p-2 rounded font-bold"
                : "hover:bg-gray-700 p-2 rounded"
            }
          >
            {isOpen && "Dashboard"}
          </NavLink>

          <NavLink
            to="/clinics"
            className={({ isActive }) =>
              isActive
                ? "bg-gray-700 p-2 rounded font-bold"
                : "hover:bg-gray-700 p-2 rounded"
            }
          >
            {isOpen && "Clinics"}
          </NavLink>

          <NavLink
            to="/clinicians"
            className={({ isActive }) =>
              isActive
                ? "bg-gray-700 p-2 rounded font-bold"
                : "hover:bg-gray-700 p-2 rounded"
            }
          >
            {isOpen && "Clinicians"}
          </NavLink>

          <NavLink
            to="/rota-draft"
            className={({ isActive }) =>
              isActive
                ? "bg-gray-700 p-2 rounded font-bold"
                : "hover:bg-gray-700 p-2 rounded"
            }
          >
            {isOpen && "Rota Draft Generator"}
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              isActive
                ? "bg-gray-700 p-2 rounded font-bold"
                : "hover:bg-gray-700 p-2 rounded"
            }
          >
            {isOpen && "Analytics"}
          </NavLink>

          <NavLink
            to="/main-rota"
            className={({ isActive }) =>
              isActive
                ? "bg-gray-700 p-2 rounded font-bold"
                : "hover:bg-gray-700 p-2 rounded"
            }
          >
            {isOpen && "Main Rota"}
          </NavLink>

          <NavLink
            to="/shift-slots"
            className={({ isActive }) =>
              isActive
                ? "bg-gray-700 p-2 rounded font-bold"
                : "hover:bg-gray-700 p-2 rounded"
            }
          >
            {isOpen && "Shift Slots"}
          </NavLink>

          <NavLink
            to="/historical-booking"
            className={({ isActive }) =>
              isActive
                ? "bg-gray-700 p-2 rounded font-bold"
                : "hover:bg-gray-700 p-2 rounded"
            }
          >
            {isOpen && "Historical Booking"}
          </NavLink>

          <NavLink
            to="/travel-cost"
            className={({ isActive }) =>
              isActive
                ? "bg-gray-700 p-2 rounded font-bold"
                : "hover:bg-gray-700 p-2 rounded"
            }
          >
            {isOpen && "Travel Cost Planner"}
          </NavLink>

          <NavLink
            to="/rota-settings"
            className={({ isActive }) =>
              isActive
                ? "bg-gray-700 p-2 rounded font-bold"
                : "hover:bg-gray-700 p-2 rounded"
            }
          >
            {isOpen && "Rota Settings"}
          </NavLink>

          <NavLink
            to="/preferences-constraints"
            className={({ isActive }) =>
              isActive
                ? "bg-gray-700 p-2 rounded font-bold"
                : "hover:bg-gray-700 p-2 rounded"
            }
          >
            {isOpen && "Preferences & Constraints"}
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
