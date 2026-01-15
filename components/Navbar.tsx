
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg border-b border-orange-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center rotate-3 shadow-orange-500/50 shadow-lg">
                <span className="text-white text-2xl font-bold">K</span>
            </div>
            <Link to="/" className="text-2xl font-bold font-outfit tracking-tighter hover:text-orange-400 transition-colors">
              KITSUNE <span className="text-orange-500">CARS</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8 font-medium">
              <Link
                to="/"
                className={`${
                  isActive('/') ? 'text-orange-500' : 'text-gray-300 hover:text-white'
                } px-3 py-2 transition-all duration-200`}
              >
                HOME
              </Link>
              <Link
                to="/inventory"
                className={`${
                  isActive('/inventory') ? 'text-orange-500' : 'text-gray-300 hover:text-white'
                } px-3 py-2 transition-all duration-200`}
              >
                INVENTARIO
              </Link>
              <Link
                to="/admin"
                className={`${
                  isActive('/admin') ? 'text-orange-500' : 'text-gray-300 hover:text-white'
                } px-3 py-2 transition-all duration-200`}
              >
                ADMINISTRACIÓN
              </Link>
            </div>
          </div>
          
          <div className="md:hidden">
            {/* Mobile menu button could go here if needed, keeping it simple as per request */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
