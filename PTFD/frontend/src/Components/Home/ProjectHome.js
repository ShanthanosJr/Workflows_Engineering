import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectHome.css';

const ProjectHome = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeGallery, setActiveGallery] = useState(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const sectionsRef = useRef([]);
  const heroRef = useRef(null);

  // Handle scroll events with throttling for performance
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

  // Advanced Intersection Observer with Apple-style triggers
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const ratio = entry.intersectionRatio;
          
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [id]: true
            }));
          } else if (ratio === 0 && isVisible[id]) {
            // Apple-style: Remove visibility when completely out of view
            setIsVisible(prev => ({
              ...prev,
              [id]: false
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
  }, [isVisible]);

  // Track current section for Apple-style navigation
  // useEffect(() => {
  //   const sections = sectionsRef.current;
  //   const handleSectionTracking = () => {
  //     const scrollPosition = window.scrollY + window.innerHeight / 2;
  //     
  //     sections.forEach((section, index) => {
  //       if (section) {
  //         const rect = section.getBoundingClientRect();
  //         const sectionTop = rect.top + window.scrollY;
  //         const sectionBottom = sectionTop + rect.height;
  //         
  //         if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
  //           setCurrentSection(index);
  //         }
  //       }
  //     });
  //   };

  //   window.addEventListener('scroll', handleSectionTracking, { passive: true });
  //   return () => window.removeEventListener('scroll', handleSectionTracking);
  // }, []);

  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  const openVideoModal = (videoType) => {
    setActiveVideo(videoType);
  };

  const closeVideoModal = () => {
    setActiveVideo(null);
  };

  const openGalleryModal = (galleryType) => {
    setActiveGallery(galleryType);
  };

  const closeGalleryModal = () => {
    setActiveGallery(null);
  };

  const navigationCards = [
    {
      title: 'Projects',
      description: 'Manage construction workflows with multiple images, detailed tracking, and safety protocols.',
      icon: '🏗️',
      route: '/projects',
      color: '#FFD700',
      delay: '0s'
    },
    {
      title: 'Timelines',
      description: 'Create workflow timelines, track progress, and ensure safety compliance.',
      icon: '📅',
      route: '/timelines',
      color: '#FFA500',
      delay: '0.2s'
    },
    {
      title: 'Project-Timelines',
      description: 'Advanced workflow timeline management with integrated safety milestones.',
      icon: '⏱️',
      route: '/project-timelines',
      color: '#FFD700',
      delay: '0.4s'
    },
    {
      title: 'Dashboards',
      description: 'Comprehensive analytics, cost calculation, and safety management dashboards.',
      icon: '💰',
      route: '/financial-dashboard',
      color: '#FFA500',
      delay: '0.6s'
    },
    {
      title: 'Talk to an AI',
      description: 'Get instant answers about workflows, safety protocols, and engineering solutions.',
      icon: '🤖',
      route: '/chatbot',
      color: '#FFD700',
      delay: '0.8s'
    }
  ];

  return (
    <div className="project-home">
      {/* Hero Section with Apple-style parallax */}
      <section ref={heroRef} className="hero-section">
        <div className="hero-background">
          {!videoLoaded && (
            <div className="video-loading-placeholder">
              <div className="loading-spinner"></div>
              <p>Loading construction video...</p>
            </div>
          )}
          <video 
            className="hero-video"
            autoPlay 
            muted 
            loop 
            playsInline
            preload="metadata"
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => setVideoLoaded(true)}
            style={{
              transform: `translateX(-50%) translateY(-50%) translateZ(0) scale(${1 + scrollY * 0.0005})`,
              filter: `brightness(${Math.max(0.3, 1 - scrollY * 0.001)})`,
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 1s ease-in-out'
            }}
          >
            {/* Construction, Engineering & Architecture project videos */}
            <source src="https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4" type="video/mp4" />
            <source src="https://videos.pexels.com/video-files/8960228/8960228-hd_1920_1080_30fps.mp4" type="video/mp4" />
            <source src="https://videos.pexels.com/video-files/3141211/3141211-hd_1920_1080_30fps.mp4" type="video/mp4" />
            <source src="https://videos.pexels.com/video-files/7578555/7578555-hd_1920_1080_30fps.mp4" type="video/mp4" />
            <source src="https://videos.pexels.com/video-files/3196271/3196271-hd_1920_1080_25fps.mp4" type="video/mp4" />
            {/* Fallback image if video doesn't load */}
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop" 
              alt="Construction Engineering Background"
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
            />
          </video>
          <div className="construction-overlay" style={{
            opacity: Math.min(1, 0.7 + scrollY * 0.001)
          }}></div>
          <div className="hero-particles">
            {[...Array(50)].map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
                transform: `translateY(${scrollY * (0.1 + Math.random() * 0.2)}px)`
              }}></div>
            ))}
          </div>
          <div className="animated-shapes">
            <div className="shape shape-1" style={{
              transform: `translateY(${scrollY * 0.3}px) rotate(${scrollY * 0.5}deg)`
            }}></div>
            <div className="shape shape-2" style={{
              transform: `translateY(${scrollY * 0.4}px) rotate(${-scrollY * 0.3}deg)`
            }}></div>
            <div className="shape shape-3" style={{
              transform: `translateY(${scrollY * 0.2}px) rotate(${scrollY * 0.4}deg)`
            }}></div>
          </div>
        </div>
        
        <div className="hero-content" style={{
          transform: `translateY(${scrollY * 0.3}px)`,
          opacity: Math.max(0, 1 - scrollY * 0.002)
        }}>
          <div className="hero-text">
            <h1 className="hero-title apple-fade-in">
              <span className="highlight glitch apple-slide-left" data-text="Workflows Engineering">Workflows Engineering</span>
              <br />
              <span className="typewriter apple-slide-right">Smart Construction Workflow &</span>
              <br />
              <span className="typewriter-2 apple-slide-left">Safety Management System</span>
            </h1>
            <p className="hero-subtitle apple-fade-up animate-delay-1">
              Advanced Engineering Solutions for Digital Construction Workflow Management and Safety Protocols
            </p>
            <div className="hero-stats apple-fade-up animate-delay-2">
              <div className="stat apple-scale-in" style={{ animationDelay: '0.5s' }}>
                <span className="stat-number">500+</span>
                <span className="stat-label">Projects Completed</span>
              </div>
              <div className="stat apple-scale-in" style={{ animationDelay: '0.7s' }}>
                <span className="stat-number">95%</span>
                <span className="stat-label">Success Rate</span>
              </div>
              <div className="stat apple-scale-in" style={{ animationDelay: '0.9s' }}>
                <span className="stat-number">24/7</span>
                <span className="stat-label">AI Support</span>
              </div>
            </div>
            <div className="hero-buttons apple-fade-up animate-delay-3">
              <button 
                className="btn btn-primary btn-lg pulse-btn apple-button-hover me-4"
                onClick={() => navigate('/projects')}
              >
                <span className="btn-icon">🏗️</span>
                <span className="btn-text">Explore Projects</span>
                <div className="btn-ripple"></div>
              </button>
              <button 
                className="btn btn-outline-warning btn-lg glow-btn apple-button-hover"
                onClick={() => navigate('/chatbot')}
              >
                <span className="btn-icon">🤖</span>
                <span className="btn-text">Talk to AI</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="scroll-indicator" style={{
          opacity: Math.max(0, 1 - scrollY * 0.01)
        }}>
          <div className="scroll-arrow bounce apple-bounce">
            <span>⬇</span>
          </div>
          <span>Scroll to Explore</span>
        </div>
      </section>

      {/* Features Section with Apple-style animations */}
      <section 
        id="features" 
        ref={addToRefs}
        className={`features-section apple-section ${isVisible.features ? 'apple-animate-in' : 'apple-animate-out'}`}
        style={{
          transform: isVisible.features ? 'translateY(0)' : 'translateY(100px)',
          opacity: isVisible.features ? 1 : 0,
          transition: 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        <div className="container">
          <div className="section-header apple-section-header">
            <h2 className="apple-slide-up" style={{
              transform: isVisible.features ? 'translateY(0)' : 'translateY(50px)',
              opacity: isVisible.features ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}>Modern Construction Management</h2>
            <p className="apple-slide-up" style={{
              transform: isVisible.features ? 'translateY(0)' : 'translateY(30px)',
              opacity: isVisible.features ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s'
            }}>Cutting-edge tools for today's construction professionals</p>
          </div>
          
          <div className="features-grid apple-grid">
            {[
              {
                id: 'projects',
                title: 'Advanced Workflow Tracking',
                description: 'Real-time workflow monitoring with interactive dashboards and comprehensive safety reporting.',
                image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=250&fit=crop&auto=format',
                alt: 'Construction Management',
                icon: '▶️',
                label: 'Workflow Management Demo'
              },
              {
                id: 'analytics',
                title: 'Safety Analytics',
                description: 'Smart safety management and risk analysis with real-time monitoring',
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&auto=format',
                alt: 'Safety Analytics Dashboard',
                icon: '📊',
                label: 'Safety Analytics Demo'
              },
              {
                id: 'realtime',
                title: 'Real-time Updates',
                description: 'Live workflow status and safety protocol tracking',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&auto=format',
                alt: 'Real-time Updates Dashboard',
                icon: '🔄',
                label: 'Real-time Updates Demo'
              },
              {
                id: 'mobile',
                title: 'Mobile Ready',
                description: 'Access workflows and safety protocols anywhere, anytime',
                image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop&auto=format',
                alt: 'Mobile Construction App',
                icon: '📱',
                label: 'Mobile App Demo'
              }
            ].map((feature, index) => (
              <div 
                key={feature.id}
                className="feature-card apple-card" 
                onClick={() => feature.id === 'projects' || feature.id === 'realtime' ? openVideoModal(feature.id) : openGalleryModal(feature.id)}
                style={{
                  transform: isVisible.features ? 'translateX(0) scale(1)' : 'translateX(-100px) scale(0.8)',
                  opacity: isVisible.features ? 1 : 0,
                  transition: `all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.1 * index}s`
                }}
              >
                <div className="feature-video apple-media">
                  <img 
                    src={feature.image}
                    alt={feature.alt}
                    className="feature-image apple-image"
                  />
                  <div className="video-overlay apple-overlay">
                    <div className="play-button pulse apple-play-button">
                      <div className="play-icon">{feature.icon}</div>
                    </div>
                    <div className="video-label apple-label">{feature.label}</div>
                  </div>
                </div>
                <div className="feature-content apple-content">
                  <h3 className="apple-heading">{feature.title}</h3>
                  <p className="apple-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Cards Section with Apple-style staggered animations */}
      <section 
        id="navigation" 
        ref={addToRefs}
        className={`navigation-section apple-section ${isVisible.navigation ? 'apple-animate-in' : 'apple-animate-out'}`}
        style={{
          transform: isVisible.navigation ? 'translateY(0)' : 'translateY(100px)',
          opacity: isVisible.navigation ? 1 : 0,
          transition: 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s'
        }}
      >
        <div className="container">
          <div className="section-header apple-section-header">
            <h2 className="apple-slide-up" style={{
              transform: isVisible.navigation ? 'translateY(0)' : 'translateY(50px)',
              opacity: isVisible.navigation ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}>Explore Our Platform</h2>
            <p className="apple-slide-up" style={{
              transform: isVisible.navigation ? 'translateY(0)' : 'translateY(30px)',
              opacity: isVisible.navigation ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s'
            }}>Discover powerful tools designed for construction professionals</p>
          </div>
          
          <div className="navigation-grid apple-grid">
            {navigationCards.map((card, index) => (
              <div 
                key={index}
                className="nav-card apple-card"
                style={{ 
                  animationDelay: card.delay,
                  transform: isVisible.navigation ? 'translateX(0) rotateY(0deg) scale(1)' : `translateX(${index % 2 === 0 ? '-100px' : '100px'}) rotateY(${index % 2 === 0 ? '-15deg' : '15deg'}) scale(0.8)`,
                  opacity: isVisible.navigation ? 1 : 0,
                  transition: `all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.1 * index}s`
                }}
                onClick={() => navigate(card.route)}
              >
                <div className="card-background apple-card-bg"></div>
                <div className="card-content apple-content">
                  <div className="card-icon apple-icon" style={{ color: card.color }}>
                    {card.icon}
                  </div>
                  <h3 className="apple-heading">{card.title}</h3>
                  <p className="apple-description">{card.description}</p>
                  <div className="card-button apple-button">
                    <span>Explore Now</span>
                    <div className="button-arrow apple-arrow">→</div>
                  </div>
                </div>
                <div className="card-hover-effect apple-hover"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section with Apple-style reveal animations */}
      <section 
        id="gallery" 
        ref={addToRefs}
        className={`gallery-section apple-section ${isVisible.gallery ? 'apple-animate-in' : 'apple-animate-out'}`}
        style={{
          transform: isVisible.gallery ? 'translateY(0)' : 'translateY(100px)',
          opacity: isVisible.gallery ? 1 : 0,
          transition: 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s'
        }}
      >
        <div className="container">
          <div className="section-header apple-section-header">
            <h2 className="apple-slide-up" style={{
              transform: isVisible.gallery ? 'translateY(0)' : 'translateY(50px)',
              opacity: isVisible.gallery ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}>Workflow Showcase</h2>
            <p className="apple-slide-up" style={{
              transform: isVisible.gallery ? 'translateY(0)' : 'translateY(30px)',
              opacity: isVisible.gallery ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s'
            }}>See our engineering solutions in action across various construction workflows</p>
          </div>
          
          <div className="gallery-grid apple-gallery">
            {[
              {
                route: '/projects',
                image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop',
                alt: 'Construction Workflow',
                title: 'Workflow Management',
                description: 'Advanced project workflow with safety protocols',
                buttonText: 'View Projects →'
              },
              {
                route: '/financial-dashboard',
                image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
                alt: 'Dashboard Analytics',
                title: 'Analytics Dashboard',
                description: 'Real-time workflow analytics',
                buttonText: 'View Dashboard →'
              },
              {
                route: '/timelines',
                image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
                alt: 'Safety Management',
                title: 'Safety Timeline',
                description: 'Construction safety management',
                buttonText: 'View Timelines →'
              },
              {
                route: '/chatbot',
                image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=400&h=300&fit=crop',
                alt: 'AI Assistant',
                title: 'AI Engineering',
                description: 'Smart workflow assistance',
                buttonText: 'Talk to AI →'
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="gallery-item apple-gallery-item" 
                onClick={() => navigate(item.route)}
                style={{
                  transform: isVisible.gallery ? 'scale(1) rotateY(0deg)' : 'scale(0.8) rotateY(5deg)',
                  opacity: isVisible.gallery ? 1 : 0,
                  transition: `all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.1 * index}s`
                }}
              >
                <div className="gallery-image apple-gallery-image">
                  <img src={item.image} alt={item.alt} className="apple-image" />
                  <div className="gallery-overlay apple-overlay">
                    <h4 className="apple-heading">{item.title}</h4>
                    <p className="apple-description">{item.description}</p>
                    <div className="view-button apple-button">{item.buttonText}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with Apple-style counters */}
      <section 
        id="stats" 
        ref={addToRefs}
        className={`stats-section apple-section ${isVisible.stats ? 'apple-animate-in' : 'apple-animate-out'}`}
        style={{
          transform: isVisible.stats ? 'translateY(0)' : 'translateY(100px)',
          opacity: isVisible.stats ? 1 : 0,
          transition: 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s'
        }}
      >
        <div className="container">
          <div className="stats-grid apple-stats">
            {[
              { icon: '🏗️', number: '1,250+', label: 'Projects Managed' },
              { icon: '👥', number: '150+', label: 'Active Teams' },
              { icon: '💰', number: '$50M+', label: 'Budget Managed' },
              { icon: '⏱️', number: '99.5%', label: 'On-Time Delivery' }
            ].map((stat, index) => (
              <div 
                key={index}
                className="stat-card apple-stat-card"
                style={{
                  transform: isVisible.stats ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.8)',
                  opacity: isVisible.stats ? 1 : 0,
                  transition: `all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.1 * index}s`
                }}
              >
                <div className="stat-icon apple-stat-icon">{stat.icon}</div>
                <div className="stat-number apple-stat-number">{stat.number}</div>
                <div className="stat-label apple-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Workflows Engineering</h3>
              <p>Smart Construction Workflow & Safety Management System</p>
              <div className="social-links">
                <button className="social-btn" aria-label="Facebook">📘</button>
                <button className="social-btn" aria-label="Twitter">🐦</button>
                <button className="social-btn" aria-label="LinkedIn">💼</button>
                <button className="social-btn" aria-label="Instagram">📷</button>
              </div>
            </div>
            
            <div className="footer-section">
              <h4>Platform</h4>
              <ul>
                <li><button className="footer-link-btn" onClick={() => navigate('/projects')}>Projects</button></li>
                <li><button className="footer-link-btn" onClick={() => navigate('/timelines')}>Timelines</button></li>
                <li><button className="footer-link-btn" onClick={() => navigate('/project-timelines')}>Project-Timelines</button></li>
                <li><button className="footer-link-btn" onClick={() => navigate('/financial-dashboard')}>Dashboards</button></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><button className="footer-link-btn" onClick={() => navigate('/chatbot')}>Talk to an AI</button></li>
                <li><button className="footer-link-btn">Documentation</button></li>
                <li><button className="footer-link-btn">Help Center</button></li>
                <li><button className="footer-link-btn">Contact Us</button></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Contact</h4>
              <div className="contact-info">
                <p>📧 info@scwms.com</p>
                <p>📞 +1 (555) 123-4567</p>
                <p>📍 123 Construction Ave, City, State 12345</p>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 Workflows Engineering - Smart Construction Workflow & Safety Management. All rights reserved.</p>
            <div className="footer-links">
              <button className="footer-link-btn">Privacy Policy</button>
              <button className="footer-link-btn">Terms of Service</button>
              <button className="footer-link-btn">Cookie Policy</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {activeVideo && (
        <div className="modal-overlay" onClick={closeVideoModal}>
          <div className="modal-content video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeVideoModal}>✕</button>
            <div className="modal-header">
              <h3>
                {activeVideo === 'projects' && 'Project Management Demo'}
                {activeVideo === 'realtime' && 'Real-time Updates Demo'}
                {activeVideo === 'ai' && 'AI Assistant Demo'}
              </h3>
            </div>
            <div className="video-container">
              <div className="video-placeholder">
                <div className="play-icon-large">▶️</div>
                <p>Video content would be embedded here</p>
                <small>Click to play demo video</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {activeGallery && (
        <div className="modal-overlay" onClick={closeGalleryModal}>
          <div className="modal-content gallery-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeGalleryModal}>✕</button>
            <div className="modal-header">
              <h3>
                {activeGallery === 'analytics' && 'Financial Analytics Gallery'}
                {activeGallery === 'mobile' && 'Mobile App Screenshots'}
                {activeGallery === 'projects' && 'Project Showcase'}
                {activeGallery === 'timelines' && 'Timeline Management Gallery'}
              </h3>
            </div>
            <div className="gallery-grid-modal">
              <div className="gallery-item-modal">
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop" alt="Dashboard" />
                <div className="image-overlay">
                  <span>Dashboard Overview</span>
                </div>
              </div>
              <div className="gallery-item-modal">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop" alt="Analytics" />
                <div className="image-overlay">
                  <span>Analytics View</span>
                </div>
              </div>
              <div className="gallery-item-modal">
                <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop" alt="Mobile" />
                <div className="image-overlay">
                  <span>Mobile Interface</span>
                </div>
              </div>
              <div className="gallery-item-modal">
                <img src="https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop" alt="Reports" />
                <div className="image-overlay">
                  <span>Reports & Charts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectHome;