import { useAuth } from '@/context/Auth_Context'
import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
 


export default function ProfileScreen() {
    const {isLoggedIn} = useAuth()
    const router = useRouter()
    useEffect(() => {
        if (!isLoggedIn) {
          router.replace('/(root)/(auth)/login');
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