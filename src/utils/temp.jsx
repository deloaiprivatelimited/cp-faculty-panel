// src/components/Sidebar.jsx
import React, { useState } from "react";
import { Users, FileText, Globe, HelpCircle, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../_Features/Auth/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Sidebar routes
  const navItems = [
    { label: "Students", icon: <Users />, path: "/" },
    { label: "Test", icon: <FileText />, path: "/test" },
    {
      label: "Global",
      icon: <Globe />,
      subItems: [
        { label: "MCQ's", path: "/global/mcq" },
        { label: "Rearrange", path: "/global/rearrange" },
        { label: "Coding", path: "/global/coding" },
      ],
    },
    {
      label: "My Q's",
      icon: <HelpCircle />,
      subItems: [
        { label: "MCQ's", path: "/myqs/mcq" },
        { label: "Rearrange", path: "/myqs/rearrange" },
        { label: "Coding", path: "/myqs/coding" },
      ],
    },
  ];

  return (
    <aside className="w-20 h-screen fixed left-0 top-0 bg-white shadow-lg flex flex-col items-center py-6 overflow-hidden z-20">
      {/* Logo */}
      <div className="w-10 h-10 bg-[#4CA466] rounded-lg flex items-center justify-center mb-8">
        <span className="text-white font-bold text-lg">Cp</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-6 flex-1">
        {navItems.map((item) =>
          item.subItems ? (
            <SidebarDropdown
              key={item.label}
              item={item}
              active={location.pathname.startsWith(item.path || "")}
              isOpen={openMenu === item.label}
              toggleOpen={() =>
                setOpenMenu(openMenu === item.label ? null : item.label)
              }
              navigate={navigate}
              location={location}
            />
          ) : (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          )
        )}
      </nav>

      {/* Logout */}
      <div className="mt-auto">
        <SidebarItem icon={<LogOut />} label="Logout" onClick={handleLogout} />
      </div>
    </aside>
  );
};

// Sidebar Item
const SidebarItem = ({ icon, label, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center group cursor-pointer"
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200
        ${active ? "bg-[#4CA466]" : "bg-gray-100 group-hover:bg-[#4CA466]"}`}
      >
        {React.cloneElement(icon, {
          className: `w-5 h-5 ${
            active ? "text-white" : "text-gray-500 group-hover:text-white"
          }`,
        })}
      </div>
      <span
        className={`text-xs mt-1 font-medium transition-colors duration-200
        ${active ? "text-[#4CA466]" : "text-gray-600 group-hover:text-[#4CA466]"}`}
      >
        {label}
      </span>
    </div>
  );
};

// Dropdown for subitems
const SidebarDropdown = ({ item, active, isOpen, toggleOpen, navigate, location }) => {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Parent item */}
      <div
        onClick={toggleOpen}
        className="flex flex-col items-center group cursor-pointer"
      >
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200
          ${active ? "bg-[#4CA466]" : "bg-gray-100 group-hover:bg-[#4CA466]"}`}
        >
          {React.cloneElement(item.icon, {
            className: `w-5 h-5 ${
              active ? "text-white" : "text-gray-500 group-hover:text-white"
            }`,
          })}
        </div>
        <span
          className={`text-xs mt-1 font-medium transition-colors duration-200
          ${active ? "text-[#4CA466]" : "text-gray-600 group-hover:text-[#4CA466]"}`}
        >
          {item.label}
        </span>
        <ChevronDown
          className={`w-4 h-4 mt-1 transition-transform ${
            isOpen ? "rotate-180 text-[#4CA466]" : "text-gray-400"
          }`}
        />
      </div>

      {/* Subitems */}
      {isOpen && (
        <div className="flex flex-col items-center space-y-3 mt-2">
          {item.subItems.map((sub) => (
            <div
              key={sub.label}
              onClick={() => navigate(sub.path)}
              className="flex flex-col items-center cursor-pointer"
            >
              <span
                className={`text-xs font-medium transition-colors duration-200
                ${
                  location.pathname === sub.path
                    ? "text-[#4CA466]"
                    : "text-gray-600 hover:text-[#4CA466]"
                }`}
              >
                {sub.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
