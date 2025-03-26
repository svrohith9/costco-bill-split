
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.billsplitter',
  appName: 'Bill Splitter',
  webDir: 'dist',
  server: {
    url: 'https://72ad2799-6076-45da-9354-5a28c99411d9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#ffffff',
    preferredContentMode: 'mobile',
    scheme: 'appscheme',
    cordovaSwiftVersion: '5.1',
    deploymentTarget: '13.0'
  },
  android: {
    backgroundColor: '#ffffff',
    buildOptions: {
      keystorePath: 'keystore.jks',
      keystorePassword: 'yourkeystorepassword',
      keystoreAlias: 'billsplitter',
      keystoreAliasPassword: 'youraliaspassword',
    },
    allowMixedContent: true,
    captureInput: true,
    webViewAllowFileAccess: true
  }
};

export default config;
