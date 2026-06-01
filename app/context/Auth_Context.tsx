import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  accessToken: string | null;
  saveAuth: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    const checkToken = async () => {
        try{
            const token = await SecureStore.getItemAsync('accessToken');
            if (token) {
                setAccessToken(token);
                setIsLoggedIn(true);
            }
        }finally{
            setIsLoading(false);
        }
        checkToken();
    }

    }, []);
  if (isLoading) return null;

  const saveAuth = async (accessToken: string, refreshToken: string) => {
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    setAccessToken(accessToken);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    setAccessToken(null);
    setIsLoggedIn(false);
    
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, accessToken, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);