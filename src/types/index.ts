export type Alignment = 'left' | 'center' | 'right';

export interface Slide {
  id: string;
  headline: string;
  caption: string;
  footer?: string; // New field for the footer
  isLoading: boolean;
  adjustedHeadline?: {
    wrappedText: string;
    fontSize: number;
  };
  adjustedCaption?: {
    wrappedText: string;
    fontSize: number;
  };
  adjustedFooter?: {
    wrappedText: string;
    fontSize: number;
  };
}

export interface Settings {
  background: {
    type: 'color' | 'image';
    value: string;
  };
  headline: {
    font: string;
    fontSize: number;
    color: string;
    alignment: Alignment;
    letterSpacing: number;
    lineHeight: number;
  };
  caption: {
    font: string;
    fontSize: number;
    color: string;
    alignment: Alignment;
    letterSpacing: number;
    lineHeight: number;
  };
  footer: { // New field for footer settings
    font: string;
    color: string;
    alignment: Alignment;
    letterSpacing: number;
    lineHeight: number;
  };
  dimension: {
    width: number;
    height: number;
  }
}
