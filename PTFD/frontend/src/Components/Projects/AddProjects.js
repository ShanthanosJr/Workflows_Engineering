import React, { useState } from "react";
import axios from "axios";
import Nav from "../Nav/Nav";

export default function AddProjects() {
  const [formData, setFormData] = useState({
    pname: "",
    pnumber: "",
    pcode: "",
    plocation: "",
    pimg: [], // Changed to array for multiple images
    ptype: "",
    pownerid: "",
    pownername: "",
    potelnumber: "",
    pdescription: "",
    ppriority: "",
    pbudget: "",
    pstatus: "",
    penddate: "",
    pissues: "",
    pobservations: "",
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handle issues input (convert comma-separated string to array)
  const handleIssuesChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, pissues: value }));
  };

  // Handle multiple image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + selectedImages.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert('Please select only image files (JPEG, PNG, GIF, WebP)');
      return;
    }
    
    // Check file sizes (max 2MB each to prevent CORS timeout)
    const largeFiles = files.filter(file => file.size > 2 * 1024 * 1024);
    if (largeFiles.length > 0) {
      alert('Each image must be less than 2MB for better performance');
      return;
    }
    
    // Convert images to base64 with compression
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Create an image element to resize
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max width/height: 800px)
          const maxSize = 800;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
          
          setSelectedImages(prev => [...prev, file]);
          setImagePreviewUrls(prev => [...prev, compressedBase64]);
          setFormData(prev => ({ 
            ...prev, 
            pimg: [...prev.pimg, compressedBase64] 
          }));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ 
      ...prev, 
      pimg: prev.pimg.filter((_, i) => i !== index) 
    }));
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Validate that at least one image is selected
      if (formData.pimg.length === 0) {
        setMessage("❌ Please select at least one image for the project.");
        setLoading(false);
        return;
      }

      // Convert issues string to array before sending
      const submitData = {
        ...formData,
        pissues: formData.pissues ? formData.pissues.split(",").map(issue => issue.trim()) : []
      };
      
      console.log('Submitting project data:', {
        ...submitData,
        pimg: `[${submitData.pimg.length} images]` // Don't log full base64 data
      });
      
      const res = await axios.post("http://localhost:5050/projects", submitData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout for large images
      });
      setMessage("✅ Project added successfully!");
      console.log("Project created:", res.data);
      
      // Reset form
      setFormData({
        pname: "",
        pnumber: "",
        pcode: "",
        plocation: "",
        pimg: [],
        ptype: "",
        pownerid: "",
        pownername: "",
        potelnumber: "",
        pdescription: "",
        ppriority: "",
        pbudget: "",
        pstatus: "",
        penddate: "",
        pissues: "",
        pobservations: "",
      });
      setSelectedImages([]);
      setImagePreviewUrls([]);
      
      // Reset file input
      document.getElementById('pimg').value = '';
      
    } catch (err) {
      console.error('Error submitting project:', err);
      console.error('Error response:', err.response?.data);
      setMessage(`❌ Failed to add project: ${err.response?.data?.message || err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Nav />
      <div className="container mt-4 mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Header Section */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h2 className="card-title mb-0">
                  <i className="fas fa-plus-circle me-2"></i>
                  Add New Project
                </h2>
              </div>
              <div className="card-body">
                {/* Success/Error Message */}
                {message && (
                  <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                    {message}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setMessage("")}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Basic Information Section */}
                  <div className="mb-4">
                    <h5 className="text-primary border-bottom pb-2 mb-3">
                      <i className="fas fa-info-circle me-2"></i>
                      Basic Information
                    </h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="pname" className="form-label fw-semibold">
                          Project Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id="pname"
                          name="pname"
                          className="form-control form-control-lg"
                          value={formData.pname}
                          onChange={handleChange}
                          placeholder="Enter project name"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="pnumber" className="form-label fw-semibold">
                          Project Number <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id="pnumber"
                          name="pnumber"
                          className="form-control form-control-lg"
                          value={formData.pnumber}
                          onChange={handleChange}
                          placeholder="Enter project number"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="pcode" className="form-label fw-semibold">
                          Project Code <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id="pcode"
                          name="pcode"
                          className="form-control form-control-lg"
                          value={formData.pcode}
                          onChange={handleChange}
                          placeholder="Enter project code"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="plocation" className="form-label fw-semibold">
                          Project Location <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id="plocation"
                          name="plocation"
                          className="form-control form-control-lg"
                          value={formData.plocation}
                          onChange={handleChange}
                          placeholder="Enter project location"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="ptype" className="form-label fw-semibold">
                          Project Type <span className="text-danger">*</span>
                        </label>
                        <select
                          id="ptype"
                          name="ptype"
                          className="form-select form-select-lg"
                          value={formData.ptype}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Choose project type...</option>
                          <option value="Residential">🏠 Residential</option>
                          <option value="Commercial">🏢 Commercial</option>
                          <option value="Industrial">🏭 Industrial</option>
                          <option value="Infrastructure">🛣️ Infrastructure</option>
                          <option value="Institutional">🏫 Institutional</option>
                          <option value="Renovation">🔨 Renovation</option>
                          <option value="Landscaping">🌳 Landscaping</option>
                          <option value="Mixed-Use">🏙️ Mixed-Use</option>
                        </select>
                      </div>
                      
                      <div className="col-12">
                        <label htmlFor="pimg" className="form-label fw-semibold">
                          Project Images <span className="text-danger">*</span>
                        </label>
                        <input
                          type="file"
                          id="pimg"
                          name="pimg"
                          className="form-control form-control-lg"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        <div className="form-text">
                          Select multiple images (max 10 files, 2MB each). Images will be automatically compressed for optimal performance. Supported formats: JPEG, PNG, GIF, WebP
                        </div>
                        
                        {/* Image Preview Section */}
                        {imagePreviewUrls.length > 0 && (
                          <div className="mt-3">
                            <h6 className="fw-semibold mb-2">📷 Selected Images Preview</h6>
                            <div className="row g-3">
                              {imagePreviewUrls.map((url, index) => (
                                <div key={index} className="col-lg-3 col-md-4 col-sm-6">
                                  <div className="position-relative">
                                    <img
                                      src={url}
                                      alt={`Preview ${index + 1}`}
                                      className="img-fluid rounded shadow-sm"
                                      style={{
                                        height: '120px',
                                        width: '100%',
                                        objectFit: 'cover',
                                        border: '2px solid #e9ecef'
                                      }}
                                    />
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                      onClick={() => removeImage(index)}
                                      style={{
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        padding: '0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      title="Remove image"
                                    >
                                      ❌
                                    </button>
                                    <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white text-center py-1 rounded-bottom">
                                      <small>{selectedImages[index]?.name}</small>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2">
                              <small className="text-muted">
                                📊 {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
                                {selectedImages.length < 10 && ' (you can add ' + (10 - selectedImages.length) + ' more)'}
                              </small>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Owner Information Section */}
                  <div className="mb-4">
                    <h5 className="text-primary border-bottom pb-2 mb-3">
                      <i className="fas fa-user me-2"></i>
                      Owner Information
                    </h5>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label htmlFor="pownerid" className="form-label fw-semibold">
                          Owner ID <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id="pownerid"
                          name="pownerid"
                          className="form-control form-control-lg"
                          value={formData.pownerid}
                          onChange={handleChange}
                          placeholder="Enter owner ID"
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="pownername" className="form-label fw-semibold">
                          Owner Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id="pownername"
                          name="pownername"
                          className="form-control form-control-lg"
                          value={formData.pownername}
                          onChange={handleChange}
                          placeholder="Enter owner name"
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="potelnumber" className="form-label fw-semibold">
                          Contact Number <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          id="potelnumber"
                          name="potelnumber"
                          className="form-control form-control-lg"
                          value={formData.potelnumber}
                          onChange={handleChange}
                          placeholder="Enter contact number"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Project Details Section */}
                  <div className="mb-4">
                    <h5 className="text-primary border-bottom pb-2 mb-3">
                      <i className="fas fa-cog me-2"></i>
                      Project Details
                    </h5>
                    <div className="row g-3">
                      <div className="col-12">
                        <label htmlFor="pdescription" className="form-label fw-semibold">
                          Description <span className="text-danger">*</span>
                        </label>
                        <textarea
                          id="pdescription"
                          name="pdescription"
                          className="form-control"
                          rows="4"
                          value={formData.pdescription}
                          onChange={handleChange}
                          placeholder="Enter project description..."
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="ppriority" className="form-label fw-semibold">
                          Priority <span className="text-danger">*</span>
                        </label>
                        <select
                          id="ppriority"
                          name="ppriority"
                          className="form-select form-select-lg"
                          value={formData.ppriority}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Choose priority...</option>
                          <option value="High">🔴 High</option>
                          <option value="Medium">🟡 Medium</option>
                          <option value="Low">🟢 Low</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="pbudget" className="form-label fw-semibold">
                          Budget <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text">$</span>
                          <input
                            type="number"
                            id="pbudget"
                            name="pbudget"
                            className="form-control"
                            value={formData.pbudget}
                            onChange={handleChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="pstatus" className="form-label fw-semibold">
                          Status <span className="text-danger">*</span>
                        </label>
                        <select
                          id="pstatus"
                          name="pstatus"
                          className="form-select form-select-lg"
                          value={formData.pstatus}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Choose status...</option>
                          <option value="Planned">📋 Planned</option>
                          <option value="In Progress">⚡ In Progress</option>
                          <option value="Completed">✅ Completed</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="penddate" className="form-label fw-semibold">
                          End Date <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          id="penddate"
                          name="penddate"
                          className="form-control form-control-lg"
                          value={formData.penddate}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="pissues" className="form-label fw-semibold">
                          Issues
                        </label>
                        <input
                          type="text"
                          id="pissues"
                          name="pissues"
                          className="form-control form-control-lg"
                          value={formData.pissues}
                          onChange={handleIssuesChange}
                          placeholder="Enter issues separated by commas"
                        />
                        <div className="form-text">
                          Separate multiple issues with commas
                        </div>
                      </div>
                      <div className="col-12">
                        <label htmlFor="pobservations" className="form-label fw-semibold">
                          Observations
                        </label>
                        <textarea
                          id="pobservations"
                          name="pobservations"
                          className="form-control"
                          rows="3"
                          value={formData.pobservations}
                          onChange={handleChange}
                          placeholder="Enter any observations or notes..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg px-4 py-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Adding Project...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus me-2"></i>
                          Add Project
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}