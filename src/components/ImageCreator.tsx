import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Sparkles, Loader2, Wand2, AlertCircle, Trash2, Upload, User, X, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
}

// Free AI image generation using Pollinations API
const generateImageWithPollinations = async (prompt: string, width: number, height: number): Promise<string> => {
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&enhance=true&nologo=true`;
};

const ImageCreator = () => {
  const { language, t } = useLanguage();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [selectedSize, setSelectedSize] = useState("1024x1024");
  const [numImages, setNumImages] = useState(4);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("normal");
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  const styles = [
    { value: "realistic", label: t('realistic') },
    { value: "artistic", label: t('artistic') },
    { value: "digital-art", label: t('digital-art') },
    { value: "anime", label: t('anime') },
    { value: "fantasy", label: t('fantasy') },
    { value: "cyberpunk", label: t('cyberpunk') },
  ];

  const sizes = [
    { value: "512x512", label: t('square_512') },
    { value: "1024x1024", label: t('square_1024') },
    { value: "1024x768", label: t('horizontal') },
    { value: "768x1024", label: t('vertical') },
  ];

  const imageOptions = [1, 2, 4, 6];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: t('enter_description'),
        description: t('describe_what_you_want'),
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const [width, height] = selectedSize.split("x").map(Number);
      const stylePrompt = selectedStyle === "realistic" 
        ? prompt 
        : `${prompt}, ${selectedStyle} style, high quality, detailed`;

      // Generate multiple images using Pollinations AI
      const imagePromises = Array.from({ length: numImages }, async (_, index) => {
        const imageUrl = await generateImageWithPollinations(stylePrompt, width, height);
        return {
          id: `${Date.now()}-${index}`,
          url: imageUrl,
          prompt: prompt,
          timestamp: new Date(),
        };
      });

      const newImages = await Promise.all(imagePromises);
      setGeneratedImages(prev => [...newImages, ...prev]);
      setShowGallery(true);
      
      toast({
        title: `${t('images_generated')} ${numImages} ${t('images')}!`,
        description: t('ready_to_view'),
      });
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: t('generation_failed'),
        description: t('error_occurred'),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-generated-${prompt.slice(0, 20).replace(/\s+/g, '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: t('download_started'),
        description: t('downloading_image'),
      });
    } catch (error) {
      toast({
        title: t('download_failed'),
        description: t('cannot_download'),
        variant: "destructive",
      });
    }
  };

  const deleteImage = (imageId: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== imageId));
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
    toast({
      title: t('image_deleted'),
      description: t('image_removed'),
    });
  };

  const clearAllImages = () => {
    setGeneratedImages([]);
    setSelectedImages(new Set());
    toast({
      title: t('all_images_deleted'),
      description: t('all_images_removed'),
    });
  };

  const deleteSelectedImages = () => {
    setGeneratedImages(prev => prev.filter(img => !selectedImages.has(img.id)));
    setSelectedImages(new Set());
    toast({
      title: t('selected_images_deleted'),
      description: t('selected_images_removed'),
    });
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const selectAllImages = () => {
    setSelectedImages(new Set(generatedImages.map(img => img.id)));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setReferenceImage(file);
        toast({
          title: t('reference_uploaded'),
          description: t('reference_will_be_used'),
        });
      } else {
        toast({
          title: t('invalid_file_type'),
          description: t('please_upload_image'),
          variant: "destructive",
        });
      }
    }
  };

  const handleConsistentGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: t('enter_description'),
        description: t('describe_what_you_want'),
        variant: "destructive",
      });
      return;
    }

    if (!referenceImage) {
      toast({
        title: t('upload_reference_image'),
        description: t('upload_face_for_consistency'),
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const [width, height] = selectedSize.split("x").map(Number);
      const consistentPrompt = `${prompt}, maintaining the same face and features as reference, consistent character, ${selectedStyle} style, high quality, detailed`;

      // Generate multiple images with consistency
      const imagePromises = Array.from({ length: numImages }, async (_, index) => {
        const imageUrl = await generateImageWithPollinations(consistentPrompt, width, height);
        return {
          id: `consistent-${Date.now()}-${index}`,
          url: imageUrl,
          prompt: `Consistent: ${prompt}`,
          timestamp: new Date(),
        };
      });

      const newImages = await Promise.all(imagePromises);
      setGeneratedImages(prev => [...newImages, ...prev]);
      setShowGallery(true);
      
      toast({
        title: `${t('consistent_images_generated')} ${numImages} ${t('consistent_images')}`,
        description: t('consistent_character_ready'),
      });
    } catch (error) {
      console.error('Consistent image generation error:', error);
      toast({
        title: t('generation_failed'),
        description: t('error_occurred'),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-background to-background/80 p-4 ${language === 'ar' ? 'arabic-text' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <div className="flex items-center justify-center">
              <Wand2 className={`w-8 h-8 text-primary ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {t('ai_image_creator')}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            {t('turn_imagination')}
          </p>
        </div>

        {/* Gallery Toggle */}
        {generatedImages.length > 0 && (
          <div className="flex justify-center mb-6">
            <Button
              onClick={() => setShowGallery(!showGallery)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              {showGallery ? t('hide_gallery') : `${t('show_gallery')} (${generatedImages.length})`}
            </Button>
          </div>
        )}

        {/* Info Alert */}
        <Alert className="mb-6 bg-primary/10 border-primary/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('free_ai_generation')}
          </AlertDescription>
        </Alert>

        {/* Creation Panel with Tabs */}
        {!showGallery && (
          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="normal" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {t('normal_generation')}
                  </TabsTrigger>
                  <TabsTrigger value="consistent" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {t('consistent_character')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="normal" className="space-y-6">
                  {/* Prompt Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t('describe_image')}
                    </label>
                    <Textarea
                      placeholder={t('dragon_placeholder')}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[100px] bg-input/50 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Options Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{t('style')}</label>
                      <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                        <SelectTrigger className="bg-input/50 border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {styles.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{t('size')}</label>
                      <Select value={selectedSize} onValueChange={setSelectedSize}>
                        <SelectTrigger className="bg-input/50 border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{t('number_of_images')}</label>
                      <Select value={numImages.toString()} onValueChange={(value) => setNumImages(parseInt(value))}>
                        <SelectTrigger className="bg-input/50 border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {imageOptions.map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {t('images')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold py-6 text-lg shadow-glow-primary transition-all duration-300"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'} animate-spin`} />
                        {t('generating')}
                      </>
                    ) : (
                      <>
                        <Sparkles className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        {t('generate_images')}
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="consistent" className="space-y-6">
                  {/* Reference Image Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t('upload_reference')}
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="bg-input/50 border-border/50"
                      />
                      {referenceImage && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Upload className="w-4 h-4" />
                          {referenceImage.name}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('reference_description')}
                    </p>
                  </div>

                  {/* Prompt Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t('describe_scene')}
                    </label>
                    <Textarea
                      placeholder={t('character_placeholder')}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[100px] bg-input/50 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Options Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{t('style')}</label>
                      <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                        <SelectTrigger className="bg-input/50 border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {styles.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{t('size')}</label>
                      <Select value={selectedSize} onValueChange={setSelectedSize}>
                        <SelectTrigger className="bg-input/50 border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{t('number_of_images')}</label>
                      <Select value={numImages.toString()} onValueChange={(value) => setNumImages(parseInt(value))}>
                        <SelectTrigger className="bg-input/50 border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {imageOptions.map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {t('images')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleConsistentGenerate}
                    disabled={isGenerating || !referenceImage}
                    className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold py-6 text-lg shadow-glow-primary transition-all duration-300"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'} animate-spin`} />
                        {t('generating')}
                      </>
                    ) : (
                      <>
                        <User className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        {t('consistent_character')}
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Generated Images Gallery */}
        {generatedImages.length > 0 && showGallery && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">{t('your_creations')} ({generatedImages.length})</h2>
              <div className="flex items-center gap-2">
                {selectedImages.size > 0 && (
                  <Button
                    onClick={deleteSelectedImages}
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('delete_selected')} ({selectedImages.size})
                  </Button>
                )}
                <Button
                  onClick={selectedImages.size === generatedImages.length ? () => setSelectedImages(new Set()) : selectAllImages}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  {selectedImages.size === generatedImages.length ? t('deselect_all') : t('select_all')}
                </Button>
                <Button
                  onClick={clearAllImages}
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('clear_gallery')}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedImages.map((image) => (
                <Card key={image.id} className="group overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-glow-secondary transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={image.url}
                        alt={image.prompt}
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          onClick={() => toggleImageSelection(image.id)}
                          variant={selectedImages.has(image.id) ? "default" : "secondary"}
                          size="sm"
                          className="w-8 h-8 p-0"
                        >
                          {selectedImages.has(image.id) ? <X className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </Button>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <Button
                          onClick={() => downloadImage(image.url, image.prompt)}
                          variant="secondary"
                          size="sm"
                          className="bg-background/90 hover:bg-background"
                        >
                          <Download className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                          {t('download')}
                        </Button>
                        <Button
                          onClick={() => deleteImage(image.id)}
                          variant="destructive"
                          size="sm"
                          className="bg-destructive/90 hover:bg-destructive text-destructive-foreground"
                        >
                          <Trash2 className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                          {t('delete')}
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {image.prompt}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-2">
                        {t('generated_on')} {new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          calendar: 'iso8601'
                        }).format(image.timestamp)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedImages.length === 0 && !showGallery && (
          <Card className="bg-card/30 backdrop-blur-sm border-border/50 border-dashed">
            <CardContent className="p-12 text-center">
              <Wand2 className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4 animate-float" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t('ready_to_create')}
              </h3>
              <p className="text-muted-foreground">
                {t('enter_description_above')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ImageCreator;