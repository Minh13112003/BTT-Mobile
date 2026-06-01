import { useAuth } from '@/app/context/Auth_Context';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
    const {isLoggedIn} = useAuth();

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search">
        <Icon sf="magnifyingglass" drawable="custom_search_drawable" />
        <Label>Search</Label>
      </NativeTabs.Trigger>

      {/* Create Properties */}
      <NativeTabs.Trigger name="saved">
        <Label>Saved</Label>
        <Icon sf="heart.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      
        <NativeTabs.Trigger name="profile">
          <Label>Profile</Label>
          <Icon sf="person.fill" drawable="custom_android_drawable" />
        </NativeTabs.Trigger>
      
    </NativeTabs>
  );
}
