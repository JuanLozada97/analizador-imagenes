import ImageUpload from '@/components/ImageUpload';
import { analyzeImage, type AnalyzeResponse } from "@/api/client";

const Index = () => {
  const handleImageUpload = (file: File) => {
    console.log('Imagen subida:', file.name, file.size);
  };

   const handleImageAnalyze = async (file: File): Promise<AnalyzeResponse> => {
    return await analyzeImage(file);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center">
          <ImageUpload 
            onImageUpload={handleImageUpload} 
            onImageAnalyze={handleImageAnalyze}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;