"use client";

import { useState, useEffect, useCallback, useTransition } from 'react';
import type { Settings, Slide } from '@/types';
import { EditorPanel } from './editor-panel';
import { PreviewArea } from './preview-area';
import { Presentation, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const initialSettings: Settings = {
  background: { type: 'color', value: '#FFFFFF' },
  headline: {
    font: 'Poppins',
    fontSize: 96,
    color: '#0D0D0D',
    alignment: 'center',
    letterSpacing: -0.02,
    lineHeight: 1.2,
  },
  caption: {
    font: 'PT Sans',
    fontSize: 36,
    color: '#404040',
    alignment: 'center',
    letterSpacing: 0,
    lineHeight: 1.5,
  },
  footer: {
    font: 'PT Sans',
    color: '#808080',
    alignment: 'center',
    letterSpacing: 0,
    lineHeight: 1.4,
  },
  dimension: {
    width: 1080,
    height: 1080,
  }
};

const initialBulkText = `🚀 OpenAI GPT-5 launches today
Faster, smarter, and more reliable than ever.
Source: OpenAI

🤖 Anthropic releases Claude Opus
Built to rival GPT-5 with reasoning skills.
Source: Anthropic`;

export function InstaSlidesApp() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [bulkText, setBulkText] = useState(initialBulkText);
  const [isClient, setIsClient] = useState(false);
  const [isAdjustingAll, setIsAdjustingAll] = useState(false);
  const [adjustmentNonce, setAdjustmentNonce] = useState(0);

  const parseBulkText = useCallback((text: string): Slide[] => {
    if (!text.trim()) {
        return [{
            id: `slide-${Date.now()}-0`,
            headline: 'Your headline goes here',
            caption: 'And your caption follows below. You can customize everything on the left!',
            footer: 'Source: Your name',
            isLoading: false,
          }];
    }
    const slideBlocks = text.split(/\n\s*\n/);
    return slideBlocks.map((block, index) => {
      const lines = block.trim().split('\n');
      const headline = lines[0] || '';
      const footerLine = lines.find(line => line.startsWith('Source:'));
      const captionLines = lines.slice(1).filter(line => !line.startsWith('Source:'));
      const caption = captionLines.join('\n');
      const footer = footerLine ? footerLine.replace('Source:', '').trim() : undefined;

      return {
        id: `slide-${Date.now()}-${index}`,
        headline,
        caption,
        footer,
        isLoading: false,
      };
    });
  }, []);

  useEffect(() => {
    setIsClient(true);
    setSlides(parseBulkText(initialBulkText));
  }, [parseBulkText, initialBulkText]);

  const memoizedSetSettings = useCallback((newSettings: Settings | ((s: Settings) => Settings)) => {
    setSettings(newSettings);
  }, []);

  const regenerateSlides = useCallback(() => {
    setSlides(parseBulkText(bulkText));
  }, [bulkText, parseBulkText]);


  const addSlide = useCallback(() => {
    setSlides((prevSlides) => [
      ...prevSlides,
      {
        id: `slide-${Date.now()}`,
        headline: 'New Slide Headline',
        caption: 'New slide caption.',
        footer: 'Source:',
        isLoading: false,
      },
    ]);
  }, []);

  const removeSlide = useCallback((id: string) => {
    setSlides((prevSlides) => {
      if (prevSlides.length > 1) {
        return prevSlides.filter((slide) => slide.id !== id);
      }
      return prevSlides;
    });
  }, []);

  const updateSlide = useCallback((id: string, updatedProps: Partial<Slide>) => {
    setSlides(slides => slides.map(s => s.id === id ? { ...s, ...updatedProps } : s));
  }, []);

  const updateSlideText = useCallback((id: string, part: 'headline' | 'caption' | 'footer', text: string) => {
    updateSlide(id, { [part]: text });
  }, [updateSlide]);
  
  const triggerAllSlidesAdjustment = useCallback(async () => {
    setIsAdjustingAll(true);
    setAdjustmentNonce(n => n + 1);
    // A timeout to allow all slides to receive the nonce update before completion
    setTimeout(() => {
       setIsAdjustingAll(false);
    }, slides.length * 100);
  }, [slides.length]);


  if (!isClient) {
    return null; // Or a loading spinner
  }

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
        <div className="md:col-span-4 lg:col-span-3 h-full overflow-y-auto flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Input Text
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="bulk-text" className="text-sm text-muted-foreground">Paste your content here to generate slides.</Label>
              <Textarea
                id="bulk-text"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={10}
                className="w-full"
                placeholder="Paste your text here..."
              />
              <Button onClick={regenerateSlides} className="w-full">
                Regenerate Slides
              </Button>
            </CardContent>
          </Card>
          <EditorPanel
            slides={slides}
            settings={settings}
            addSlide={addSlide}
            removeSlide={removeSlide}
            updateSlideText={updateSlideText}
            setSettings={memoizedSetSettings}
            triggerAllSlidesAdjustment={triggerAllSlidesAdjustment}
            isAdjustingAll={isAdjustingAll}
          />
        </div>
        <div className="md:col-span-8 lg:col-span-9 h-full overflow-hidden">
          <PreviewArea 
            slides={slides}
            settings={settings}
            updateSlide={updateSlide}
            adjustmentNonce={adjustmentNonce}
          />
        </div>
      </div>
    </div>
  );
}
