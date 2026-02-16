import { CapacitorConfig } from '@capacitor/cli';

const config = {
  appId: 'com.coding404.app',
  appName: 'Coding404',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#6366f1',
      showSpinner: true,
      spinnerColor: '#ffffff'
    }
  }
};

export default config;
