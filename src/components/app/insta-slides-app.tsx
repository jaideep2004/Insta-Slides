"use client";

import { useState } from 'react';
import type { Settings, Slide } from '@/types';
import { EditorPanel } from './editor-panel';
import { PreviewArea } from './preview-area';
import { Presentation } from 'lucide-react';

const initialSlide: Slide = {
  id: `slide-${Date.now()}`,
  headline: "Your headline goes here",
  caption: "And your caption follows below. You can customize everything on the left!",
  isLoading: false,
};

const initialSettings: Settings = {
  background: { type: 'color', value: '#FFFFFF' },
  headline: {
    font: 'Poppins',
    color: '#0D0D0D',
    alignment: 'center',
    letterSpacing: -0.02,
    lineHeight: 1.2,
  },
  caption: {
    font: 'PT Sans',
    color: '#404040',
    alignment: 'center',
    letterSpacing: 0,
    lineHeight: 1.5,
  },
  dimension: {
    width: 1080,
    height: 1080,
  }
};

export function InstaSlidesApp() {
  const [slides, setSlides] = useState<Slide[]>([initialSlide]);
  const [settings, setSettings] = useState<Settings>(initialSettings);

  const addSlide = () => {
    setSlides([
      ...slides,
      { 
        id: `slide-${Date.now()}`,
        headline: 'New Slide Headline',
        caption: 'New slide caption.',
        isLoading: false 
      },
    ]);
  };

  const removeSlide = (id: string) => {
    if (slides.length > 1) {
      setSlides(slides.filter((slide) => slide.id !== id));
    }
  };

  const updateSlide = (id: string, updatedProps: Partial<Slide>) => {
    setSlides(slides.map(s => s.id === id ? { ...s, ...updatedProps } : s));
  };

  const updateSlideText = (id: string, part: 'headline' | 'caption', text: string) => {
    updateSlide(id, { [part]: text });
  };
  
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <Presentation className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-headline font-bold text-primary">InstaSlides</h1>
        </div>
      </header>

      <div className="flex-grow grid md:grid-cols-12 gap-4 p-4 overflow-hidden">
        <div className="md:col-span-4 lg:col-span-3 h-full overflow-hidden">
          <EditorPanel
            slides={slides}
            settings={settings}
            addSlide={addSlide}
            removeSlide={removeSlide}
            updateSlideText={updateSlideText}
            setSettings={setSettings}
          />
        </div>
        <div className="md:col-span-8 lg:col-span-9 h-full overflow-hidden">
          <PreviewArea 
            slides={slides}
            settings={settings}
            updateSlide={updateSlide}
          />
        </div>
      </div>
    </div>
  );
}
