import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function AddSchool() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm();
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');
  const imageWatch = watch('image');

  const onSubmit = async (data) => {
    setServerError('');
    setServerSuccess('');
    const file = data.image?.[0];
    
    // Clear any previous errors
    if (!file) {
      setServerError('Image is required');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setServerError('Please upload a valid image file (JPG, PNG, etc.)');
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'image') {
        formData.append('image', file);
      } else {
        formData.append(key, value);
      }
    });

    try {
      const res = await fetch('/api/schools', { method: 'POST', body: formData });
      const json = await res.json();
      
      if (!res.ok) {
        setServerError(json.message || 'Failed to add school. Please try again.');
        return;
      }
      
      setServerSuccess('School added successfully! The school has been added to the directory.');
      reset();
    } catch (error) {
      console.error('Error adding school:', error);
      setServerError('Network error. Please check your connection and try again.');
    }
  };

  const previewUrl = imageWatch && imageWatch[0] ? URL.createObjectURL(imageWatch[0]) : '';
  
  // Clear errors when user starts typing or selecting new image
  const clearErrors = () => {
    setServerError('');
    setServerSuccess('');
  };

  return (
    <>
      <div className="heroSearchSection">
        <div className="heroSearchContent">
          <h1 className="heroSearchTitle">Add New School · EduFindr</h1>
          <p style={{ color: 'var(--white)', fontSize: '1.2rem', marginBottom: 0, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            Fill in the information below to add a new school to the directory
          </p>
        </div>
      </div>
      <div className="container">
        <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="row">
            <div className="field">
              <label htmlFor="name">School Name *</label>
              <input 
                id="name" 
                className="input" 
                placeholder="Enter school name"
                aria-invalid={!!errors.name} 
                onChange={clearErrors}
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })} 
              />
              {errors.name && <span className="error" role="alert">{errors.name.message}</span>}
            </div>
            <div className="field">
              <label htmlFor="email_id">Email Address *</label>
              <input 
                id="email_id" 
                className="input" 
                type="email" 
                placeholder="school@example.com"
                aria-invalid={!!errors.email_id} 
                {...register('email_id', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' } })} 
              />
              {errors.email_id && <span className="error" role="alert">{errors.email_id.message}</span>}
            </div>
          </div>
          
          

          <div className="row">
            <div className="field">
              <label htmlFor="contact">Contact Number *</label>
              <input 
                id="contact" 
                className="input" 
                inputMode="numeric" 
                placeholder="1234567890"
                aria-invalid={!!errors.contact} 
                {...register('contact', { required: 'Contact is required', pattern: { value: /^\d{7,15}$/, message: 'Please enter 7-15 digits only' } })} 
              />
              {errors.contact && <span className="error" role="alert">{errors.contact.message}</span>}
            </div>
            <div className="field">
              <label htmlFor="state">State *</label>
              <input 
                id="state" 
                className="input" 
                placeholder="Enter state name"
                aria-invalid={!!errors.state} 
                {...register('state', { required: 'State is required' })} 
              />
              {errors.state && <span className="error" role="alert">{errors.state.message}</span>}
            </div>
          </div>
          
          <div className="row">
            <div className="field">
              <label htmlFor="city">City *</label>
              <input 
                id="city" 
                className="input" 
                placeholder="Enter city name"
                aria-invalid={!!errors.city} 
                {...register('city', { required: 'City is required' })} 
              />
              {errors.city && <span className="error" role="alert">{errors.city.message}</span>}
            </div>
            <div className="field">
              <label htmlFor="address">Address *</label>
              <input 
                id="address" 
                className="input" 
                placeholder="Enter full address"
                aria-invalid={!!errors.address} 
                {...register('address', { required: 'Address is required', minLength: { value: 5, message: 'Address must be at least 5 characters' } })} 
              />
              {errors.address && <span className="error" role="alert">{errors.address.message}</span>}
            </div>
          </div>
          
          <div className="field">
            <label htmlFor="image">School Image *</label>
            <input 
              id="image" 
              className="fileInput" 
              type="file" 
              accept="image/*" 
              aria-invalid={!!errors.image} 
              onChange={clearErrors}
              {...register('image', { required: 'Image is required' })} 
            />
            <div className="helpText">
              Upload a clear image of your school. Supported formats: JPG, PNG, GIF, WebP. 
              Landscape orientation works best for display.
            </div>
            {errors.image && <span className="error" role="alert">{errors.image.message}</span>}
          </div>
          
          {previewUrl && (
            <div className="field">
              <label>Image Preview</label>
              <div className="imagePreview">
                <img src={previewUrl} alt="School preview" />
              </div>
            </div>
          )}
          
          {serverError && <div className="error" role="alert">{serverError}</div>}
          {serverSuccess && <div className="success" role="alert">{serverSuccess}</div>}
          
          <button className="btn" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Adding School...' : 'Add School'}
          </button>
        </form>
      </div>
    </>
  );
}
