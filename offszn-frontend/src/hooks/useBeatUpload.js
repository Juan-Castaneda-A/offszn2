import { useState } from 'react';
import { supabase } from '../lib/supabase'; // Asumo que tienes tu cliente configurado
import { useAuth } from '../contexts/AuthContext'; // Asumo contexto de auth

export const useBeatUpload = () => {
  const { user } = useAuth();
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ message: '', progress: 0 });

  // --- HELPER: Delete File ---
  const deleteFileFromStorage = async (pathOrUrl, bucket = 'beat-drafts') => {
    if (!pathOrUrl) return;
    try {
      let path = pathOrUrl;
      // Lógica para extraer path relativo si viene URL completa
      if (pathOrUrl.startsWith('http')) {
        const parts = pathOrUrl.split(`/${bucket}/`);
        if (parts.length > 1) path = parts[1];
      }
      console.log(`🗑️ Deleting from ${bucket}:`, path);
      await supabase.storage.from(bucket).remove([path]);
    } catch (e) {
      console.warn(`⚠️ Cleanup failed for ${pathOrUrl}`, e);
    }
  };

  // --- HELPER: Sanitize Filename ---
  const sanitize = (name) => {
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')
      .substring(0, 100);
  };

  // --- MAIN FUNCTION: Save/Publish ---
  const handleSaveProduct = async (formData, formState, isDraft = false, editId = null, originalData = null) => {
    if (isPublishing) return;
    setIsPublishing(true);
    setUploadProgress({ message: 'Preparando archivos...', progress: 10 });

    try {
      const updates = {
        name: formState.title,
        description: formState.description || null,
        release_date: formState.releaseDate,
        visibility: formState.visibility,
        tags: formState.tags.length > 0 ? formState.tags : null,
        bpm: parseInt(formState.bpm) || null,
        key_scale: formState.key || null,
        // Precios
        discount_amount: parseInt(formState.discountAmount) || null,
        discount_type: formState.discountType || 'percent',
        licenses: formState.licenses, // JSON completo
        collaborators: formState.collaborators.length > 0 ? formState.collaborators : null,
        // Calcular precio base
        price_basic: Object.values(formState.licenses).some(l => l.enabled) 
          ? Math.min(...Object.values(formState.licenses).filter(l => l.enabled).map(l => l.price))
          : 0
      };

      // Recalcular is_free
      updates.is_free = updates.price_basic === 0;

      // 1. Upload Cover (Si cambió)
      if (formData.coverFile) {
        setUploadProgress({ message: 'Subiendo portada...', progress: 20 });
        // Limpiar anterior
        if (originalData?.image_url) await deleteFileFromStorage(originalData.image_url, 'products');
        
        const coverPath = `${user.id}/covers/${Date.now()}_cover.jpg`;
        const { data, error } = await supabase.storage.from('products').upload(coverPath, formData.coverFile);
        if (error) throw error;
        
        const { data: publicUrl } = supabase.storage.from('products').getPublicUrl(data.path);
        updates.image_url = publicUrl.publicUrl;
      }

      // 2. Upload MP3 (Si cambió)
      if (formData.mp3File) {
        setUploadProgress({ message: 'Subiendo MP3...', progress: 40 });
        if (originalData?.mp3_url) await deleteFileFromStorage(originalData.mp3_url, 'products');

        const cleanName = sanitize(formData.mp3File.name);
        const path = `${user.id}/mp3_tagged/${Date.now()}_${cleanName}`;
        const { data, error } = await supabase.storage.from('products').upload(path, formData.mp3File);
        if (error) throw error;

        const { data: publicUrl } = supabase.storage.from('products').getPublicUrl(data.path);
        updates.mp3_url = publicUrl.publicUrl;
        updates.audio_url = updates.mp3_url; // Legacy
      }

      // 3. Upload WAV (Secure)
      if (formData.wavFile) {
        setUploadProgress({ message: 'Subiendo WAV...', progress: 60 });
        if (originalData?.wav_url) await deleteFileFromStorage(originalData.wav_url, 'secure-products');

        const cleanName = sanitize(formData.wavFile.name);
        const path = `${user.id}/wav_untagged/${Date.now()}_${cleanName}`;
        const { data, error } = await supabase.storage.from('secure-products').upload(path, formData.wavFile);
        if (error) throw error;
        updates.wav_url = data.path; // Guardamos path interno para secure bucket
      }

      // 4. Upload Stems (Secure)
      if (formData.stemsFile) {
        setUploadProgress({ message: 'Subiendo Stems...', progress: 80 });
        if (originalData?.stems_url) await deleteFileFromStorage(originalData.stems_url, 'secure-products');

        const cleanName = sanitize(formData.stemsFile.name);
        const path = `${user.id}/stems/${Date.now()}_${cleanName}`;
        const { data, error } = await supabase.storage.from('secure-products').upload(path, formData.stemsFile);
        if (error) throw error;
        updates.stems_url = data.path;
      }

      // 5. Database Update or Insert
      setUploadProgress({ message: 'Guardando datos...', progress: 90 });
      
      let result;
      if (editId) {
        // UPDATE
        result = await supabase.from('products').update(updates).eq('id', editId);
      } else {
        // INSERT
        updates.user_id = user.id;
        updates.product_type = 'beat';
        result = await supabase.from('products').insert(updates);
      }

      if (result.error) throw result.error;

      // 6. Collab Logic (Simplificada para React)
      // Aquí iría la lógica de invitaciones que tenías en el script...
      
      setUploadProgress({ message: '¡Listo!', progress: 100 });
      return { success: true };

    } catch (error) {
      console.error('Error uploading:', error);
      return { success: false, error: error.message };
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    isPublishing,
    uploadProgress,
    handleSaveProduct,
    deleteFileFromStorage
  };
};