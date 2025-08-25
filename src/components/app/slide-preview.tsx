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
  adjustmentNonce: number;
}

export function SlidePreview({ slide, settings, updateSlide, adjustmentNonce }: SlidePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const debouncedHeadline = useDebounce(slide.headline, 500);
  const debouncedCaption = useDebounce(slide.caption, 500);
  const debouncedFooter = useDebounce(slide.footer, 500);
  
  const runAutoAdjust = useCallback(async (isManualTrigger: boolean = false) => {
    if ((!slide.headline && !slide.caption && !slide.footer) || !previewRef.current) {
        updateSlide(slide.id, {
        adjustedHeadline: undefined,
        adjustedCaption: undefined,
        adjustedFooter: undefined,
        isLoading: false,
        });
        return;
    };
    
    updateSlide(slide.id, { isLoading: true });

    try {
      const promises = [];
      const currentText = isManualTrigger ? slide : { headline: debouncedHeadline, caption: debouncedCaption, footer: debouncedFooter };

      if (currentText.headline) {
        promises.push(autoAdjustText({
          text: currentText.headline,
          imageWidth: settings.dimension.width * 0.9,
          imageHeight: settings.dimension.height * 0.4,
          font: settings.headline.font,
        }));
      } else {
        promises.push(Promise.resolve(undefined));
      }

      if (currentText.caption) {
        promises.push(autoAdjustText({
          text: currentText.caption,
          imageWidth: settings.dimension.width * 0.9,
          imageHeight: settings.dimension.height * 0.3,
          font: settings.caption.font,
        }));
      } else {
         promises.push(Promise.resolve(undefined));
      }
      
      if (currentText.footer) {
        promises.push(autoAdjustText({
            text: currentText.footer || '',
            imageWidth: settings.dimension.width * 0.9,
            imageHeight: settings.dimension.height * 0.1,
            font: settings.footer.font,
          }));
      } else {
         promises.push(Promise.resolve(undefined));
      }

      const [adjustedHeadline, adjustedCaption, adjustedFooter] = await Promise.all(promises);

      updateSlide(slide.id, {
        adjustedHeadline: adjustedHeadline ? { wrappedText: adjustedHeadline.wrappedText, fontSize: adjustedHeadline.fontSize } : undefined,
        adjustedCaption: adjustedCaption ? { wrappedText: adjustedCaption.wrappedText, fontSize: adjustedCaption.fontSize } : undefined,
        adjustedFooter: adjustedFooter ? { wrappedText: adjustedFooter.wrappedText, fontSize: adjustedFooter.fontSize } : undefined,
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
  }, [slide, debouncedHeadline, debouncedCaption, debouncedFooter, settings, updateSlide, toast]);

  // Effect for automatic adjustment on text change (debounced)
  useEffect(() => {
    runAutoAdjust();
  }, [debouncedHeadline, debouncedCaption, debouncedFooter]);

  // Effect for manual adjustment trigger
  useEffect(() => {
    if (adjustmentNonce > 0) {
      runAutoAdjust(true);
    }
  }, [adjustmentNonce, runAutoAdjust]);


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

  const footerStyle = {
    fontFamily: `'${settings.footer.font}', sans-serif`,
    color: settings.footer.color,
    textAlign: settings.footer.alignment,
    letterSpacing: `${settings.footer.letterSpacing}em`,
    lineHeight: settings.footer.lineHeight,
    fontSize: slide.adjustedFooter ? `${slide.adjustedFooter.fontSize}px` : '12px',
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
              <Skeleton className="h-1/6 w-1/2" />
            </div>
          ) : (
             <div className="w-full h-full flex flex-col justify-between items-center">
                <div className="flex-grow flex flex-col justify-center items-center gap-4 w-full">
                  {slide.adjustedHeadline && <h2 style={headlineStyle} className="font-bold font-headline">{slide.adjustedHeadline.wrappedText}</h2>}
                  {slide.adjustedCaption && <p style={captionStyle} className="font-body">{slide.adjustedCaption.wrappedText}</p>}
                </div>
                {slide.adjustedFooter && (
                  <div className="w-full pb-4">
                     <p style={footerStyle} className="font-body text-xs">{slide.adjustedFooter.wrappedText}</p>
                  </div>
                )}
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

    