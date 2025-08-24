"use client";

import type { Settings, Slide } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '../ui/scroll-area';

interface EditorPanelProps {
  slides: Slide[];
  settings: Settings;
  addSlide: () => void;
  removeSlide: (id: string) => void;
  updateSlideText: (id: string, part: 'headline' | 'caption', text: string) => void;
  setSettings: (settings: Settings) => void;
}

const fonts = ['Poppins', 'PT Sans', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald'];
const alignments = ['left', 'center', 'right'];

export function EditorPanel({
  slides,
  settings,
  addSlide,
  removeSlide,
  updateSlideText,
  setSettings,
}: EditorPanelProps) {

  const handleSettingsChange = <T extends keyof Settings, K extends keyof Settings[T]>(
    group: T,
    key: K,
    value: Settings[T][K]
  ) => {
    setSettings({
      ...settings,
      [group]: {
        ...settings[group],
        [key]: value,
      },
    });
  };

  const handleBackgroundValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (settings.background.type === 'color') {
      handleSettingsChange('background', 'value', e.target.value);
    } else {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            handleSettingsChange('background', 'value', event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-0 flex-grow">
        <Tabs defaultValue="slides" className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-5 rounded-none rounded-t-lg">
            <TabsTrigger value="slides">Slides</TabsTrigger>
            <TabsTrigger value="background">Background</TabsTrigger>
            <TabsTrigger value="headline">Headline</TabsTrigger>
            <TabsTrigger value="caption">Caption</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-grow">
            <div className="p-4">
              <TabsContent value="slides">
                <div className="space-y-4">
                  {slides.map((slide, index) => (
                    <Card key={slide.id}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <Label htmlFor={`headline-${slide.id}`}>Slide {index + 1}</Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSlide(slide.id)}
                            disabled={slides.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          id={`headline-${slide.id}`}
                          placeholder="Headline..."
                          value={slide.headline}
                          onChange={(e) => updateSlideText(slide.id, 'headline', e.target.value)}
                          className='font-headline'
                        />
                        <Textarea
                          id={`caption-${slide.id}`}
                          placeholder="Caption..."
                          value={slide.caption}
                          onChange={(e) => updateSlideText(slide.id, 'caption', e.target.value)}
                        />
                      </CardContent>
                    </Card>
                  ))}
                  <Button onClick={addSlide} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Slide
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="background">
                <div className="space-y-4">
                  <Select
                    value={settings.background.type}
                    onValueChange={(value: 'color' | 'image') => handleSettingsChange('background', 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Background Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">Color</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Label>{settings.background.type === 'color' ? 'Color' : 'Image'}</Label>
                    <Input
                      type={settings.background.type === 'color' ? 'color' : 'file'}
                      value={settings.background.type === 'color' ? settings.background.value : ''}
                      onChange={handleBackgroundValueChange}
                      className={settings.background.type === 'color' ? 'p-1 h-10 w-20' : 'flex-1'}
                      accept={settings.background.type === 'image' ? 'image/*' : undefined}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="headline">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Font</Label>
                    <Select value={settings.headline.font} onValueChange={(v) => handleSettingsChange('headline', 'font', v)}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        {fonts.map(font => <SelectItem key={font} value={font}>{font}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Color</Label>
                    <Input type="color" value={settings.headline.color} onChange={(e) => handleSettingsChange('headline', 'color', e.target.value)} className='p-1 h-10 w-20'/>
                  </div>
                  <div className="grid gap-2">
                    <Label>Alignment</Label>
                    <Select value={settings.headline.alignment} onValueChange={(v) => handleSettingsChange('headline', 'alignment', v)}>
                       <SelectTrigger><SelectValue/></SelectTrigger>
                       <SelectContent>
                        {alignments.map(align => <SelectItem key={align} value={align} className='capitalize'>{align}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Letter Spacing: {settings.headline.letterSpacing.toFixed(2)}</Label>
                    <Slider value={[settings.headline.letterSpacing]} onValueChange={([v]) => handleSettingsChange('headline', 'letterSpacing', v)} min={-0.1} max={0.2} step={0.01} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Line Height: {settings.headline.lineHeight.toFixed(2)}</Label>
                    <Slider value={[settings.headline.lineHeight]} onValueChange={([v]) => handleSettingsChange('headline', 'lineHeight', v)} min={0.8} max={2} step={0.05} />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="caption">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Font</Label>
                    <Select value={settings.caption.font} onValueChange={(v) => handleSettingsChange('caption', 'font', v)}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        {fonts.map(font => <SelectItem key={font} value={font}>{font}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Color</Label>
                    <Input type="color" value={settings.caption.color} onChange={(e) => handleSettingsChange('caption', 'color', e.target.value)} className='p-1 h-10 w-20' />
                  </div>
                  <div className="grid gap-2">
                    <Label>Alignment</Label>
                    <Select value={settings.caption.alignment} onValueChange={(v) => handleSettingsChange('caption', 'alignment', v)}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        {alignments.map(align => <SelectItem key={align} value={align} className='capitalize'>{align}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Letter Spacing: {settings.caption.letterSpacing.toFixed(2)}</Label>
                    <Slider value={[settings.caption.letterSpacing]} onValueChange={([v]) => handleSettingsChange('caption', 'letterSpacing', v)} min={-0.1} max={0.2} step={0.01} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Line Height: {settings.caption.lineHeight.toFixed(2)}</Label>
                    <Slider value={[settings.caption.lineHeight]} onValueChange={([v]) => handleSettingsChange('caption', 'lineHeight', v)} min={0.8} max={2} step={0.05} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="layout">
                 <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Image Width (px)</Label>
                    <Input type="number" value={settings.dimension.width} onChange={(e) => handleSettingsChange('dimension', 'width', parseInt(e.target.value, 10))} />
                  </div>
                   <div className="grid gap-2">
                    <Label>Image Height (px)</Label>
                    <Input type="number" value={settings.dimension.height} onChange={(e) => handleSettingsChange('dimension', 'height', parseInt(e.target.value, 10))} />
                  </div>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
