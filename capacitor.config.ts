
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.72ad2799607645da93545a28c99411d9',
  appName: 'costco-coin-cutter',
  webDir: 'dist',
  server: {
    url: 'https://72ad2799-6076-45da-9354-5a28c99411d9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic'
  }
};

export default config;
