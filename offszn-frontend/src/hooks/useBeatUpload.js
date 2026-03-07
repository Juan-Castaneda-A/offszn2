import { useState } from 'react';
import apiClient, { supabase } from '../api/client';
import { useAuth } from '../store/authStore';

export const useBeatUpload = () => {
  const { user, profile } = useAuth();
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ message: '', progress: 0 });

  // --- HELPER: Sanitize Filename ---
  const sanitize = (name) => {
    if (!name) return 'file';
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')
      .substring(0, 100);
  };

  // --- HELPER: DataURL to Blob ---
  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const blobToDataURL = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // --- MAIN FUNCTION ---
  const handleSaveProduct = async (fileObjects, formState, isDraft = false) => {
    if (isPublishing) return;
    setIsPublishing(true);
    setUploadProgress({ message: 'Iniciando proceso...', progress: 5 });

    try {
      if (!user) throw new Error("Debes iniciar sesión para subir contenido.");

      // 1. Database Object Construction
      const productData = {
        name: formState.title,
        description: formState.description || '',
        bpm: parseInt(formState.bpm) || null,
        key: formState.musicalKey || null,
        product_type: formState.productType || 'beat',
        tags: formState.tags || [],

        // Pricing
        price_basic: parseFloat(formState.basePrice) || 0,
        price_premium: parseFloat(formState.promoPrice) || 0,
        is_free: formState.isFree || false,

        // Metadata & Status
        visibility: formState.visibility || 'public',
        status: isDraft ? 'draft' : 'approved',
        release_date: formState.date || new Date().toISOString(),

        // Producer / Owner
        producer_id: user.id,
        producer_nickname: profile?.nickname || 'Productor',

        // JSONB structure for collaborators
        collaborators: formState.collaborators || [],

        created_at: new Date().toISOString(),
      };

      // 2. File Uploads (Supabase Storage)

      // A) Cover Image (Cloudinary via Backend)
      // Check if we have a processed cover from the video editor first, otherwise use the standard coverImage
      let finalCoverDataURL = null;

      if (formState.processedCover?.file) {
        // If it's a Blob from the video editor, convert to DataURL
        finalCoverDataURL = await blobToDataURL(formState.processedCover.file);
      } else if (formState.coverImage?.preview) {
        // If it's already a preview (likely DataURL from cropper), use it
        finalCoverDataURL = formState.coverImage.preview;
      }

      if (finalCoverDataURL && finalCoverDataURL.startsWith('data:')) {
        setUploadProgress({ message: 'Subiendo portada...', progress: 20 });
        const { data: cloudRes } = await apiClient.post('/cloudinary/upload', {
          image: finalCoverDataURL,
          folder: 'products'
        });
        productData.image_url = cloudRes.url;
        console.log("DEBUG: Final Product Image URL ->", productData.image_url);
      }

      // B) Primary Audio (Tagged MP3) - Upload to R2 via Backend
      if (fileObjects.mp3File) {
        setUploadProgress({ message: 'Subiendo preescucha...', progress: 40 });
        const formData = new FormData();
        formData.append('file', fileObjects.mp3File);
        formData.append('folder', 'mp3_tagged');

        const { data: r2Res } = await apiClient.post('/storage/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        productData.mp3_url = r2Res.key;
        productData.audio_url = r2Res.key; // Used by players - R2 keys are signed on request
      }

      // C) Main Product File (WAV / ZIP / Preset) - Upload to R2 via Backend
      if (fileObjects.wavFile || fileObjects.zipFile) {
        setUploadProgress({ message: 'Subiendo archivo principal...', progress: 70 });
        const mainFile = fileObjects.wavFile || fileObjects.zipFile;
        const folder = fileObjects.wavFile ? 'wav_untagged' : (productData.product_type === 'preset' ? 'presets' : 'kits');

        const formData = new FormData();
        formData.append('file', mainFile);
        formData.append('folder', folder);

        const { data: r2Res } = await apiClient.post('/storage/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (fileObjects.wavFile) productData.wav_url = r2Res.key;
        if (fileObjects.zipFile) {
          productData.stems_url = r2Res.key;
          productData.audio_url = null;
        }
      }

      // D) Optional Stems (for beats) - Upload to R2 via Backend
      if (fileObjects.stemsFile) {
        setUploadProgress({ message: 'Subiendo stems...', progress: 85 });
        const formData = new FormData();
        formData.append('file', fileObjects.stemsFile);
        formData.append('folder', 'stems');

        const { data: r2Res } = await apiClient.post('/storage/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        productData.stems_url = r2Res.key;
      }

      // 3. Database Insertion
      setUploadProgress({ message: 'Finalizando...', progress: 95 });

      const { data: insertedData, error: dbError } = await supabase
        .from('products')
        .insert([productData])
        .select();

      if (dbError) throw dbError;

      // Notify the owner about successful upload (non-blocking)
      try {
        await apiClient.post('/notifications', {
          targetUserId: user.id,
          type: 'product_upload',
          message: `Tu producto '<strong>${formState.title}</strong>' se ha subido exitosamente.`,
          link: `/dashboard/my-products`
        });
      } catch (notifErr) {
        console.warn("Could not dispatch product_upload notification:", notifErr);
      }

      // Notify each collaborator that they were added to this product.
      // collaborators already have { id, nickname, split } from the Step3 user search — no email lookup needed.
      const collaboratorsList = formState.collaborators || [];
      console.log('[DEBUG useBeatUpload] formState.collaborators:', JSON.stringify(collaboratorsList));
      if (collaboratorsList.length > 0) {
        for (const collab of collaboratorsList) {
          if (!collab.id || collab.id === user.id) continue;
          try {
            await apiClient.post('/notifications', {
              targetUserId: collab.id,
              type: 'collab_invite',
              message: `Has sido añadido como colaborador en '<strong>${formState.title}</strong>'.`,
              link: `/dashboard/collaborations`
            });
            console.log(`[Upload] collab_invite notification sent to ${collab.nickname} (${collab.id})`);
          } catch (notifErr) {
            console.warn(`Could not notify collaborator ${collab.nickname}:`, notifErr);
          }
        }
      }

      setUploadProgress({ message: 'Publicado con éxito!', progress: 100 });
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