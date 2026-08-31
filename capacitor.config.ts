import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'org.olowintegrity.teachpro',
  appName: 'TeachPro',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config
