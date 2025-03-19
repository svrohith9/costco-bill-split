
import React, { useRef, useState } from 'react';
import { useBill } from '@/context/BillContext';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

const BillCapture: React.FC = () => {
  const { setCurrentImage, setActiveStep, setIsAnalyzing } = useBill();
  const [preview, setPreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.match('image.*')) {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          if (event.target) {
            const imageUrl = event.target.result as string;
            setPreview(imageUrl);
            setCurrentImage(imageUrl);
            processImage();
          }
        };
        
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
      }
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const capturePhoto = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageUrl = canvas.toDataURL('image/jpeg');
          setPreview(imageUrl);
          setCurrentImage(imageUrl);
          
          // Stop the video stream
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
          setIsCapturing(false);
          
          processImage();
        }
      }, 1000);
    } catch (error) {
      console.error('Error capturing photo:', error);
      setIsCapturing(false);
      toast({
        title: "Camera Error",
        description: "Could not access the camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };
  
  const processImage = () => {
    setIsAnalyzing(true);
    // In a real app, we would send the image to a backend service for processing
    // For now, we'll simulate a delay and then move to the next step
    setTimeout(() => {
      setActiveStep(1);
      setIsAnalyzing(false);
    }, 2000);
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in">
      <div className="max-w-md w-full">
        {preview ? (
          <div className="flex flex-col items-center">
            <div className="relative w-full h-80 mb-6 overflow-hidden rounded-xl">
              <img 
                src={preview} 
                alt="Receipt preview" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="flex justify-center items-center w-full">
              <Loader2 className="animate-spin mr-2" size={20} />
              <p className="text-muted-foreground">Analyzing receipt...</p>
            </div>
          </div>
        ) : (
          <>
            <Card className="glass-card mb-6 flex flex-col items-center justify-center p-8 h-80 border border-dashed border-muted-foreground/50">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Take a photo of your Costco receipt</p>
                <p className="text-xs text-muted-foreground/70 mb-6">
                  Make sure the receipt is flat, well-lit, and all items are visible
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={capturePhoto}
                    className="flex items-center gap-2"
                    disabled={isCapturing}
                  >
                    {isCapturing ? (
                      <Loader2 className="animate-spin mr-2" size={16} />
                    ) : (
                      <Camera size={16} className="mr-2" />
                    )}
                    Take Photo
                  </Button>
                  
                  <Button
                    onClick={triggerFileInput}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Upload size={16} className="mr-2" />
                    Upload Image
                  </Button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </Card>
            
            <div className="text-center text-sm text-muted-foreground p-4">
              <p>Split Costco bills among friends with ease</p>
              <p>Photos stay on your device and are processed securely</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BillCapture;
