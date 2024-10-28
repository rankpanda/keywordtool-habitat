import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Store, KeyRound, Users, Layers } from 'lucide-react';
import { userService } from '../../services/userService';

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

interface NavigationProps {
  isCollapsed: boolean;
}

export function Navigation({ isCollapsed }: NavigationProps) {
  const location = useLocation();
  const isAdmin = userService.getCurrentUser()?.role === 'admin';
  const [pendingUsers, setPendingUsers] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      const users = userService.getUsers();
      const pending = users.filter(user => user.status === 'pending').length;
      setPendingUsers(pending);

      const interval = setInterval(() => {
        const currentUsers = userService.getUsers();
        const currentPending = currentUsers.filter(user => user.status === 'pending').length;
        setPendingUsers(currentPending);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const navigation: NavigationItem[] = [
    {
      name: 'Contexto',
      path: '/',
      icon: Store
    },
    {
      name: 'Keywords',
      path: '/keywords',
      icon: KeyRound
    },
    {
      name: 'Clusters',
      path: '/clusters',
      icon: Layers
    }
  ];

  if (isAdmin) {
    navigation.push({
      name: 'Utilizadores',
      path: '/users',
      icon: Users,
      adminOnly: true
    });
  }

  return (
    <nav className="p-4 space-y-2">
      {navigation.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`
            relative flex items-center px-4 py-2 rounded-lg transition-colors
            ${isCollapsed ? 'justify-center' : ''}
            ${location.pathname === item.path
              ? 'bg-secondary-lime/10 text-primary'
              : 'text-gray-600 hover:text-primary hover:bg-gray-50'
            }
          `}
        >
          <item.icon className={`h-5 w-5 ${location.pathname === item.path ? 'text-primary' : ''}`} />
          <span className={`ml-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            {item.name}
          </span>
          
          {item.path === '/users' && pendingUsers > 0 && (
            <span className={`
              absolute ${isCollapsed ? 'top-1 right-1' : 'top-2 right-2'}
              flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white
              animate-pulse
            `}>
              {pendingUsers}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}