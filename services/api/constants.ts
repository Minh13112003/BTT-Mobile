import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl 
  || process.env.EXPO_PUBLIC_API_URL 
  || 'https://default-api.com';

export const URL_Login = `${API_BASE_URL}/api/v1/auth/login`;
export const URL_Register = `${API_BASE_URL}/api/v1/auth/register`;
export const URL_Logout = `${API_BASE_URL}/api/v1/auth/logout`