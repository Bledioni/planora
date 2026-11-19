import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="#f4f6fb" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}