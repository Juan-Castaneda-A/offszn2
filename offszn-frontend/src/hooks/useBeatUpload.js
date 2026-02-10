import { useState } from 'react';
import { supabase } from '../api/client'; // Asegúrate de que este import apunte a tu cliente supabase configurado
import { useAuth } from '../store/authStore'; // O donde tengas tu auth store

export const useBeatUpload = () => {
  const { user } = useAuth(); // Asumiendo que obtienes el usuario logueado así
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ message: '', progress: 0 });

  // --- HELPER: Sanitize Filename ---
  const sanitize = (name) => {
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')
      .substring(0, 100);
  };

  // --- MAIN FUNCTION ---
  const handleSaveProduct = async (fileObjects, formState, isDraft = false) => {
    if (isPublishing) return;
    setIsPublishing(true);
    setUploadProgress({ message: 'Iniciando carga...', progress: 5 });

    try {
      if (!user) throw new Error("Usuario no autenticado");

      // 1. Preparamos el objeto para la DB (Mapeo exacto a tus columnas)
      const productData = {
        name: formState.title,
        description: formState.description || '',
        bpm: parseInt(formState.bpm) || null,
        key: formState.key || null,
        product_type: 'beat', // Fijo según tu lógica
        tags: formState.tags || [], // Tu DB dice ARRAY, así que enviamos array
        genres: [], // Puedes agregar esto al form si quieres
        moods: [], // Puedes agregar esto al form si quieres
        
        // Precios y Licencias
        licenses: formState.licenses, // JSONB
        price_basic: formState.licenses.basic?.enabled ? formState.licenses.basic.price : 0,
        price_premium: formState.licenses.premium?.enabled ? formState.licenses.premium.price : 0,
        price_stems: formState.licenses.unlimited?.enabled ? formState.licenses.unlimited.price : 0, // Asumiendo unlimited = stems
        
        discount_amount: parseFloat(formState.discountAmount) || 0,
        discount_type: formState.discountType || 'percent',
        
        is_free: formState.isFree,
        release_date: formState.releaseDate ? new Date(formState.releaseDate).toISOString() : new Date().toISOString(),
        visibility: formState.visibility || 'public',
        status: isDraft ? 'draft' : 'published',
        
        producer_id: user.id,
        created_at: new Date().toISOString(),
      };

      // 2. Subida de Archivos (Buckets)
      
      // A) Portada (image_url)
      if (fileObjects.coverFile) {
        setUploadProgress({ message: 'Subiendo portada...', progress: 20 });
        const ext = fileObjects.coverFile.name.split('.').pop();
        const path = `${user.id}/covers/${Date.now()}_cover.${ext}`;
        
        const { data, error } = await supabase.storage.from('products').upload(path, fileObjects.coverFile);
        if (error) throw error;
        
        // Obtener URL Pública
        const { data: publicUrl } = supabase.storage.from('products').getPublicUrl(path);
        productData.image_url = publicUrl.publicUrl;
      }

      // B) MP3 Tagged (mp3_url / download_url_mp3)
      if (fileObjects.mp3File) {
        setUploadProgress({ message: 'Subiendo MP3...', progress: 40 });
        const name = sanitize(fileObjects.mp3File.name);
        const path = `${user.id}/mp3_tagged/${Date.now()}_${name}`;
        
        const { data, error } = await supabase.storage.from('products').upload(path, fileObjects.mp3File);
        if (error) throw error;
        
        const { data: publicUrl } = supabase.storage.from('products').getPublicUrl(path);
        productData.mp3_url = publicUrl.publicUrl;
        productData.audio_url = publicUrl.publicUrl; // Para el reproductor
        productData.download_url_mp3 = publicUrl.publicUrl; // Para descargas free
      }

      // C) WAV Untagged (wav_url - Secure)
      if (fileObjects.wavFile) {
        setUploadProgress({ message: 'Subiendo WAV...', progress: 60 });
        const name = sanitize(fileObjects.wavFile.name);
        const path = `${user.id}/wav_untagged/${Date.now()}_${name}`;
        
        // Usamos bucket 'secure-products' o 'products' según tu config. 
        // Asumo 'secure-products' para archivos de venta.
        const { data, error } = await supabase.storage.from('secure-products').upload(path, fileObjects.wavFile);
        if (error) throw error;
        
        productData.wav_url = data.path; // Guardamos PATH interno, no URL pública
      }

      // D) Stems (stems_url - Secure)
      if (fileObjects.stemsFile) {
        setUploadProgress({ message: 'Subiendo Stems...', progress: 80 });
        const name = sanitize(fileObjects.stemsFile.name);
        const path = `${user.id}/stems/${Date.now()}_${name}`;
        
        const { data, error } = await supabase.storage.from('secure-products').upload(path, fileObjects.stemsFile);
        if (error) throw error;
        
        productData.stems_url = data.path;
      }

      // 3. Insertar en Base de Datos
      setUploadProgress({ message: 'Guardando datos...', progress: 90 });
      
      const { data: insertedData, error: dbError } = await supabase
        .from('products')
        .insert([productData])
        .select();

      if (dbError) throw dbError;

      setUploadProgress({ message: '¡Completado!', progress: 100 });
      return { success: true, data: insertedData };

    } catch (error) {
      console.error("Upload Error:", error);
      return { success: false, error: error.message };
    } finally {
      setIsPublishing(false);
    }
  };

  return { handleSaveProduct, isPublishing, uploadProgress };
};