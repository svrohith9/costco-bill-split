
import React, { useRef, useState } from 'react';
import { useBill } from '@/context/BillContext';
import { Camera, Upload, Loader2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { compressImage } from '@/utils/imageProcessing';
import { toast } from '@/components/ui/use-toast';

const BillCapture: React.FC = () => {
  const { setCurrentImage, setActiveStep, setIsAnalyzing } = useBill();
  const [preview, setPreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.match('image.*')) {
        setIsProcessing(true);
        try {
          const reader = new FileReader();
          
          reader.onload = async (event) => {
            if (event.target) {
              const imageUrl = event.target.result as string;
              
              // Compress the image to improve OCR performance
              try {
                const compressedImage = await compressImage(imageUrl);
                setPreview(compressedImage);
                setCurrentImage(compressedImage);
                processImage();
              } catch (error) {
                console.error('Error compressing image:', error);
                // Use original image if compression fails
                setPreview(imageUrl);
                setCurrentImage(imageUrl);
                processImage();
              }
            }
          };
          
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error processing image:', error);
          setIsProcessing(false);
          toast({
            title: "Error",
            description: "Failed to process image. Please try again.",
            variant: "destructive"
          });
        }
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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
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
          const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
          
          // Stop the video stream
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
          
          setIsCapturing(false);
          setIsProcessing(true);
          setPreview(imageUrl);
          setCurrentImage(imageUrl);
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
    setActiveStep(1);
  };
  
  const retakePhoto = () => {
    setPreview(null);
    setCurrentImage(null);
    setIsProcessing(false);
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
              {!isProcessing && (
                <Button
                  onClick={retakePhoto}
                  variant="secondary"
                  className="absolute bottom-4 right-4"
                >
                  Retake
                </Button>
              )}
            </div>
            {isProcessing && (
              <div className="flex justify-center items-center w-full">
                <Loader2 className="animate-spin mr-2" size={20} />
                <p className="text-muted-foreground">Preparing for analysis...</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <Card className="glass-card mb-6 flex flex-col items-center justify-center p-8 h-80 border border-dashed border-muted-foreground/50">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Take a photo of your Costco receipt</p>
                <p className="text-xs text-muted-foreground/70 mb-6">
                  For best results:
                  <ul className="list-disc text-left ml-5 mt-2">
                    <li>Make sure the receipt is flat</li>
                    <li>Ensure good lighting</li>
                    <li>Capture the entire receipt</li>
                    <li>Avoid shadows and glare</li>
                  </ul>
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
                    <Image size={16} className="mr-2" />
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
