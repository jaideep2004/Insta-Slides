"use client";

import type { Settings, Slide } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SlidePreview } from './slide-preview';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { downloadImage } from '@/lib/download';
import { useToast } from '@/hooks/use-toast';

interface PreviewAreaProps {
  slides: Slide[];
  settings: Settings;
  updateSlide: (id: string, updatedProps: Partial<Slide>) => void;
  adjustmentNonce: number;
}

export function PreviewArea({ slides, settings, updateSlide, adjustmentNonce }: PreviewAreaProps) {
  const { toast } = useToast();

  const handleDownloadAll = async () => {
    toast({
      title: "Downloading all slides...",
      description: "Your images are being generated and will download shortly."
    });
    for (const slide of slides) {
      await downloadImage(slide.id, `${slide.headline.substring(0, 20) || 'slide'}.png`);
      // Add a small delay between downloads to prevent browser issues
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    toast({
      title: "Download complete!",
      description: "All slides have been downloaded."
    });
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className='flex-row items-center justify-between'>
        <CardTitle>Preview</CardTitle>
        <Button onClick={handleDownloadAll}>
          <Download className="mr-2 h-4 w-4" /> Download All
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-4 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 p-4">
            {slides.map((slide) => (
              <SlidePreview
                key={slide.id}
                slide={slide}
                settings={settings}
                updateSlide={updateSlide}
                adjustmentNonce={adjustmentNonce}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

    