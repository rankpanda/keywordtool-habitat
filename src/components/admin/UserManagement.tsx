import React, { useState, useEffect } from 'react';
import { User, userService } from '../../services/userService';
import { toast } from '../ui/Toast';
import { Users, Check, X, Clock, Activity, Shield } from 'lucide-react';

interface LoginLog {
  id: string;
  userId: string;
  timestamp: string;
  success: boolean;
  ipAddress: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setIsLoading(true);
      // Get all users including the admin
      const allUsers = [
        {
          id: 'admin',
          email: 'rui@rankpanda.pt',
          name: 'Rui Admin',
          role: 'admin',
          status: 'approved',
          createdAt: new Date().toISOString()
        },
        ...userService.getUsers()
      ];

      const logs = userService.getLoginLogs();
      
      console.log('Loaded users:', allUsers); // Debug log
      setUsers(allUsers);
      setLoginLogs(logs);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, status: User['status']) => {
    try {
      await userService.updateUserStatus(userId, status);
      toast.success(`Estado do utilizador atualizado para ${status}`);
      loadData(); // Reload data after status change
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Erro ao atualizar estado do utilizador');
    }
  };

  const getStatusBadge = (status: User['status']) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    const icons = {
      approved: <Check className="h-4 w-4" />,
      rejected: <X className="h-4 w-4" />,
      pending: <Clock className="h-4 w-4" />
    };

    const labels = {
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      pending: 'Pendente'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        <span className="mr-1">{icons[status]}</span>
        {labels[status]}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Users Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#F3F1EE] to-[#E5E2DC] rounded-lg p-6">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-[#11190c]" />
            <h3 className="ml-2 text-lg font-medium text-[#11190c]">Total Utilizadores</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-[#11190c]">{users.length}</p>
        </div>
        
        <div className="bg-gradient-to-br from-[#F3F1EE] to-[#E5E2DC] rounded-lg p-6">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-[#11190c]" />
            <h3 className="ml-2 text-lg font-medium text-[#11190c]">Pendentes</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-[#11190c]">
            {users.filter(u => u.status === 'pending').length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#F3F1EE] to-[#E5E2DC] rounded-lg p-6">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-[#11190c]" />
            <h3 className="ml-2 text-lg font-medium text-[#11190c]">Ativos</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-[#11190c]">
            {users.filter(u => u.status === 'approved').length}
          </p>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#11190c]">Lista de Utilizadores</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acesso
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-[#e6ff00] flex items-center justify-center">
                          <span className="text-[#11190c] font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.role === 'admin' ? 'Administrador' : 'Utilizador'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-PT') : 'Nunca'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.role !== 'admin' && (
                      <div className="flex space-x-2">
                        {user.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(user.id, 'approved')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Aprovar
                          </button>
                        )}
                        {user.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(user.id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Rejeitar
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Login History */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#11190c]">Histórico de Acessos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilizador
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loginLogs.map((log) => {
                const user = users.find(u => u.id === log.userId);
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString('pt-PT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user?.name || 'Utilizador Desconhecido'}</div>
                      <div className="text-sm text-gray-500">{user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.success ? 'Sucesso' : 'Falha'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}