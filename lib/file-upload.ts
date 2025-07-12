export async function uploadFile(file: File): Promise<string> {
  // For demo purposes, we'll create a mock URL
  // In production, integrate with Cloudinary, AWS S3, or Supabase Storage
  
  // Simulate upload time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate a mock URL for demonstration
  const mockUrl = `https://demo-storage.jayloy.com/receipts/${Date.now()}-${file.name}`;
  
  return mockUrl;
}

// For production use with Cloudinary:
/*
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'your_upload_preset');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }

  const data = await response.json();
  return data.secure_url;
}
*/

// For production use with Supabase Storage:
/*
import { supabase } from './supabase';

export async function uploadToSupabase(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(fileName, file);

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('receipts')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
*/