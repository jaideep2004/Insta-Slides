export type Alignment = 'left' | 'center' | 'right';

export interface Slide {
  id: string;
  headline: string;
  caption: string;
  isLoading: boolean;
  adjustedHeadline?: {
    wrappedText: string;
    fontSize: number;
  };
  adjustedCaption?: {
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
    color: string;
    alignment: Alignment;
    letterSpacing: number;
    lineHeight: number;
  };
  caption: {
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
