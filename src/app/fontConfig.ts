// fontConfig.ts
import { fonts } from './fonts';

export type FontType = keyof typeof fonts;

export interface FontConfig {
  primary: FontType;
  secondary: FontType;
  mono: FontType;
}

// Change these values to switch fonts globally
export const fontConfig: FontConfig = {
  primary: 'inter', // Body text, tables, forms
  secondary: 'montserrat', // Headings, buttons, navigation
  mono: 'geistMono', // Code, IDs, serial numbers
};

// Helper to get font variables for className
export const getFontVariables = () => {
  const primary = fonts[fontConfig.primary];
  const secondary = fonts[fontConfig.secondary];
  const mono = fonts[fontConfig.mono];

  return `${primary.variable} ${secondary.variable} ${mono.variable}`;
};

// Helper to get primary font className
export const getPrimaryFont = () => {
  return fonts[fontConfig.primary].className;
};
