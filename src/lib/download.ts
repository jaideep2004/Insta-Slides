import { toPng } from 'html-to-image';

export const downloadImage = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }

  const dataUrl = await toPng(element, { 
    cacheBust: true, 
    pixelRatio: 2, // For higher quality
  });

  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.click();
};
