import { registerPlugin } from "@capacitor/core";

type TranslateOptions = {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
};

type TranslateResult = {
  translation: string;
};

interface OnDeviceTranslationPlugin {
  translate(options: TranslateOptions): Promise<TranslateResult>;
}

export const OnDeviceTranslation = registerPlugin<OnDeviceTranslationPlugin>(
  "OnDeviceTranslation",
);
