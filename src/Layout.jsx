import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function Layout() {
  const [isOpen, setIsOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Only show navigation if user is authenticated
  if (!user) {
    return <Outlet />; // Just render content for non-authenticated pages
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-gray-800 text-white p-6 space-y-4 transition-all duration-300 ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none cursor-pointer"
          >
            {isOpen ? "⮜" : "⮞"}
          </button>
          {isOpen && (
            <button 
              onClick={handleLogout}
              className="text-sm bg-red-500 hover:bg-red-600 px-2 py-1 rounded cursor-pointer"
            >
              Logout
            </button>
          )}
        </div>

        {isOpen && (
          <div className="mb-6">
            <img
              className="w-36"
              src="https://msgsndr-private.storage.googleapis.com/companyPhotos/0c6e2ac1-9ff0-409a-84df-cd707aa9e15a.png"
              alt="logo"
            />
            <div className="mt-4 text-sm">
              <p className="font-bold">{user.name}</p>
              <p className="text-gray-300">{user.email}</p>
              <p className="text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-3">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "bg-gray-700 p-2 rounded font-bold"
                : "hover:bg-gray-700 p-2 rounded"
            }
          >
            {isOpen ? "Dashboard" : "🏠"}
          </NavLink>

          <NavLink
            to="/clinics"
            className={({ isActive }) =>
              isActive
                ? "bg-gray-700 p-2 rounded font-bold"
                : "hover:bg-gray-700 p-2 rounded"
            }
          >
            {isOpen ? "Clinics" : "🏥"}
          </NavLink>

          <NavLink
            to="/clinicians"
            className={({ isActive }) =>
              isActive
                ? "bg-gray-700 p-2 rounded font-bold"
                : "hover:bg-gray-700 p-2 rounded"
            }
          >
            {isOpen ? "Clinicians" : "👨‍⚕️"}
          </NavLink>

          <NavLink
            to="/rota-draft"
            className={({ isActive }) =>
              isActive
                ? "bg-gray-700 p-2 rounded font-bold"
                : "hover:bg-gray-700 p-2 rounded"
            }
          >
            {isOpen ? "Rota Draft" : "📋"}
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              isActive
                ? "bg-gray-700 p-2 rounded font-bold"
                : "hover:bg-gray-700 p-2 rounded"
            }
          >
            {isOpen ? "Analytics" : "📊"}
          </NavLink>

          {/* Additional icons for collapsed state */}
          {!isOpen && (
            <>
              <NavLink
                to="/main-rota"
                className={({ isActive }) =>
                  isActive
                    ? "bg-gray-700 p-2 rounded font-bold"
                    : "hover:bg-gray-700 p-2 rounded"
                }
              >
                🗓️
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  isActive
                    ? "bg-gray-700 p-2 rounded font-bold"
                    : "hover:bg-gray-700 p-2 rounded"
                }
              >
                ⚙️
              </NavLink>
            </>
          )}

          {/* Full text links when open */}
          {isOpen && (
            <>
              <NavLink
                to="/main-rota"
                className={({ isActive }) =>
                  isActive
                    ? "bg-gray-700 p-2 rounded font-bold"
                    : "hover:bg-gray-700 p-2 rounded"
                }
              >
                Main Rota
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  isActive
                    ? "bg-gray-700 p-2 rounded font-bold"
                    : "hover:bg-gray-700 p-2 rounded"
                }
              >
                Settings
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}