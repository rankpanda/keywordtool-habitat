import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { toast } from '../ui/Toast';
import { Loader2 } from 'lucide-react';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await userService.register(email, password, name);
      toast.success('Registo efetuado com sucesso. Aguarde aprovação.');
      navigate('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao efetuar registo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="text-3xl font-moonwalk font-bold text-center text-primary">
            RankPanda
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Crie a sua conta para começar
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#444638]">
                Nome
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#444638]">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#444638]">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#11190c] hover:bg-[#0a0f07] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#11190c] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Registar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}