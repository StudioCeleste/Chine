import { useState } from 'react';
import { supabase } from '../lib/supabase';
import styles from './PhotoUploader.module.css';

export default function PhotoUploader({ eventId, onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false);

  const compressImage = (file, maxWidth = 800) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          }, 'image/jpeg', 0.8);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Compresser la photo
      const compressedFile = await compressImage(file);
      
      // 2. Uploader sur Supabase Storage
      const fileName = `${Date.now()}_${compressedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, compressedFile);

      if (uploadError) throw uploadError;

      // 3. Récupérer l'URL publique
      const { data: publicUrlData } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      // 4. Lier l'URL à l'événement dans la base de données
      const { error: dbError } = await supabase
        .from('photos')
        .insert([{ event_id: eventId, url_thumbnail: publicUrlData.publicUrl }]);

      if (dbError) throw dbError;

      if (onUploadSuccess) onUploadSuccess();

    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Une erreur est survenue lors de l\'upload de la photo.');
    } finally {
      setIsUploading(false);
      e.target.value = null; // reset input
    }
  };

  return (
    <div className={styles.uploader}>
      <label className={`${styles.uploadBtn} ${isUploading ? styles.uploading : ''}`}>
        {isUploading ? 'Chargement...' : 'Ajouter une photo'}
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" // Ouvrir la caméra directement sur mobile si possible
          onChange={handleFileChange} 
          disabled={isUploading} 
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
}
