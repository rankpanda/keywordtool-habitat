import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Settings, LogOut } from 'lucide-react';
import { Navigation } from './Navigation';
import { userService } from '../../services/userService';
import { toast } from '../ui/Toast';
import { AdminSettings } from '../admin/AdminSettings';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const isAdmin = userService.isAdmin();

  const handleLogout = () => {
    userService.logout();
    toast.success('Sessão terminada com sucesso');
    navigate('/login');
  };

  return (
    <div className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-10 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex items-center justify-between h-16 px-4">
        <Link to="/" className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
          {!isCollapsed && (
            <span className="text-xl font-moonwalk font-bold text-primary">RankPanda</span>
          )}
        </Link>
        <button
          onClick={onToggleCollapse}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      <Navigation isCollapsed={isCollapsed} />

      {/* Settings Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200">
        <button
          onClick={() => !isCollapsed && setShowSettings(!showSettings)}
          className={`
            w-full flex items-center px-4 py-3 text-sm font-medium transition-colors
            ${isCollapsed ? 'justify-center' : ''}
            text-gray-600 hover:text-primary hover:bg-gray-50
          `}
        >
          <Settings className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Definições</span>}
        </button>

        {showSettings && !isCollapsed && (
          <div className="p-4 bg-white border-t border-gray-100">
            {isAdmin && <AdminSettings />}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors mt-4"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Terminar Sessão
            </button>
          </div>
        )}
      </div>
    </div>
  );
}