import axios from 'axios';
import { Image } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const fetchAlbumImages = async (albumId: string): Promise<Image[]> => {
  try {
    const response = await axios.get(`${API_URL}/images/album/${albumId}`);
    
    // Transform response to match frontend data model if necessary
    return response.data.map((img: any) => ({
      id: img._id,
      url: img.url,
      alt: img.alt || '',
      albumId: img.albumId,
      order: img.order
    }));
  } catch (error) {
    console.error('Error fetching album images:', error);
    throw error;
  }
};

export const uploadImage = async (formData: FormData): Promise<Image> => {
  try {
    const token = localStorage.getItem('token');
    
    // Check if formData contains a file or a URL string
    const hasFile = formData.has('image') && formData.get('image') instanceof File;
    const hasUrl = formData.has('url') && typeof formData.get('url') === 'string';
    
    // If neither is present, throw an error
    if (!hasFile && !hasUrl) {
      throw new Error('No image file or URL provided');
    }
    
    // Log the FormData contents for debugging
    console.log('FormData contains file:', hasFile);
    console.log('FormData contains url:', hasUrl);
    
    const response = await axios.post(`${API_URL}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Transform response to match frontend data model
    return {
      id: response.data._id,
      url: response.data.url, 
      alt: response.data.alt || '',
      albumId: response.data.albumId,
      order: response.data.order
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const updateImage = async (id: string, data: Partial<Image>): Promise<Image> => {
  try {
    const token = localStorage.getItem('token');
    
    // Create request data matching backend field names
    const requestData = {
      url: data.url,
      alt: data.alt,
      order: data.order
    };
    
    const response = await axios.put(`${API_URL}/images/${id}`, requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Transform response to match frontend data model
    return {
      id: response.data._id,
      url: response.data.url,
      alt: response.data.alt || '',
      albumId: response.data.albumId,
      order: response.data.order
    };
  } catch (error) {
    console.error('Error updating image:', error);
    throw error;
  }
};

export const deleteImage = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/images/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Add a function to reorder images
export const reorderImage = async (imageId: string, albumId: string, newOrder: number): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`${API_URL}/images/${imageId}`, 
      { order: newOrder, albumId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error('Error reordering image:', error);
    throw error;
  }
};

// Add bulk upload functionality
export const bulkUploadImages = async (formData: FormData): Promise<Image[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/images/bulk`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Transform response to match frontend data model
    return response.data.images.map((img: any) => ({
      id: img._id,
      url: img.url,
      alt: img.alt || '',
      albumId: img.albumId,
      order: img.order
    }));
  } catch (error) {
    console.error('Error bulk uploading images:', error);
    throw error;
  }
};
