import { useAuth } from '@/app/context/Auth_Context'
import { Redirect } from 'expo-router'
import React from 'react'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router' 
import { useEffect } from 'react'

export default function ProfileScreen() {
    const {isLoggedIn} = useAuth()
    const router = useRouter()
    useEffect(() => {
        if (!isLoggedIn) {
          router.replace('/(auth)/login');
        }
      }, [isLoggedIn]);
    
      // Tránh render UI trước khi redirect xong
      if (!isLoggedIn) return null;
  return (
    <SafeAreaView>
      <Text>ProfileScreen</Text>
    </SafeAreaView>
  )
}