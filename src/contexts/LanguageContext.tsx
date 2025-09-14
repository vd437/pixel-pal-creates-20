import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  ar: {
    // Header
    'ai_image_creator': 'منشئ الصور الذكي',
    'turn_imagination': 'حول خيالك إلى صور مذهلة بالذكاء الاصطناعي',
    
    // Gallery
    'hide_gallery': 'إخفاء المعرض',
    'show_gallery': 'عرض المعرض',
    
    // Tabs
    'normal_generation': 'إنشاء عادي',
    'consistent_character': 'شخصية ثابتة',
    
    // Form labels
    'describe_image': 'صف الصورة التي تريدها',
    'style': 'النمط',
    'size': 'الحجم',
    'number_of_images': 'عدد الصور',
    'upload_reference': 'رفع صورة الوجه المرجعية',
    'describe_scene': 'صف المشهد مع شخصيتك',
    
    // Styles
    'realistic': 'واقعي',
    'artistic': 'فني',
    'digital-art': 'فن رقمي',
    'anime': 'أنمي',
    'fantasy': 'خيالي',
    'cyberpunk': 'سايبر بانك',
    
    // Sizes
    'square_512': 'مربع (512×512)',
    'square_1024': 'مربع كبير (1024×1024)',
    'horizontal': 'أفقي (1024×768)',
    'vertical': 'عمودي (768×1024)',
    
    // Buttons
    'generate_images': 'إنشاء الصور',
    'generating': 'جاري إنشاء تحفتك الفنية...',
    'download': 'تحميل',
    'delete': 'حذف',
    'select_all': 'تحديد الكل',
    'deselect_all': 'إلغاء تحديد الكل',
    'delete_selected': 'حذف المحدد',
    'clear_gallery': 'تفريغ المعرض',
    
    // Messages
    'enter_description': 'يرجى إدخال وصف للصورة',
    'describe_what_you_want': 'صف ما تريد إنشاؤه',
    'upload_reference_image': 'يرجى رفع صورة مرجعية',
    'upload_face_for_consistency': 'ارفع صورة وجه للحفاظ على الثبات',
    'images_generated': 'تم إنشاء',
    'images': 'صورة',
    'ready_to_view': 'صورك الذكية جاهزة للمشاهدة.',
    'generation_failed': 'فشل في الإنشاء',
    'error_occurred': 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    'download_started': 'بدأ التحميل',
    'downloading_image': 'يتم تحميل صورتك الآن.',
    'download_failed': 'فشل التحميل',
    'cannot_download': 'لا يمكن تحميل الصورة.',
    'image_deleted': 'تم حذف الصورة',
    'image_removed': 'تم إزالة الصورة من المعرض.',
    'all_images_deleted': 'تم حذف جميع الصور',
    'all_images_removed': 'تم إزالة جميع الصور من المعرض.',
    'selected_images_deleted': 'تم حذف الصور المحددة',
    'selected_images_removed': 'تم إزالة الصور المحددة من المعرض.',
    'reference_uploaded': 'تم رفع الصورة المرجعية',
    'reference_will_be_used': 'سيتم استخدام الصورة للحفاظ على ثبات الوجه.',
    'invalid_file_type': 'نوع ملف غير صحيح',
    'please_upload_image': 'يرجى رفع ملف صورة.',
    'consistent_images_generated': 'تم إنشاء',
    'consistent_images': 'صورة ثابتة!',
    'consistent_character_ready': 'صور شخصيتك الثابتة جاهزة للمشاهدة.',
    
    // Placeholders
    'dragon_placeholder': 'تنين مهيب يطير فوق غابة سحرية عند غروب الشمس...',
    'character_placeholder': 'الشخصية واقفة في قلعة من العصور الوسطى، ترتدي درعاً ملكياً...',
    'reference_description': 'ارفع صورة وجه واضحة للحفاظ على ثبات الشخصية عبر الصور المُنشأة',
    
    // Info
    'free_ai_generation': '🎨 إنشاء صور مجاني بالذكاء الاصطناعي من Pollinations. كل وصف ينشئ صوراً فريدة حسب وصفك!',
    
    // Gallery
    'selected_count': 'محدد',
    'generated_on': 'تم الإنشاء في',
    'your_creations': 'إبداعاتك',
    'ready_to_create': 'مستعد لصنع السحر؟',
    'enter_description_above': 'أدخل وصفاً أعلاه وشاهد الذكاء الاصطناعي يحول أفكارك إلى حقيقة',
  },
  en: {
    // Header
    'ai_image_creator': 'AI Image Creator',
    'turn_imagination': 'Turn your imagination into stunning images with AI',
    
    // Gallery
    'hide_gallery': 'Hide Gallery',
    'show_gallery': 'Show Gallery',
    
    // Tabs
    'normal_generation': 'Normal Generation',
    'consistent_character': 'Consistent Character',
    
    // Form labels
    'describe_image': 'Describe the image you want',
    'style': 'Style',
    'size': 'Size',
    'number_of_images': 'Number of Images',
    'upload_reference': 'Upload Reference Face Image',
    'describe_scene': 'Describe the scene with your character',
    
    // Styles
    'realistic': 'Realistic',
    'artistic': 'Artistic',
    'digital-art': 'Digital Art',
    'anime': 'Anime',
    'fantasy': 'Fantasy',
    'cyberpunk': 'Cyberpunk',
    
    // Sizes
    'square_512': 'Square (512×512)',
    'square_1024': 'Large Square (1024×1024)',
    'horizontal': 'Horizontal (1024×768)',
    'vertical': 'Vertical (768×1024)',
    
    // Buttons
    'generate_images': 'Generate Images',
    'generating': 'Creating your masterpiece...',
    'download': 'Download',
    'delete': 'Delete',
    'select_all': 'Select All',
    'deselect_all': 'Deselect All',
    'delete_selected': 'Delete Selected',
    'clear_gallery': 'Clear Gallery',
    
    // Messages
    'enter_description': 'Please enter an image description',
    'describe_what_you_want': 'Describe what you want to create',
    'upload_reference_image': 'Please upload a reference image',
    'upload_face_for_consistency': 'Upload a face image for consistency',
    'images_generated': 'Generated',
    'images': 'images',
    'ready_to_view': 'Your AI images are ready to view.',
    'generation_failed': 'Generation Failed',
    'error_occurred': 'Something went wrong. Please try again.',
    'download_started': 'Download Started',
    'downloading_image': 'Your image is being downloaded.',
    'download_failed': 'Download Failed',
    'cannot_download': 'Cannot download the image.',
    'image_deleted': 'Image Deleted',
    'image_removed': 'Image removed from gallery.',
    'all_images_deleted': 'All Images Deleted',
    'all_images_removed': 'All images removed from gallery.',
    'selected_images_deleted': 'Selected Images Deleted',
    'selected_images_removed': 'Selected images removed from gallery.',
    'reference_uploaded': 'Reference Image Uploaded',
    'reference_will_be_used': 'Image will be used to maintain face consistency.',
    'invalid_file_type': 'Invalid File Type',
    'please_upload_image': 'Please upload an image file.',
    'consistent_images_generated': 'Generated',
    'consistent_images': 'consistent images!',
    'consistent_character_ready': 'Your consistent character images are ready to view.',
    
    // Placeholders
    'dragon_placeholder': 'A majestic dragon flying over a magical forest at sunset...',
    'character_placeholder': 'Character standing in a medieval castle, wearing royal armor...',
    'reference_description': 'Upload a clear face image to maintain character consistency across generated images',
    
    // Info
    'free_ai_generation': '🎨 Free AI image generation powered by Pollinations. Each description creates unique images based on your vision!',
    
    // Gallery
    'selected_count': 'selected',
    'generated_on': 'Generated on',
    'your_creations': 'Your Creations',
    'ready_to_create': 'Ready to create magic?',
    'enter_description_above': 'Enter a description above and watch AI turn your ideas into reality',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};