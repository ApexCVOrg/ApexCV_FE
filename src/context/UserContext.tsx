// context/UserContext.tsx
import { createContext, useContext } from 'react';

export type User = {
  id: string;
  role: 'admin' | 'user' | 'seller';
};

export const UserContext = createContext<User | null>(null);
export const useUser = () => useContext(UserContext);
