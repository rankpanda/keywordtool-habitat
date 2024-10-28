import { toast } from '../components/ui/Toast';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  lastLogin?: string;
}

interface LoginLog {
  id: string;
  userId: string;
  timestamp: string;
  success: boolean;
  ipAddress: string;
}

const ADMIN_EMAIL = 'rui@rankpanda.pt';
const ADMIN_PASSWORD = 'bb212977923BB';

const USERS_KEY = 'rankpanda_users';
const LOGIN_LOGS_KEY = 'rankpanda_login_logs';

export const userService = {
  login: async (email: string, password: string): Promise<User> => {
    // Special handling for admin login
    if (email === ADMIN_EMAIL) {
      if (password !== ADMIN_PASSWORD) {
        console.error('Invalid admin password');
        throw new Error('Credenciais inválidas');
      }

      const adminUser: User = {
        id: 'admin',
        email: ADMIN_EMAIL,
        name: 'Rui Admin',
        role: 'admin',
        status: 'approved',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      
      // Log successful login
      userService.logLogin(adminUser.id, true);
      
      return adminUser;
    }

    // Regular user login
    const users = userService.getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    if (user.status !== 'approved') {
      throw new Error('Conta pendente de aprovação');
    }

    // In a real app, we would hash and compare passwords
    // For demo purposes, we're using plain text
    if (user.password !== password) {
      userService.logLogin(user.id, false);
      throw new Error('Credenciais inválidas');
    }

    user.lastLogin = new Date().toISOString();
    userService.updateUser(user);
    userService.logLogin(user.id, true);

    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    
    return userWithoutPassword;
  },

  register: async (email: string, password: string, name: string): Promise<void> => {
    const users = userService.getUsers();
    
    if (users.some(u => u.email === email)) {
      throw new Error('Email já registado');
    }

    const newUser: User & { password: string } = {
      id: crypto.randomUUID(),
      email,
      password, // In a real app, this would be hashed
      name,
      role: 'user',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  logout: () => {
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('currentUser');
  },

  isAdmin: (): boolean => {
    const user = userService.getCurrentUser();
    return user?.role === 'admin';
  },

  getUsers: (): (User & { password?: string })[] => {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  },

  updateUser: (user: User & { password?: string }): void => {
    const users = userService.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  updateUserStatus: async (userId: string, status: User['status']): Promise<void> => {
    const users = userService.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.status = status;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  logLogin: (userId: string, success: boolean): void => {
    const logs: LoginLog[] = JSON.parse(localStorage.getItem(LOGIN_LOGS_KEY) || '[]');
    logs.unshift({
      id: crypto.randomUUID(),
      userId,
      timestamp: new Date().toISOString(),
      success,
      ipAddress: 'Local' // In a real app, we would get the actual IP
    });
    
    // Keep only last 100 logs
    while (logs.length > 100) logs.pop();
    
    localStorage.setItem(LOGIN_LOGS_KEY, JSON.stringify(logs));
  },

  getLoginLogs: (): LoginLog[] => {
    return JSON.parse(localStorage.getItem(LOGIN_LOGS_KEY) || '[]');
  }
};