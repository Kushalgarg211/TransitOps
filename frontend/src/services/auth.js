import apiClient, { handleApiWithFallback } from './api';

export const loginUser = async (email, password) => {
  return handleApiWithFallback(
    () => apiClient.post('/auth/login', { email, password }),
    () => {
      let role = 'Fleet Manager';
      const cleanEmail = email.toLowerCase();
      if (cleanEmail.includes('dispatch')) role = 'Dispatcher';
      else if (cleanEmail.includes('safety')) role = 'Safety Officer';
      else if (cleanEmail.includes('finance') || cleanEmail.includes('analyst')) role = 'Financial Analyst';

      const mockToken = 'mock_jwt_token_for_' + role.replace(/\s+/g, '_').toLowerCase();
      return {
        token: mockToken,
        user: {
          email,
          role,
          name: role === 'Fleet Manager' ? 'Sarah Jenkins' 
                : role === 'Dispatcher' ? 'Marcus Brody' 
                : role === 'Safety Officer' ? 'Elena Rostova' 
                : 'David Vance',
          avatar: role === 'Fleet Manager' ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
                  : role === 'Dispatcher' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
                  : role === 'Safety Officer' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
                  : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        }
      };
    }
  );
};
