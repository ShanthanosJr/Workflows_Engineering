import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectHome.css';

const ProjectHome = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  // Simplified video state management
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // State for image loading
  const [imageLoadState, setImageLoadState] = useState({});
  const [loadingTimeouts, setLoadingTimeouts] = useState({});
  const sectionsRef = useRef([]);
  const heroRef = useRef(null);

  // Function to handle image loading with fallback
  const handleImageLoad = (imageId, originalSrc, fallbackSrc) => {
    setImageLoadState(prev => ({ ...prev, [imageId]: 'loaded' }));
    // Clear timeout if image loads successfully
    if (loadingTimeouts[imageId]) {
      clearTimeout(loadingTimeouts[imageId]);
      setLoadingTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[imageId];
        return newTimeouts;
      });
    }
  };

  const handleImageError = (imageId, fallbackSrc, imgElement) => {
    if (imgElement.src !== fallbackSrc) {
      imgElement.src = fallbackSrc;
      setImageLoadState(prev => ({ ...prev, [imageId]: 'fallback' }));
    } else {
      setImageLoadState(prev => ({ ...prev, [imageId]: 'error' }));
    }
  };

  // Set timeout for slow loading images
  const setImageTimeout = (imageId, fallbackSrc, imgElement) => {
    const timeoutId = setTimeout(() => {
      if (imageLoadState[imageId] !== 'loaded') {
        imgElement.src = fallbackSrc;
        setImageLoadState(prev => ({ ...prev, [imageId]: 'timeout' }));
      }
    }, 3000); // 3 second timeout
    
    setLoadingTimeouts(prev => ({ ...prev, [imageId]: timeoutId }));
  };

  // Enhanced image component
  const EnhancedImage = ({ src, fallbackSrc, alt, className, style, imageId }) => {
    const imgRef = useRef(null);
    
    useEffect(() => {
      if (imgRef.current) {
        setImageTimeout(imageId, fallbackSrc, imgRef.current);
      }
      return () => {
        if (loadingTimeouts[imageId]) {
          clearTimeout(loadingTimeouts[imageId]);
        }
      };
    }, [imageId, fallbackSrc]); // Removed loadingTimeouts from dependency array

    return (
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${className || ''} ${imageLoadState[imageId] === 'loaded' ? 'loaded' : ''}`}
        style={{
          ...style,
          opacity: imageLoadState[imageId] === 'loaded' ? 1 : 0.8,
          transition: 'opacity 0.5s ease-in-out'
        }}
        onLoad={() => handleImageLoad(imageId, src, fallbackSrc)}
        onError={() => handleImageError(imageId, fallbackSrc, imgRef.current)}
      />
    );
  };

  // Premium video backgrounds for different sections - Simplified reliable sources
  const heroVideos = [
    "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  ];

  const sectionVideos = {
    intro: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    types: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    process: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    materials: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    technology: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    break: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    history: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thankyou: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4"
  };

  // Demo videos for sections - Simplified sources
  const demoVideos = {
    process: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    technology: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4"
  };

  // Photo booth images (construction-themed galleries) - Multiple reliable sources with fallbacks
  const photoBooths = {
    types: [
      "https://picsum.photos/400/300?random=1",
      "https://picsum.photos/400/300?random=2",
      "https://picsum.photos/400/300?random=3",
      "https://picsum.photos/400/300?random=4"
    ],
    materials: [
      "https://picsum.photos/400/300?random=5",
      "https://picsum.photos/400/300?random=6",
      "https://picsum.photos/400/300?random=7"
    ],
    technology: [
      "https://picsum.photos/400/300?random=8",
      "https://picsum.photos/400/300?random=9",
      "https://picsum.photos/400/300?random=10",
      "https://picsum.photos/400/300?random=11"
    ]
  };

  // Fallback images in case external sources fail
  const fallbackImages = {
    types: [
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23FFD700'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial' font-size='24' fill='%23000'%3EResidential%3C/text%3E%3C/svg%3E",
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23FFA500'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial' font-size='24' fill='%23000'%3ECommercial%3C/text%3E%3C/svg%3E",
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23FFD700'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial' font-size='24' fill='%23000'%3EIndustrial%3C/text%3E%3C/svg%3E",
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23FFA500'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial' font-size='24' fill='%23000'%3EInfrastructure%3C/text%3E%3C/svg%3E"
    ],
    materials: [
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23FFD700'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial' font-size='24' fill='%23000'%3EConcrete%3C/text%3E%3C/svg%3E",
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23FFA500'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial' font-size='24' fill='%23000'%3ESteel%3C/text%3E%3C/svg%3E",
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23FFD700'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial' font-size='24' fill='%23000'%3EWood%3C/text%3E%3C/svg%3E"
    ],
    technology: [
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23FFD700'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial' font-size='18' fill='%23000'%3E3D Printing%3C/text%3E%3C/svg%3E",
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23FFA500'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial' font-size='18' fill='%23000'%3EDrones %26 AI%3C/text%3E%3C/svg%3E",
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23FFD700'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial' font-size='18' fill='%23000'%3ESustainable%3C/text%3E%3C/svg%3E",
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23FFA500'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial' font-size='16' fill='%23000'%3ESmart Buildings%3C/text%3E%3C/svg%3E"
    ]
  };

  // Auto-rotate hero videos - Faster rotation for better experience
  useEffect(() => {
    const videoInterval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % heroVideos.length);
    }, 8000); // Reduced from 15000 to 8000 for better user experience
    return () => clearInterval(videoInterval);
  }, [heroVideos.length]);

  // Track mouse movement for premium parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle scroll events with premium throttling
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Advanced Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [id]: true
            }));
          }
        });
      },
      { 
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  // Features for types of construction
  const features = [
    {
      icon: '🏠',
      title: 'Residential Construction',
      description: 'Building homes with smart workflows.',
      image: photoBooths.types[0],
      fallback: fallbackImages.types[0],
      type: 'Residential'
    },
    {
      icon: '🏢',
      title: 'Commercial Construction',
      description: 'Office and retail spaces with AI optimization.',
      image: photoBooths.types[1],
      fallback: fallbackImages.types[1],
      type: 'Commercial'
    },
    {
      icon: '🏭',
      title: 'Industrial Construction',
      description: 'Factories and warehouses with safety focus.',
      image: photoBooths.types[2],
      fallback: fallbackImages.types[2],
      type: 'Industrial'
    },
    {
      icon: '🌉',
      title: 'Infrastructure Construction',
      description: 'Bridges, roads, and public works.',
      image: photoBooths.types[3],
      fallback: fallbackImages.types[3],
      type: 'Infrastructure'
    }
  ];

  // Construction process steps
  const processSteps = [
    { number: 1, title: 'Planning', description: 'Initial design and planning.' },
    { number: 2, title: 'Foundation', description: 'Building the base.' },
    { number: 3, title: 'Structure', description: 'Erecting the framework.' },
    { number: 4, title: 'Finishing', description: 'Interior and exterior completion.' }
  ];

  // Materials
  const materials = [
    { title: 'Concrete', description: 'Core building material.' },
    { title: 'Steel', description: 'Structural support.' },
    { title: 'Wood', description: 'Sustainable option.' }
  ];

  // Technology
  const technologies = [
    { title: '3D Printing', image: photoBooths.technology[0], fallback: fallbackImages.technology[0] },
    { title: 'Drones & AI', image: photoBooths.technology[1], fallback: fallbackImages.technology[1] },
    { title: 'Sustainable Materials', image: photoBooths.technology[2], fallback: fallbackImages.technology[2] },
    { title: 'Smart Buildings', image: photoBooths.technology[3], fallback: fallbackImages.technology[3] }
  ];

  // History timeline
  const history = [
    { 
      year: 2019, 
      description: 'Founded with focus on smart workflows.', 
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23FFD700'/%3E%3Ctext x='100' y='75' text-anchor='middle' dy='.3em' font-family='Arial' font-size='24' fill='%23000'%3E2019%3C/text%3E%3C/svg%3E"
    },
    { 
      year: 2024, 
      description: 'Expanded to AI integration and safety systems.', 
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23FFA500'/%3E%3Ctext x='100' y='75' text-anchor='middle' dy='.3em' font-family='Arial' font-size='24' fill='%23000'%3E2024%3C/text%3E%3C/svg%3E"
    }
  ];



  return (
    <div className="project-home">
      {/* Header with caution stripes */}
      <header className="global-header">
        <div className="caution-stripe top-stripe"></div>
        <div className="header-content">
          <h1 className="company-name">WORKFLOWS ENGINEERING</h1>
        </div>
      </header>

      {/* Hero Section - Page 1 */}
      <section ref={heroRef} id="hero" className="hero-section section">
        <div className="section-background">
          <video 
            key={currentVideoIndex}
            className="section-video"
            autoPlay 
            muted 
            loop 
            playsInline
            preload="auto"
            style={{
              transform: `translateX(-50%) translateY(-50%)`,
              filter: `brightness(0.6) contrast(1.1)`,
              opacity: 0.8,
              transition: 'opacity 2s ease-in-out'
            }}
          >
            <source src={heroVideos[currentVideoIndex]} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Construction overlay */}
          <div className="construction-overlay"></div>
          
          {/* Floating Construction Equipment */}
          <div className="floating-equipment construction-equipment">
            <div className="equipment-icon" style={{top: '15%', left: '10%', fontSize: '4rem'}}>🏗️</div>
            <div className="equipment-icon" style={{top: '25%', right: '15%', fontSize: '3rem'}}>⚒️</div>
            <div className="equipment-icon" style={{bottom: '30%', left: '20%', fontSize: '3.5rem'}}>🚧</div>
            <div className="equipment-icon" style={{bottom: '20%', right: '10%', fontSize: '4.5rem'}}>🏢</div>
          </div>
          
          {/* Video Progress Indicator */}
          <div className="video-progress-indicator">
            {heroVideos.map((_, index) => (
              <div 
                key={index}
                className={`progress-dot ${index === currentVideoIndex ? 'active' : ''}`}
                onClick={() => setCurrentVideoIndex(index)}
              />
            ))}
          </div>
        </div>
        
        <div className="hero-content construction-hero-content" style={{
          transform: `translateY(${scrollY * 0.1}px) translateX(${mousePosition.x * 5}px)`,
          opacity: Math.max(0.3, 1 - scrollY * 0.0015)
        }}>
          <div className="hero-text construction-hero-text">
            <h1 className="hero-title construction-title">
              <span className="clean-title">The World of</span>
              <br />
              <span className="construction-highlight">Construction</span>
              <br />
              <span className="construction-subtitle">Building Excellence Since 2019</span>
            </h1>
            <p className="construction-company">
              WORKFLOWS ENGINEERING<br/>
              SMART CONSTRUCTION WORKFLOW & SAFETY MANAGEMENT
            </p>
            
            {/* Action Buttons */}
            <div className="hero-buttons construction-buttons">
              <button 
                className="btn construction-btn"
                onClick={() => navigate('/projects')}
              >
                <span className="btn-text">Get Started</span>
              </button>
              <button 
                className="btn construction-outline-btn"
                onClick={() => navigate('/chatbot')}
              >
                <span className="btn-text">AI Assistant</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="scroll-indicator" style={{
          opacity: Math.max(0, 1 - scrollY * 0.01)
        }}>
          <div className="scroll-arrow">
            <span>⬇</span>
          </div>
          <span>Scroll to Explore</span>
        </div>
      </section>

      {/* Introduction - Page 2 */}
      <section id="intro" className="section intro-section" ref={addToRefs}>
        <div className="section-background">
          <video 
            className="section-video"
            autoPlay 
            muted 
            loop 
            playsInline
            preload="auto"
            style={{ opacity: 0.8 }}
          >
            <source src={sectionVideos.intro} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="construction-overlay"></div>
        </div>
        <div className="section-content">
          <div className="text-column">
            <h2 className="construction-title">Introduction<br/>to <span className="construction-highlight">Construction</span></h2>
            <h3>What is Construction?</h3>
            <p>Construction is the process of creating structures, buildings, and infrastructure that form the backbone of our modern society. At Workflows Engineering, we bring decades of expertise, cutting-edge technology, and unwavering commitment to quality in every project we undertake.</p>
            <p><strong>Smart Construction Workflow & Safety Management System</strong> - Building excellence with AI-powered tools, real-time collaboration, and premium analytics that transform your workflow.</p>
          </div>
          <div className="image-column">
            <EnhancedImage 
              src="https://picsum.photos/600/400?random=100" 
              fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23FFD700'/%3E%3Ctext x='300' y='200' text-anchor='middle' dy='.3em' font-family='Arial' font-size='24' fill='%23000'%3EConstruction Management%3C/text%3E%3C/svg%3E"
              alt="Construction Management" 
              imageId="intro-main"
            />
          </div>
        </div>
      </section>

      {/* Types of Construction - Page 3 */}
      <section id="types" className="section types-section" ref={addToRefs}>
        <div className="section-background">
          <video 
            className="section-video"
            autoPlay 
            muted 
            loop 
            playsInline
            preload="none"
            style={{ opacity: 0.8 }}
          >
            <source src={sectionVideos.types} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="construction-overlay"></div>
          <div className="warning-stripe"></div>
        </div>
        <div className="container">
          <div className="section-header construction-section-header">
            <h2 className="construction-title">Types of<br/><span className="construction-highlight">Construction</span></h2>
            <p className="construction-subtitle">Different Sectors in Construction Management</p>
          </div>
          
          <div className="construction-grid">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="construction-card" 
                onClick={() => navigate(feature.route || '/projects')}
                style={{
                  transform: isVisible.types ? 'translateY(0) scale(1)' : 'translateY(100px) scale(0.8)',
                  opacity: isVisible.types ? 1 : 0,
                  transition: `all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.1 * index}s`
                }}
              >
                <div className="construction-icon">
                  {feature.icon}
                </div>
                <h3 className="construction-feature-title">{feature.title}</h3>
                <div className="construction-type">{feature.type}</div>
                <p className="construction-description">{feature.description}</p>
                
                <div className="construction-button" onClick={() => navigate('/projects')}>
                  <span>Explore Now</span>
                  <div className="construction-arrow">→</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Photo Booth for Types */}
          <div className="photo-booth construction-gallery">
            <h3 className="gallery-title">Construction Gallery</h3>
            <div className="photo-grid">
              {photoBooths.types.map((img, index) => (
                <EnhancedImage 
                  key={index} 
                  src={img} 
                  fallbackSrc={fallbackImages.types[index]}
                  alt={`Construction Type ${index + 1}`} 
                  imageId={`types-gallery-${index}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Construction Process - Page 4 */}
      <section id="process" className="section process-section construction-process-section" ref={addToRefs}>
        <div className="section-background">
          <video 
            className="section-video"
            autoPlay 
            muted 
            loop 
            playsInline
            preload="none"
            style={{ opacity: 0.8 }}
          >
            <source src={sectionVideos.process} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="construction-overlay"></div>
          <div className="warning-stripe construction-stripe-bottom"></div>
        </div>
        <div className="container">
          <div className="section-header construction-section-header" style={{textAlign: 'center', marginBottom: '50px'}}>
            <h2 className="construction-title">Construction<br/><span className="construction-highlight">Process</span></h2>
            <p className="construction-subtitle">Steps to Build a Structure</p>
          </div>
          
          <div className="process-grid construction-process-grid">
            {processSteps.map((step, index) => (
              <div 
                key={step.number}
                className="construction-step"
                style={{
                  transform: isVisible.process ? 'translateY(0) scale(1)' : 'translateY(80px) scale(0.9)',
                  opacity: isVisible.process ? 1 : 0,
                  transition: `all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.1 * index}s`
                }}
              >
                <div className="construction-number">{step.number}</div>
                <h4 className="construction-step-title">{step.title}</h4>
                <p className="construction-step-description">{step.description}</p>
              </div>
            ))}
          </div>
          
          {/* Video Demo Booth */}
          <div className="demo-section">
            <h3 className="demo-title">Process Demonstration</h3>
            <video className="demo-video" controls preload="metadata">
              <source src={demoVideos.process} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Essential Materials - Page 5 */}
      <section id="materials" className="section materials-section" ref={addToRefs}>
        <div className="section-background">
          <video 
            className="section-video"
            autoPlay 
            muted 
            loop 
            playsInline
            preload="none"
            style={{ opacity: 0.8 }}
          >
            <source src={sectionVideos.materials} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="construction-overlay"></div>
        </div>
        <div className="container">
          <div className="section-header construction-section-header">
            <h2 className="construction-title">Essential Materials<br/>in <span className="construction-highlight">Construction</span></h2>
            <p className="construction-subtitle">Key Building Components</p>
          </div>
          
          <div className="section-content">
            <div className="text-column">
              <p>High-quality materials tracked with our Smart Construction Workflow & Safety Management System. We ensure quality control and optimal resource allocation for every project.</p>
              <div className="materials-list">
                {materials.map((material, index) => (
                  <div key={index} className="material-item">
                    <h4>{material.title}</h4>
                    <p>{material.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="image-column">
              <EnhancedImage 
                src="https://picsum.photos/600/400?random=101" 
                fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23FFA500'/%3E%3Ctext x='300' y='200' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23000'%3EConstruction Materials%3C/text%3E%3C/svg%3E"
                alt="Construction Materials" 
                imageId="materials-main"
              />
            </div>
          </div>
          
          {/* Photo Booth */}
          <div className="photo-booth construction-gallery">
            <h3 className="gallery-title">Materials Gallery</h3>
            <div className="photo-grid">
              {photoBooths.materials.map((img, index) => (
                <EnhancedImage 
                  key={index} 
                  src={img} 
                  fallbackSrc={fallbackImages.materials[index]}
                  alt={`Material ${index + 1}`} 
                  imageId={`materials-gallery-${index}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modern Technology - Page 6 */}
      <section id="technology" className="section technology-section" ref={addToRefs}>
        <div className="section-background">
          <video 
            className="section-video"
            autoPlay 
            muted 
            loop 
            playsInline
            preload="none"
            style={{ opacity: 0.8 }}
          >
            <source src={sectionVideos.technology} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="construction-overlay"></div>
        </div>
        <div className="container">
          <div className="section-header construction-section-header">
            <h2 className="construction-title">Modern Technology<br/>in <span className="construction-highlight">Construction</span></h2>
            <p className="construction-subtitle">Innovation in the Industry</p>
          </div>
          
          <div className="section-content">
            <div className="text-column">
              <p>Integrating cutting-edge technology for better results. Our Smart Construction Workflow & Safety Management System leverages the latest innovations to improve efficiency, safety, and precision in construction projects.</p>
            </div>
            <div className="tech-grid">
              {technologies.map((tech, index) => (
                <div 
                  key={index} 
                  className="tech-item"
                  style={{
                    transform: isVisible.technology ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.9)',
                    opacity: isVisible.technology ? 1 : 0,
                    transition: `all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.1 * index}s`
                  }}
                >
                  <EnhancedImage 
                    src={tech.image} 
                    fallbackSrc={tech.fallback}
                    alt={tech.title} 
                    imageId={`tech-${index}`}
                  />
                  <h4>{tech.title}</h4>
                </div>
              ))}
            </div>
          </div>
          
          {/* Video Demo */}
          <div className="demo-section">
            <h3 className="demo-title">Technology Demonstration</h3>
            <video className="demo-video" controls preload="metadata">
              <source src={demoVideos.technology} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          
          {/* Photo Booth */}
          <div className="photo-booth construction-gallery">
            <h3 className="gallery-title">Technology Gallery</h3>
            <div className="photo-grid">
              {photoBooths.technology.map((img, index) => (
                <EnhancedImage 
                  key={index} 
                  src={img} 
                  fallbackSrc={fallbackImages.technology[index]}
                  alt={`Tech ${index + 1}`} 
                  imageId={`tech-gallery-${index}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Break Slides - Page 7 */}
      <section id="break" className="section break-section" ref={addToRefs}>
        <div className="section-background">
          <video 
            className="section-video"
            autoPlay 
            muted 
            loop 
            playsInline
            preload="none"
            style={{ opacity: 0.8 }}
          >
            <source src={sectionVideos.break} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="construction-overlay"></div>
        </div>
        <div className="container">
          <div className="section-content">
            <div className="text-column">
              <h2 className="construction-title">Innovation<br/><span className="construction-highlight">Showcase</span></h2>
              <p>Discover how our Smart Construction Workflow & Safety Management System transforms traditional construction practices through innovative technology and data-driven insights.</p>
            </div>
            <div className="image-column">
              <EnhancedImage 
                src="https://picsum.photos/600/400?random=102" 
                fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23FFD700'/%3E%3Ctext x='300' y='200' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23000'%3EConstruction Innovation%3C/text%3E%3C/svg%3E"
                alt="Construction Innovation" 
                imageId="break-main"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our History - Pages 8-9 */}
      <section id="history" className="section history-section" ref={addToRefs}>
        <div className="section-background">
          <video 
            className="section-video"
            autoPlay 
            muted 
            loop 
            playsInline
            preload="none"
            style={{ opacity: 0.8 }}
          >
            <source src={sectionVideos.history} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="construction-overlay"></div>
        </div>
        <div className="container">
          <div className="section-header construction-section-header">
            <h2 className="construction-title">Our <span className="construction-highlight">History</span></h2>
            <p className="construction-subtitle">WORKFLOWS ENGINEERING</p>
          </div>
          
          <div className="timeline">
            {history.map((item, index) => (
              <div 
                key={index} 
                className="timeline-item"
                style={{
                  transform: isVisible.history ? 'translateX(0)' : 'translateX(-100px)',
                  opacity: isVisible.history ? 1 : 0,
                  transition: `all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.2 * index}s`
                }}
              >
                <div className="year">{item.year}</div>
                <div className="timeline-content">
                  <p>{item.description}</p>
                </div>
                <EnhancedImage 
                  src={item.image} 
                  fallbackSrc={item.image}
                  alt={`History ${item.year}`} 
                  imageId={`history-${index}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Thank You - Page 10 */}
      <section id="thankyou" className="section thankyou-section" ref={addToRefs}>
        <div className="section-background">
          <video 
            className="section-video"
            autoPlay 
            muted 
            loop 
            playsInline
            preload="none"
            style={{ opacity: 0.8 }}
          >
            <source src={sectionVideos.thankyou} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="construction-overlay"></div>
        </div>
        <div className="container">
          <div className="section-content">
            <div className="text-column" style={{textAlign: 'center'}}>
              <h2 className="construction-title" style={{fontSize: '4rem', marginBottom: '2rem'}}>Thank You!</h2>
              <p className="construction-company">
                WORKFLOWS ENGINEERING<br/>
                SMART CONSTRUCTION WORKFLOW & SAFETY MANAGEMENT<br/>
                WWW.WORKFLOWSENGINEERING.COM
              </p>
              
              {/* Final CTA Buttons */}
              <div className="hero-buttons construction-buttons" style={{marginTop: '3rem'}}>
                <button 
                  className="btn construction-btn"
                  onClick={() => navigate('/projects')}
                >
                  <span className="btn-text">Start Your Project</span>
                </button>
                <button 
                  className="btn construction-outline-btn"
                  onClick={() => navigate('/chatbot')}
                >
                  <span className="btn-text">Contact Us</span>
                </button>
              </div>
            </div>
            <div className="image-column">
              <EnhancedImage 
                src="https://picsum.photos/600/400?random=103" 
                fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23FFA500'/%3E%3Ctext x='300' y='200' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23000'%3EConstruction Excellence%3C/text%3E%3C/svg%3E"
                alt="Construction Excellence" 
                imageId="thankyou-main"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer with caution stripes */}
      <footer className="global-footer">
        <div className="footer-content">
          <p>WWW.WORKFLOWSENGINEERING.COM</p>
        </div>
        <div className="caution-stripe bottom-stripe"></div>
      </footer>
    </div>
  );
};

export default ProjectHome;