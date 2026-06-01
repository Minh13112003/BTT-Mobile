import { useAuth } from '@/app/context/Auth_Context';
import { login } from '@/services/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { saveAuth } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await login({
        email,
        password,
      });

      await saveAuth(
        res.data.accessToken,
        res.data.refreshToken
      );

      router.replace("/(root)/(tabs)/profile");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Email hoặc mật khẩu không đúng'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#2563EB', '#4F46E5']}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : 'height'
          }
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              paddingHorizontal: 24,
            }}
          >
            {/* Header */}
            <View className="items-center mb-10">
              <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center mb-5">
                <Ionicons
                  name="person"
                  size={48}
                  color="white"
                />
              </View>

              <Text className="text-white text-4xl font-bold">
                Welcome Back
              </Text>

              <Text className="text-white/80 text-base mt-2">
                Đăng nhập để tiếp tục
              </Text>
            </View>

            {/* Card */}
            <View className="bg-white rounded-[32px] p-6 shadow-lg">
              {/* Email */}
              <View
                className={`flex-row items-center rounded-2xl border px-4 mb-4 ${
                  focusedField === 'email'
                    ? 'border-blue-500'
                    : 'border-gray-200'
                }`}
              >
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color={
                    focusedField === 'email'
                      ? '#2563EB'
                      : '#94A3B8'
                  }
                />

                <TextInput
                  className="flex-1 py-4 ml-3 text-gray-900"
                  placeholder="Nhập email"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() =>
                    setFocusedField('email')
                  }
                  onBlur={() =>
                    setFocusedField('')
                  }
                />
              </View>

              {/* Password */}
              <View
                className={`flex-row items-center rounded-2xl border px-4 ${
                  focusedField === 'password'
                    ? 'border-blue-500'
                    : 'border-gray-200'
                }`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color={
                    focusedField === 'password'
                      ? '#2563EB'
                      : '#94A3B8'
                  }
                />

                <TextInput
                  className="flex-1 py-4 ml-3 text-gray-900"
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() =>
                    setFocusedField('password')
                  }
                  onBlur={() =>
                    setFocusedField('')
                  }
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  <Ionicons
                    name={
                      showPassword
                        ? 'eye-outline'
                        : 'eye-off-outline'
                    }
                    size={22}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

              {/* Error */}
              {error ? (
                <View className="bg-red-50 border border-red-200 rounded-xl mt-4 p-3">
                  <Text className="text-red-500 text-sm">
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Forgot Password */}
              <TouchableOpacity className="self-end mt-4">
                <Text className="text-blue-600 font-medium">
                  Quên mật khẩu?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className="bg-blue-600 rounded-2xl py-4 items-center mt-6"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-lg">
                    Đăng nhập
                  </Text>
                )}
              </TouchableOpacity>

              {/* Register */}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

