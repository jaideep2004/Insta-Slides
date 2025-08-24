"use client";

import { useEffect, useRef, useCallback } from 'react';
import type { Settings, Slide } from '@/types';
import { useDebounce } from '@/hooks/use-debounce';
import { autoAdjustText } from '@/ai/flows/auto-adjust-text';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { downloadImage } from '@/lib/download';
import { useToast } from '@/hooks/use-toast';

interface SlidePreviewProps {
  slide: Slide;
  settings: Settings;
  updateSlide: (id: string, updatedProps: Partial<Slide>) => void;
}

export function SlidePreview({ slide, settings, updateSlide }: SlidePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const debouncedHeadline = useDebounce(slide.headline, 500);
  const debouncedCaption = useDebounce(slide.caption, 500);
  const debouncedSettings = useDebounce(settings, 500);

  const runAutoAdjust = useCallback(async () => {
    if ((!debouncedHeadline && !debouncedCaption) || !previewRef.current) return;
    
    updateSlide(slide.id, { isLoading: true });

    try {
      const headlinePromise = debouncedHeadline ? autoAdjustText({
        text: debouncedHeadline,
        imageWidth: settings.dimension.width * 0.9, // 90% of width for padding
        imageHeight: settings.dimension.height * 0.5, // 50% of height
        font: settings.headline.font,
      }) : Promise.resolve(undefined);

      const captionPromise = debouncedCaption ? autoAdjustText({
        text: debouncedCaption,
        imageWidth: settings.dimension.width * 0.9,
        imageHeight: settings.dimension.height * 0.4, // 40% of height
        font: settings.caption.font,
      }) : Promise.resolve(undefined);

      const [adjustedHeadline, adjustedCaption] = await Promise.all([headlinePromise, captionPromise]);

      updateSlide(slide.id, {
        adjustedHeadline: adjustedHeadline ? { wrappedText: adjustedHeadline.wrappedText, fontSize: adjustedHeadline.fontSize } : undefined,
        adjustedCaption: adjustedCaption ? { wrappedText: adjustedCaption.wrappedText, fontSize: adjustedCaption.fontSize } : undefined,
        isLoading: false,
      });

    } catch (error) {
      console.error("AI adjustment failed:", error);
      toast({
        variant: "destructive",
        title: "AI Adjustment Error",
        description: "Could not adjust text. Please try again."
      });
      updateSlide(slide.id, { isLoading: false });
    }
  }, [debouncedHeadline, debouncedCaption, debouncedSettings, slide.id, updateSlide, toast, settings.dimension, settings.headline.font, settings.caption.font]);

  useEffect(() => {
    runAutoAdjust();
  }, [runAutoAdjust]);

  const handleDownload = () => {
    toast({
        title: "Preparing download...",
        description: "Your image is being generated."
    });
    downloadImage(slide.id, `${slide.headline.substring(0, 20) || 'slide'}.png`)
    .then(() => {
        toast({
            title: "Download started!",
        });
    })
    .catch((err) => {
        toast({
            variant: "destructive",
            title: "Download failed",
            description: "Could not generate image. Please try again."
        });
        console.error(err);
    });
  };

  const backgroundStyle = settings.background.type === 'image' 
    ? { backgroundImage: `url(${settings.background.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: settings.background.value };

  const headlineStyle = {
    fontFamily: `'${settings.headline.font}', sans-serif`,
    color: settings.headline.color,
    textAlign: settings.headline.alignment,
    letterSpacing: `${settings.headline.letterSpacing}em`,
    lineHeight: settings.headline.lineHeight,
    fontSize: slide.adjustedHeadline ? `${slide.adjustedHeadline.fontSize}px` : '24px',
  };

  const captionStyle = {
    fontFamily: `'${settings.caption.font}', sans-serif`,
    color: settings.caption.color,
    textAlign: settings.caption.alignment,
    letterSpacing: `${settings.caption.letterSpacing}em`,
    lineHeight: settings.caption.lineHeight,
    fontSize: slide.adjustedCaption ? `${slide.adjustedCaption.fontSize}px` : '16px',
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div
          id={slide.id}
          ref={previewRef}
          style={{ ...backgroundStyle, width: `${settings.dimension.width}px`, height: `${settings.dimension.height}px`,
          maxWidth: '100%',
          aspectRatio: `${settings.dimension.width} / ${settings.dimension.height}`
        }}
          className="flex flex-col justify-center items-center p-[5%] overflow-hidden relative"
        >
          {slide.isLoading ? (
            <div className="w-full h-full flex flex-col justify-center items-center gap-4">
              <Skeleton className="h-1/4 w-3/4" />
              <Skeleton className="h-1/2 w-full" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {slide.adjustedHeadline && <h2 style={headlineStyle} className="font-bold font-headline">{slide.adjustedHeadline.wrappedText}</h2>}
              {slide.adjustedCaption && <p style={captionStyle} className="font-body">{slide.adjustedCaption.wrappedText}</p>}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-2">
        <Button onClick={handleDownload} className="w-full" disabled={slide.isLoading}>
          {slide.isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}
