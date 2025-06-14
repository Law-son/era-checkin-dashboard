import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  BarChart2, 
  QrCode,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { path: '/dashboard/members', icon: Users, label: 'Members' },
  { path: '/dashboard/attendance', icon: CalendarCheck, label: 'Attendance' },
  { path: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/dashboard/scanner', icon: QrCode, label: 'QR Scanner' },
  { path: '/dashboard/reports', icon: FileSpreadsheet, label: 'Reports' },
  { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <>
      <motion.div
        initial={{ width: isOpen ? 240 : 64 }}
        animate={{ width: isOpen ? 240 : 64 }}
        className="bg-white h-screen border-r border-gray-200 relative hidden md:block"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className={`font-bold text-indigo-600 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            ERA Hub
          </h1>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1.5 hover:bg-gray-100"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Navigation Items */}
        <nav className="mt-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-4 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600
                ${isActive ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : ''}
              `}
            >
              <item.icon size={20} />
              <span className={`ml-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </motion.div>

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ width: 64 }}
        animate={{ width: 64 }}
        className="bg-white h-screen border-r border-gray-200 relative md:hidden"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="font-bold text-indigo-600 opacity-0">ERA</h1>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center justify-center px-4 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600
                ${isActive ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : ''}
              `}
              title={item.label}
            >
              <item.icon size={20} />
            </NavLink>
          ))}
        </nav>
      </motion.div>
    </>
  );
} 