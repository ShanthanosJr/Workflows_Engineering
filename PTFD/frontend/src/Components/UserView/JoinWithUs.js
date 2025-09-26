import React, { useState, useEffect } from "react";
import axios from "axios";
import "./JoinWithUs.css";
import "../Nav/ptfdFooter.css";
import NavV2 from "../Nav/NavV2";
import { useNavigate } from "react-router-dom";
import Footer from "../Nav/ptfdFooter";

const JoinWithUs = () => {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [currentTeamMember, setCurrentTeamMember] = useState(0);
    const [currentProject, setCurrentProject] = useState(0);
    const [currentProcess, setCurrentProcess] = useState(0);
    const [heroAnimationStep, setHeroAnimationStep] = useState(0);

    const [projects, setProjects] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        preqname: "",
        preqmail: "",
        preqnumber: "",
        preqdescription: ""
    });
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState("");

    // Fetch projects from API
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get("http://localhost:5050/projects");
                const projectData = response.data.projects || [];
                setProjects(projectData);
            } catch (error) {
                console.error("Error fetching projects:", error);
                setProjects([]);
            }
        };

        fetchProjects();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitting(true);
        setFormMessage("");

        try {
            await axios.post("http://localhost:5050/project-requests", formData);
            setFormMessage("Thank you! Your project request has been submitted successfully. Our team will contact you soon.");

            setFormData({
                preqname: "",
                preqmail: "",
                preqnumber: "",
                preqdescription: ""
            });

            setTimeout(() => {
                setFormMessage("");
            }, 5000);
        } catch (error) {
            console.error("Error submitting project request:", error);
            setFormMessage("Sorry, there was an error submitting your request. Please try again.");
        } finally {
            setFormSubmitting(false);
        }
    };

    // Hero animation steps
    const heroSteps = [
        {
            title: "Transform Your Vision",
            subtitle: "Into Reality",
            description: "Partner with industry leaders who bring decades of expertise to every project"
        },
        {
            title: "Build Your Dreams",
            subtitle: "With Excellence",
            description: "Experience unmatched quality and innovation in every construction phase"
        },
        {
            title: "Create Tomorrow's",
            subtitle: "Infrastructure",
            description: "Join thousands of satisfied clients who chose excellence over ordinary"
        }
    ];

    // Team members with profiles
    const teamMembers = [
        {
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            name: "Michael Rodriguez",
            role: "Chief Engineer",
            experience: "15+ Years",
            specialty: "Structural Engineering",
            projects: "200+ Projects",
            description: "Leading structural engineer with expertise in high-rise buildings and complex infrastructure projects."
        },
        {
            image: "https://images.pexels.com/photos/10041267/pexels-photo-10041267.jpeg",
            name: "Sarah Chen",
            role: "Lead Architect",
            experience: "12+ Years",
            specialty: "Sustainable Design",
            projects: "150+ Projects",
            description: "Award-winning architect specializing in eco-friendly and innovative architectural solutions."
        },
        {
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            name: "David Thompson",
            role: "Project Manager",
            experience: "18+ Years",
            specialty: "Large Scale Projects",
            projects: "300+ Projects",
            description: "Experienced project manager ensuring timely delivery and quality control across all project phases."
        },
        {
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            name: "Emily Johnson",
            role: "Financial Director",
            experience: "14+ Years",
            specialty: "Cost Optimization",
            projects: "250+ Projects",
            description: "Financial expert ensuring optimal budget management and cost-effective project delivery."
        }
    ];

    const displayedProjects = projects.slice(0, 4);

    // Process steps
    const processSteps = [
        {
            icon: "📋",
            title: "Initial Consultation",
            description: "Free consultation to understand your vision, requirements, and project scope with detailed analysis."
        },
        {
            icon: "📐",
            title: "Design & Planning",
            description: "Comprehensive design development with 3D modeling, engineering analysis, and permit acquisition."
        },
        {
            icon: "🏗️",
            title: "Construction Phase",
            description: "Professional execution with daily progress updates, quality control, and safety management."
        },
        {
            icon: "✅",
            title: "Project Delivery",
            description: "Final inspection, quality assurance, and seamless handover with ongoing support."
        }
    ];

    // Client testimonials
    const testimonials = [
        {
            name: "Robert Anderson",
            company: "Anderson Enterprises",
            project: "Corporate Headquarters",
            rating: 5,
            text: "Exceptional quality and professionalism. They delivered our corporate headquarters ahead of schedule and under budget. Highly recommended!"
        },
        {
            name: "Maria Garcia",
            company: "Garcia Development",
            project: "Residential Complex",
            rating: 5,
            text: "Outstanding team with incredible attention to detail. Our residential complex exceeded all expectations in both design and execution."
        },
        {
            name: "James Wilson",
            company: "Wilson Industries",
            project: "Manufacturing Facility",
            rating: 5,
            text: "Professional, reliable, and innovative. They transformed our vision into a state-of-the-art manufacturing facility that boosted our productivity."
        }
    ];

    // Auto-advance animations
    const navigate = useNavigate();
    useEffect(() => {
        const interval = setInterval(() => {
            setHeroAnimationStep((prev) => (prev + 1) % heroSteps.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [heroSteps.length]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTeamMember((prev) => (prev + 1) % teamMembers.length);
        }, 4500);
        return () => clearInterval(interval);
    }, [teamMembers.length]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentProject((prev) => (prev + 1) % (displayedProjects.length || 1));
        }, 3500);
        return () => clearInterval(interval);
    }, [displayedProjects.length]);

    const nextTeamMember = () => {
        setCurrentTeamMember((prev) => (prev + 1) % teamMembers.length);
    };

    const prevTeamMember = () => {
        setCurrentTeamMember((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
    };

    const nextProcess = () => {
        setCurrentProcess((prev) => (prev + 1) % processSteps.length);
    };

    const prevProcess = () => {
        setCurrentProcess((prev) => (prev - 1 + processSteps.length) % processSteps.length);
    };

    return (
        <div className="construction-join-container">
            <NavV2 />

            {/* Advanced Hero Section with Video Background */}
            <section className="construction-hero">
                <div className="construction-hero-video-bg">
                    <video autoPlay loop muted playsInline>
                        <source src="https://www.pexels.com/download/video/27864490/" type="video/mp4" />
                    </video>
                    <div className="construction-hero-overlay"></div>
                </div>

                <div className="construction-hero-grid">
                    <div className="construction-hero-content">
                        <div className="construction-hero-badge">
                            <span className="construction-badge-icon">🏆</span>
                            <span className="construction-badge-text">Industry Leaders Since 2025</span>
                        </div>

                        <h1 className="construction-hero-title">
                            {heroSteps[heroAnimationStep].title}
                            <span className="construction-hero-accent">
                                {heroSteps[heroAnimationStep].subtitle}
                            </span>
                        </h1>

                        <p className="construction-hero-description">
                            {heroSteps[heroAnimationStep].description}
                        </p>

                        <div className="construction-hero-metrics">
                            <div className="construction-metric-card">
                                <div className="construction-metric-number">500+</div>
                                <div className="construction-metric-label">Projects Delivered</div>
                                <div className="construction-metric-icon">🏗️</div>
                            </div>
                            <div className="construction-metric-card">
                                <div className="construction-metric-number">100+</div>
                                <div className="construction-metric-label">Active Engineers</div>
                                <div className="construction-metric-icon">👷</div>
                            </div>
                            <div className="construction-metric-card">
                                <div className="construction-metric-number">98%</div>
                                <div className="construction-metric-label">Client Satisfaction</div>
                                <div className="construction-metric-icon">⭐</div>
                            </div>
                        </div>

                        <div className="construction-hero-actions">
                            <button
                                className="construction-btn construction-btn-primary"
                                onClick={() => document.getElementById("contact-form").scrollIntoView({ behavior: "smooth" })}
                            >
                                <span className="construction-btn-icon">🚀</span>
                                Start Your Project
                            </button>
                            <button
                                onClick={() => navigate("/user-projects")}
                                className="construction-btn construction-btn-secondary"
                            >
                                <span className="construction-btn-icon">📁</span>
                                View Portfolio
                            </button>
                        </div>
                    </div>

                    <div className="construction-hero-visual">
                        <div className="construction-hero-dashboard">
                            <div className="construction-dashboard-header">
                                <div className="construction-dashboard-title">Project Control Center</div>
                                <div className="construction-dashboard-status">
                                    <span className="construction-status-dot active"></span>
                                    Live Monitoring
                                </div>
                            </div>
                            <div className="construction-dashboard-content">
                                <div className="construction-progress-section">
                                    <div className="construction-progress-item">
                                        <span className="construction-progress-label">Foundation</span>
                                        <div className="construction-progress-bar">
                                            <div className="construction-progress-fill" style={{ width: '100%' }}></div>
                                        </div>
                                        <span className="construction-progress-value">100%</span>
                                    </div>
                                    <div className="construction-progress-item">
                                        <span className="construction-progress-label">Structure</span>
                                        <div className="construction-progress-bar">
                                            <div className="construction-progress-fill" style={{ width: '75%' }}></div>
                                        </div>
                                        <span className="construction-progress-value">75%</span>
                                    </div>
                                    <div className="construction-progress-item">
                                        <span className="construction-progress-label">Finishing</span>
                                        <div className="construction-progress-bar">
                                            <div className="construction-progress-fill" style={{ width: '45%' }}></div>
                                        </div>
                                        <span className="construction-progress-value">45%</span>
                                    </div>
                                </div>
                                <div className="construction-dashboard-stats">
                                    <div className="construction-stat-item">
                                        <span className="construction-stat-icon">👷</span>
                                        <span className="construction-stat-value">24</span>
                                        <span className="construction-stat-label">Workers</span>
                                    </div>
                                    <div className="construction-stat-item">
                                        <span className="construction-stat-icon">🏗️</span>
                                        <span className="construction-stat-value">8</span>
                                        <span className="construction-stat-label">Engineers</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="construction-hero-indicators">
                    {heroSteps.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setHeroAnimationStep(index)}
                            className={`construction-hero-indicator ${heroAnimationStep === index ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="construction-why-section">
                <div className="construction-container">
                    <div className="construction-section-header">
                        <h2 className="construction-section-title">
                            Why Choose Our Construction Excellence?
                        </h2>
                        <p className="construction-section-subtitle">
                            Discover the advantages that set us apart in the construction industry and make us the preferred choice for discerning clients.
                        </p>
                    </div>

                    <div className="construction-why-grid">
                        <div className="construction-why-card quality">
                            <div className="construction-why-header">
                                <div className="construction-why-icon">🎯</div>
                                <div className="construction-why-badge">Premium</div>
                            </div>
                            <h3 className="construction-why-title">Unmatched Quality</h3>
                            <p className="construction-why-description">
                                Every project meets the highest industry standards with rigorous quality control and premium materials.
                            </p>
                            <div className="construction-why-metric">
                                <span className="construction-metric-value">99.8%</span>
                                <span className="construction-metric-label">Quality Score</span>
                            </div>
                        </div>

                        <div className="construction-why-card innovation">
                            <div className="construction-why-header">
                                <div className="construction-why-icon">💡</div>
                                <div className="construction-why-badge">Advanced</div>
                            </div>
                            <h3 className="construction-why-title">Cutting-Edge Innovation</h3>
                            <p className="construction-why-description">
                                Latest construction technologies and sustainable practices for future-ready buildings.
                            </p>
                            <div className="construction-why-metric">
                                <span className="construction-metric-value">50+</span>
                                <span className="construction-metric-label">Technologies</span>
                            </div>
                        </div>

                        <div className="construction-why-card timeline">
                            <div className="construction-why-header">
                                <div className="construction-why-icon">⚡</div>
                                <div className="construction-why-badge">Efficient</div>
                            </div>
                            <h3 className="construction-why-title">On-Time Delivery</h3>
                            <p className="construction-why-description">
                                Proven track record of delivering projects on schedule with efficient project management.
                            </p>
                            <div className="construction-why-metric">
                                <span className="construction-metric-value">95%</span>
                                <span className="construction-metric-label">On-Time Rate</span>
                            </div>
                        </div>

                        <div className="construction-why-card support">
                            <div className="construction-why-header">
                                <div className="construction-why-icon">🤝</div>
                                <div className="construction-why-badge">24/7</div>
                            </div>
                            <h3 className="construction-why-title">Expert Support</h3>
                            <p className="construction-why-description">
                                Dedicated support team available around the clock for all your project needs.
                            </p>
                            <div className="construction-why-metric">
                                <span className="construction-metric-value">24/7</span>
                                <span className="construction-metric-label">Availability</span>
                            </div>
                        </div>
                        <div className="construction-why-card innovation">
                            <div className="construction-why-header">
                                <div className="construction-why-icon">🤖</div>
                                <div className="construction-why-badge">AI</div>
                            </div>
                            <h3 className="construction-why-title">Smart Assistance</h3>
                            <p className="construction-why-description">
                                Get instant answers, guidance, and support with an intelligent chatbot integrated into the workflow system.
                            </p>
                            <div className="construction-why-metric">
                                <span className="construction-metric-value">24/7</span>
                                <span className="construction-metric-label">Availability</span>
                            </div>
                        </div>

                        <div className="construction-why-card timeline">
                            <div className="construction-why-header">
                                <div className="construction-why-icon">📅</div>
                                <div className="construction-why-badge">Timeline</div>
                            </div>
                            <h3 className="construction-why-title">Project Scheduling</h3>
                            <p className="construction-why-description">
                                Visualize milestones, deadlines, and progress with a clear and dynamic project timeline.
                            </p>
                            <div className="construction-why-metric">
                                <span className="construction-metric-value">100+</span>
                                <span className="construction-metric-label">Architects</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section with Video Background */}
            <section className="construction-team-section">
                <div className="construction-team-video-bg">
                    <video autoPlay loop muted playsInline>
                        <source src="https://www.pexels.com/download/video/6774633/" type="video/mp4" />
                    </video>
                    <div className="construction-team-overlay"></div>
                </div>

                <div className="construction-team-content">
                    <div className="construction-container">
                        <div className="construction-section-header">
                            <h2 className="construction-section-title white">
                                Meet Our Expert Team
                            </h2>
                            <p className="construction-section-subtitle white">
                                Our diverse team of professionals brings together decades of experience, innovation, and dedication to deliver exceptional results.
                            </p>
                        </div>

                        <div className="construction-team-showcase">
                            <div className="construction-team-profile">
                                <div className="construction-profile-image">
                                    <img src={teamMembers[currentTeamMember].image} alt={teamMembers[currentTeamMember].name} />
                                    <div className="construction-profile-overlay">
                                        <span className="construction-profile-overlay-text">
                                            👤 View Full Profile
                                        </span>
                                    </div>
                                </div>
                                <div className="construction-profile-info">
                                    <div className="construction-profile-header">
                                        <h3 className="construction-profile-name">{teamMembers[currentTeamMember].name}</h3>
                                        <div className="construction-profile-role">{teamMembers[currentTeamMember].role}</div>
                                    </div>
                                    <div className="construction-profile-details">
                                        <div className="construction-profile-detail">
                                            <span className="construction-detail-icon">⏱️</span>
                                            <span className="construction-detail-text">{teamMembers[currentTeamMember].experience}</span>
                                        </div>
                                        <div className="construction-profile-detail">
                                            <span className="construction-detail-icon">🎯</span>
                                            <span className="construction-detail-text">{teamMembers[currentTeamMember].specialty}</span>
                                        </div>
                                        <div className="construction-profile-detail">
                                            <span className="construction-detail-icon">📊</span>
                                            <span className="construction-detail-text">{teamMembers[currentTeamMember].projects}</span>
                                        </div>
                                    </div>
                                    <p className="construction-profile-description">
                                        {teamMembers[currentTeamMember].description}
                                    </p>
                                </div>
                            </div>

                            <div className="construction-team-navigation">
                                <button onClick={prevTeamMember} className="construction-team-nav-btn">
                                    ←
                                </button>
                                <div className="construction-team-indicators">
                                    {teamMembers.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentTeamMember(index)}
                                            className={`construction-team-indicator ${currentTeamMember === index ? 'active' : ''}`}
                                        />
                                    ))}
                                </div>
                                <button onClick={nextTeamMember} className="construction-team-nav-btn">
                                    →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Current Projects Section */}
            <section className="construction-projects-section">
                <div className="construction-container">
                    <div className="construction-section-header">
                        <h2 className="construction-section-title">
                            Our Current Projects
                        </h2>
                        <p className="construction-section-subtitle">
                            See our ongoing work and the quality standards we maintain across all project types and scales.
                        </p>
                    </div>

                    <div className="construction-projects-showcase">
                        <div className="construction-projects-carousel">
                            {displayedProjects.map((project, index) => (
                                <div
                                    key={index}
                                    className={`construction-project-slide ${currentProject === index ? 'active' : ''}`}
                                >
                                    <img src={project.pimg && project.pimg.length > 0 ? project.pimg[0] : "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"} alt={project.pname} />
                                    <div className="construction-project-overlay">
                                        <div className="construction-project-info">
                                            <h3 className="construction-project-name">{project.pname || "Project Name"}</h3>
                                            <div className="construction-project-meta">
                                                <span className="construction-project-type">{project.ptype || "Type"}</span>
                                                <span className={`construction-project-status ${project.pstatus?.toLowerCase().replace(' ', '-') || 'planning'}`}>
                                                    {project.pstatus || "Planning"}
                                                </span>
                                            </div>
                                            <div className="construction-project-progress">
                                                <div className="construction-progress-bar">
                                                    <div className="construction-progress-fill" style={{ width: '75%' }}></div>
                                                </div>
                                                <span className="construction-progress-percentage">75%</span>
                                            </div>
                                            <div className="construction-project-details">
                                                <div className="construction-project-detail">
                                                    <span className="construction-detail-label">Budget:</span>
                                                    <span className="construction-detail-value">{project.pbudget ? `$${project.pbudget.toLocaleString()}` : "$0"}</span>
                                                </div>
                                                <div className="construction-project-detail">
                                                    <span className="construction-detail-label">End Date:</span>
                                                    <span className="construction-detail-value">{project.penddate ? new Date(project.penddate).toLocaleDateString() : "N/A"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="construction-projects-navigation">
                            <button
                                onClick={() => setCurrentProject((prev) => (prev - 1 + (displayedProjects.length || 1)) % (displayedProjects.length || 1))}
                                className="construction-projects-nav-btn"
                            >
                                ←
                            </button>
                            <div className="construction-projects-indicators">
                                {displayedProjects.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentProject(index)}
                                        className={`construction-projects-indicator ${currentProject === index ? 'active' : ''}`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentProject((prev) => (prev + 1) % (displayedProjects.length || 1))}
                                className="construction-projects-nav-btn"
                            >
                                →
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Process Section with Video Background */}
            <section className="construction-process-section">
                <div className="construction-process-video-bg">
                    <video autoPlay loop muted playsInline>
                        <source src="https://www.pexels.com/download/video/15990565/" type="video/mp4" />
                    </video>
                    <div className="construction-process-overlay"></div>
                </div>

                <div className="construction-process-content">
                    <div className="construction-container">
                        <div className="construction-section-header">
                            <h2 className="construction-section-title white">
                                Our Proven Process
                            </h2>
                            <p className="construction-section-subtitle white">
                                From initial consultation to final delivery, our systematic approach ensures exceptional results at every stage.
                            </p>
                        </div>

                        <div className="construction-process-grid">
                            {processSteps.map((step, index) => (
                                <div
                                    key={index}
                                    className={`construction-process-card ${currentProcess === index ? 'active' : ''}`}
                                    onClick={() => setCurrentProcess(index)}
                                >
                                    <div className="construction-process-number">{String(index + 1).padStart(2, '0')}</div>
                                    <div className="construction-process-icon">{step.icon}</div>
                                    <h4 className="construction-process-title">{step.title}</h4>
                                    <p className="construction-process-description">{step.description}</p>
                                    <div className="construction-process-arrow">→</div>
                                </div>
                            ))}
                        </div>

                        <div className="construction-process-navigation">
                            <button onClick={prevProcess} className="construction-process-nav-btn">
                                ←
                            </button>
                            <div className="construction-process-indicators">
                                {processSteps.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentProcess(index)}
                                        className={`construction-process-indicator ${currentProcess === index ? 'active' : ''}`}
                                    />
                                ))}
                            </div>
                            <button onClick={nextProcess} className="construction-process-nav-btn">
                                →
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="construction-testimonials-section">
                <div className="construction-container">
                    <div className="construction-section-header">
                        <h2 className="construction-section-title">
                            What Our Clients Say
                        </h2>
                        <p className="construction-section-subtitle">
                            Don't just take our word for it. Hear from satisfied clients who have experienced our exceptional service and quality.
                        </p>
                    </div>

                    <div className="construction-testimonials-showcase">
                        <div className="construction-testimonial-card">
                            <div className="construction-testimonial-header">
                                <div className="construction-testimonial-stars">
                                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                                        <span key={i} className="construction-star">⭐</span>
                                    ))}
                                </div>
                                <div className="construction-testimonial-badge">Verified Client</div>
                            </div>
                            <blockquote className="construction-testimonial-text">
                                "{testimonials[currentTestimonial].text}"
                            </blockquote>
                            <div className="construction-testimonial-author">
                                <div className="construction-author-info">
                                    <div className="construction-author-name">{testimonials[currentTestimonial].name}</div>
                                    <div className="construction-author-company">{testimonials[currentTestimonial].company}</div>
                                    <div className="construction-author-project">Project: {testimonials[currentTestimonial].project}</div>
                                </div>
                            </div>
                        </div>

                        <div className="construction-testimonials-navigation">
                            <button
                                onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                                className="construction-testimonials-nav-btn"
                            >
                                ←
                            </button>
                            <div className="construction-testimonials-indicators">
                                {testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentTestimonial(index)}
                                        className={`construction-testimonials-indicator ${currentTestimonial === index ? 'active' : ''}`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                                className="construction-testimonials-nav-btn"
                            >
                                →
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="construction-contact-section" id="contact-form">
                <div className="construction-container">
                    <div className="construction-contact-grid">
                        <div className="construction-contact-info">
                            <h2 className="construction-contact-title">
                                Ready to Start Your Project?
                            </h2>
                            <p className="construction-contact-description">
                                Take the first step towards bringing your construction vision to life. Our team is ready to discuss your project and provide a comprehensive consultation.
                            </p>

                            <div className="construction-contact-benefits">
                                <div className="construction-contact-benefit">
                                    <span className="construction-benefit-icon">📞</span>
                                    <div className="construction-benefit-text">
                                        <h4>Free Consultation</h4>
                                        <p>No-obligation project assessment and planning session</p>
                                    </div>
                                </div>
                                <div className="construction-contact-benefit">
                                    <span className="construction-benefit-icon">📋</span>
                                    <div className="construction-benefit-text">
                                        <h4>Detailed Proposal</h4>
                                        <p>Comprehensive project plan with timeline and budget breakdown</p>
                                    </div>
                                </div>
                                <div className="construction-contact-benefit">
                                    <span className="construction-benefit-icon">🎯</span>
                                    <div className="construction-benefit-text">
                                        <h4>Guaranteed Quality</h4>
                                        <p>Quality assurance with warranty and ongoing support</p>
                                    </div>
                                </div>
                            </div>

                            <div className="construction-contact-stats">
                                <div className="construction-contact-stat">
                                    <div className="construction-contact-stat-number">24hrs</div>
                                    <div className="construction-contact-stat-label">Response Time</div>
                                </div>
                                <div className="construction-contact-stat">
                                    <div className="construction-contact-stat-number">100%</div>
                                    <div className="construction-contact-stat-label">Satisfaction</div>
                                </div>
                            </div>
                        </div>

                        <div className="construction-contact-form-container">
                            <form className="construction-contact-form" onSubmit={handleSubmit}>
                                <div className="construction-form-header">
                                    <h3 className="construction-form-title">Get Your Free Quote</h3>
                                    <p className="construction-form-subtitle">Fill out the form below and we'll get back to you within 24 hours</p>
                                </div>

                                {formMessage && (
                                    <div className={`construction-form-message ${formMessage.includes('Thank you') ? 'success' : 'error'}`}>
                                        {formMessage}
                                    </div>
                                )}

                                <div className="construction-form-group">
                                    <label className="construction-form-label">Your Name *</label>
                                    <input
                                        type="text"
                                        name="preqname"
                                        value={formData.preqname}
                                        onChange={handleInputChange}
                                        className="construction-form-input"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                <div className="construction-form-group">
                                    <label className="construction-form-label">Email Address *</label>
                                    <input
                                        type="email"
                                        name="preqmail"
                                        value={formData.preqmail}
                                        onChange={handleInputChange}
                                        className="construction-form-input"
                                        placeholder="Enter your email address"
                                        required
                                    />
                                </div>

                                <div className="construction-form-group">
                                    <label className="construction-form-label">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="preqnumber"
                                        value={formData.preqnumber}
                                        onChange={handleInputChange}
                                        className="construction-form-input"
                                        placeholder="Enter your phone number"
                                        required
                                    />
                                </div>

                                <div className="construction-form-group">
                                    <label className="construction-form-label">Project Description *</label>
                                    <textarea
                                        name="preqdescription"
                                        value={formData.preqdescription}
                                        onChange={handleInputChange}
                                        className="construction-form-textarea"
                                        rows="4"
                                        placeholder="Describe your project requirements, timeline, and any specific needs..."
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="construction-form-submit"
                                    disabled={formSubmitting}
                                >
                                    {formSubmitting ? (
                                        <>
                                            <span className="construction-submit-icon">⏳</span>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <span className="construction-submit-icon">🚀</span>
                                            Get Free Consultation
                                        </>
                                    )}
                                </button>
                                <div className="construction-form-footer">
                                    <p className="construction-form-note">
                                        By submitting this form, you agree to our privacy policy and terms of service.
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default JoinWithUs;
