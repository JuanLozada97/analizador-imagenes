import React, { useState, useRef, DragEvent } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
const imageSchema = z.object({
  image: z
    .instanceof(FileList)
    .refine((files) => files?.length == 1, "Imagen es requerida.")
    .refine((files) => files?.[0]?.size <= 10 * 1024 * 1024, "El archivo debe ser menor a 10MB.")
    .refine(
      (files) =>
        ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"].includes(files?.[0]?.type),
      "Solo se permiten archivos JPG, PNG, GIF y WebP."
    ),
});

type ImageFormData = z.infer<typeof imageSchema>;

interface ImageUploadProps {
  onImageUpload?: (file: File) => void;
  onImageAnalyze?: (file: File) => Promise<any>;
}
export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  onImageAnalyze
}) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragOverInvalid, setIsDragOverInvalid] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<ImageFormData>({
    resolver: zodResolver(imageSchema),
  });
  const currentFile = form.watch("image")?.[0];

  // Helper function to validate image types
  const isValidImageType = (file: File) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    
    // Validate both MIME type and file extension
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    return hasValidType && hasValidExtension;
  };

  const handleFile = (file: File) => {
    // Double validation to prevent bypassing
    if (!isValidImageType(file)) {
      toast({
        variant: "destructive",
        title: "Archivo no válido",
        description: `El archivo "${file.name}" no es una imagen válida. Solo se permiten JPG, PNG, GIF y WebP.`
      });
      return;
    }

    const fileList = new DataTransfer();
    fileList.items.add(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      onImageUpload?.(file);
      toast({
        title: "Imagen cargada",
        description: `${file.name} se ha cargado exitosamente`
      });
    };
    reader.readAsDataURL(file);
    
    form.setValue("image", fileList.files);
  };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Check if dragged items contain valid images
    const items = Array.from(e.dataTransfer.items);
    const hasValidImage = items.some(item => 
      item.kind === 'file' && item.type.startsWith('image/') && 
      ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"].includes(item.type)
    );
    
    if (hasValidImage) {
      setIsDragOver(true);
      setIsDragOverInvalid(false);
    } else {
      setIsDragOver(false);
      setIsDragOverInvalid(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    setIsDragOverInvalid(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    setIsDragOverInvalid(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(isValidImageType);
    
    if (imageFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "Archivo no válido",
        description: "Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP)"
      });
      return;
    }
    
    if (files.length > imageFiles.length) {
      toast({
        variant: "destructive",
        title: "Algunos archivos fueron rechazados",
        description: "Solo se procesan archivos de imagen válidos"
      });
    }
    
    if (imageFiles.length > 0) {
      handleFile(imageFiles[0]);
    }
  };
  const handleAnalyze = async () => {
    if (!currentFile || !onImageAnalyze) return;
    
    setIsAnalyzing(true);
    try {
      const result = await onImageAnalyze(currentFile);
      setAnalysisResult(result);
      toast({
        title: "Análisis completado",
        description: "La imagen ha sido analizada exitosamente"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error en el análisis",
        description: "Hubo un problema al analizar la imagen"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  const removeImage = () => {
    setUploadedImage(null);
    setAnalysisResult(null);
    form.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2 py-[10px]">
          Subir Imagen
        </h1>
        <p className="text-muted-foreground">
          Arrastra y suelta tu imagen o haz clic para seleccionar
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="image"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormControl>
                  <div>
                    {!uploadedImage ? (
                      <div
                        className={`
                          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
                          ${isDragOver ? 'border-primary bg-upload-active scale-[1.02]' : 
                            isDragOverInvalid ? 'border-destructive bg-destructive/5 scale-[0.98]' : 
                            'border-upload-border bg-upload-bg hover:bg-upload-hover hover:border-primary'}
                        `}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleClick}
                      >
                        <Input
                          {...field}
                          ref={fileInputRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              const file = files[0];
                              
                              // Immediate validation before processing
                              if (!isValidImageType(file)) {
                                toast({
                                  variant: "destructive",
                                  title: "Archivo no válido",
                                  description: `El archivo "${file.name}" no es una imagen válida. Solo se permiten JPG, PNG, GIF y WebP.`
                                });
                                // Clear the input
                                e.target.value = '';
                                return;
                              }
                              
                              handleFile(file);
                              onChange(files);
                            }
                          }}
                          className="hidden"
                        />
                        
                        <div className="flex flex-col items-center space-y-4">
                          <div className={`
                            p-6 rounded-full transition-all duration-300
                            ${isDragOver ? 'bg-primary/20' : 
                              isDragOverInvalid ? 'bg-destructive/20' : 'bg-primary/10'}
                          `}>
                            <Upload className={`w-8 h-8 transition-colors duration-300 
                              ${isDragOver ? 'text-primary' : 
                                isDragOverInvalid ? 'text-destructive' : 'text-primary/70'}`} />
                          </div>
                          
                          <div className="space-y-2">
                            <p className={`text-lg font-medium transition-colors duration-300
                              ${isDragOver ? 'text-primary' : 
                                isDragOverInvalid ? 'text-destructive' : 'text-foreground'}`}>
                              {isDragOver ? 'Suelta la imagen aquí' : 
                               isDragOverInvalid ? 'Archivo no válido' : 'Arrastra tu imagen aquí'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {isDragOverInvalid ? 'Solo se permiten imágenes' : 'o haz clic para seleccionar archivo'}
                            </p>
                          </div>
                          
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Formatos soportados: JPG, PNG, GIF, WebP</p>
                            <p>Tamaño máximo: 10MB</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="relative rounded-xl overflow-hidden shadow-medium bg-card">
                          <img src={uploadedImage} alt="Imagen subida" className="w-full h-auto max-h-96 object-contain" />
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="absolute top-4 right-4 rounded-full w-8 h-8 p-0" 
                            onClick={removeImage}
                            type="button"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex justify-center space-x-4">
                          
                          {onImageAnalyze && (
                            <Button 
                              onClick={handleAnalyze}
                              disabled={!currentFile || isAnalyzing}
                              className="flex items-center space-x-2"
                              type="button"
                            >
                              {isAnalyzing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                              <span>{isAnalyzing ? 'Analizando...' : 'Analizar'}</span>
                            </Button>
                          )}
                        </div>
                        
                        {analysisResult && (
                          <div className="mt-6 p-4 rounded-lg bg-muted">
                            <h3 className="text-lg font-medium mb-2">Resultado del Análisis</h3>
                            <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {JSON.stringify(analysisResult, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};
export default ImageUpload;