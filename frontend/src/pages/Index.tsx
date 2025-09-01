import ImageUpload from '@/components/ImageUpload';

const Index = () => {
  const handleImageUpload = (file: File) => {
    console.log('Imagen subida:', file.name, file.size);
  };

  const handleImageAnalyze = async (file: File) => {
    // Placeholder para el servicio externo
    // Aquí puedes integrar con servicios como OpenAI Vision, Google Vision API, etc.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          filename: file.name,
          size: file.size,
          type: file.type,
          detected_objects: ["ejemplo", "análisis", "placeholder"],
          confidence: 0.95,
          timestamp: new Date().toISOString()
        });
      }, 2000); // Simula 2 segundos de procesamiento
    });
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