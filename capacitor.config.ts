import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lyriclingo.app",
  appName: "LyricLingo",
  webDir: ".output/public",
  android: {
    allowMixedContent: false,
  },
};

export default config;
