import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.raz.dietapp',
  appName: 'Diet app',
  webDir: 'public',

  server: {
    url: 'https://diet-app-sigma-five.vercel.app',
    cleartext: true
  }
};

export default config;