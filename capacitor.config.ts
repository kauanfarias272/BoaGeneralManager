import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.constrictor.app',
  appName: 'Constrictor',
  webDir: 'dist',
  android: {
    buildOptions: {
      keystorePath: '../../boawallet.keystore',
      keystoreAlias: 'boawallet',
      keystorePassword: 'boawallet123',
      keystoreAliasPassword: 'boawallet123',
    }
  }
};

export default config;
