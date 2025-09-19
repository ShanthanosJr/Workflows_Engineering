import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Company branding constants
const COMPANY_NAME = "Workflows Engineering";
const COMPANY_TAGLINE = "Build Your Dreams";

// Color scheme - Yellow/White theme matching the template
const COLORS = {
  primary: [255, 193, 7], // Golden yellow
  secondary: [255, 235, 59], // Light yellow
  accent: [255, 152, 0], // Orange accent
  dark: [33, 37, 41], // Dark gray
  light: [248, 249, 250], // Light gray
  white: [255, 255, 255],
  text: [33, 37, 41],
  background: [254, 254, 254]
};

// Add company logo as base64 (replace with your actual logo)
// React logo base64 for testing purposes
const COMPANY_LOGO_BASE64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDE4MCkiLz4KICAgIDxlbGxpcHNlIHJ4PSIxMSIgcnk9IjQuMiIgdHJhbnNmb3JtPSJyb3RhdGUoMjQwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgzMDApIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDM2MCkiLz4KICA8L2c+Cjwvc3ZnPg==";

// Create cover page exactly like the PDF template
const createCoverPage = (doc, title, reportType) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Full page background with gradient effect
  doc.setFillColor(...COLORS.background);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Top decorative band
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  // Add company logo prominently
  try {
    doc.addImage(COMPANY_LOGO_BASE64, 'PNG', pageWidth/2 - 40, 20, 80, 80);
  } catch (error) {
    // Fallback design
    doc.setFillColor(...COLORS.accent);
    doc.circle(pageWidth/2, 60, 40, 'F');
    doc.setFontSize(36);
    doc.setTextColor(...COLORS.white);
    doc.text("🏗️", pageWidth/2, 70, { align: 'center' });
  }
  
  // Company name - large and prominent
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text(COMPANY_NAME, pageWidth/2, 130, { align: 'center' });
  
  // Tagline
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  doc.text(COMPANY_TAGLINE, pageWidth/2, 145, { align: 'center' });
  
  // Decorative line
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(3);
  doc.line(50, 160, pageWidth - 50, 160);
  
  // Report title - very prominent
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text(title.toUpperCase(), pageWidth/2, 190, { align: 'center' });
  
  // Report type badge
  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(pageWidth/2 - 40, 205, 80, 25, 5, 5, 'F');
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text(reportType, pageWidth/2, 222, { align: 'center' });
  
  // Bottom decorative elements
  doc.setFillColor(...COLORS.secondary);
  doc.rect(0, pageHeight - 80, pageWidth, 80, 'F');
  
  // Date and generation info
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.dark);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth/2, pageHeight - 40, { align: 'center' });
  doc.text(`Time: ${new Date().toLocaleTimeString()}`, pageWidth/2, pageHeight - 25, { align: 'center' });
};

// Create standard page header for content pages
const createPageHeader = (doc, title, pageType) => {
  const pageWidth = doc.internal.pageSize.width;
  
  // Header background
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Small logo
  try {
    doc.addImage(COMPANY_LOGO_BASE64, 'PNG', 15, 10, 30, 30);
  } catch (error) {
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.dark);
    doc.text("🏗️", 15, 30);
  }
  
  // Company name
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text(COMPANY_NAME, 50, 25);
  
  // Page title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text(title, pageWidth - 20, 20, { align: 'right' });
  
  // Page type
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.dark);
  doc.text(pageType, pageWidth - 20, 35, { align: 'right' });
  
  // Decorative line
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(2);
  doc.line(15, 55, pageWidth - 15, 55);
  
  return 70; // Return starting Y position for content
};

// Create footer for all pages
const createFooter = (doc) => {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  
  // Footer line
  doc.setDrawColor(...COLORS.secondary);
  doc.setLineWidth(1);
  doc.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);
  
  // Company info
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  doc.text(COMPANY_NAME + " - Smart Construction Workflow & Safety Management", 20, pageHeight - 15);
};

// Add page numbers
const addPageNumbers = (doc) => {
  const pageCount = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  
  for (let i = 2; i <= pageCount; i++) { // Skip first page (cover)
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    doc.text(`${i - 1}`, pageWidth - 20, pageHeight - 15, { align: 'right' });
  }
};

// Add subtle watermark
const addWatermark = (doc) => {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  for (let i = 2; i <= pageCount; i++) { // Skip cover page
    doc.setPage(i);
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.05 }));
    try {
      doc.addImage(COMPANY_LOGO_BASE64, 'PNG', pageWidth/2 - 50, pageHeight/2 - 50, 100, 100);
    } catch (error) {
      // Fallback - no watermark if logo fails
    }
    doc.restoreGraphicsState();
  }
};

// Create About Company page
const createAboutCompanyPage = (doc) => {
  doc.addPage();
  let yPosition = createPageHeader(doc, "About Our Company", "COMPANY PROFILE");
  
  // Main heading with background
  doc.setFillColor(...COLORS.accent);
  doc.rect(20, yPosition, 170, 25, 'F');
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("ABOUT WORKFLOWS ENGINEERING", 105, yPosition + 16, { align: 'center' });
  yPosition += 40;
  
  // Company description with proper formatting
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  
  const aboutText = `Workflows Engineering stands at the forefront of construction technology innovation. Our comprehensive platform revolutionizes how construction projects are conceived, planned, executed, and delivered.

We specialize in creating intelligent workflow management systems that seamlessly integrate safety protocols, project timelines, resource allocation, and quality assurance into one unified platform.

Our mission extends beyond mere software development - we're building the future of construction management through cutting-edge technology and deep industry expertise.`;
  
  const splitText = doc.splitTextToSize(aboutText, 160);
  doc.text(splitText, 25, yPosition);
  yPosition += splitText.length * 6 + 30;
  
  // Key Features section
  doc.setFillColor(...COLORS.primary);
  doc.rect(20, yPosition, 170, 20, 'F');
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("KEY FEATURES & CAPABILITIES", 25, yPosition + 13);
  yPosition += 35;
  
  const features = [
    "• Real-time project monitoring and reporting",
    "• Advanced safety compliance tracking",
    "• Integrated resource and timeline management",
    "• Automated workflow optimization",
    "• Comprehensive data analytics and insights",
    "• Mobile-first design for field operations"
  ];
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  features.forEach(feature => {
    doc.text(feature, 30, yPosition);
    yPosition += 12;
  });
};

// Create Vision & Mission page
const createVisionMissionPage = (doc) => {
  doc.addPage();
  let yPosition = createPageHeader(doc, "Vision & Mission", "CORPORATE VISION");
  
  // Vision section
  doc.setFillColor(...COLORS.primary);
  doc.rect(20, yPosition, 170, 25, 'F');
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("OUR VISION", 105, yPosition + 16, { align: 'center' });
  yPosition += 40;
  
  // Vision content box
  doc.setDrawColor(...COLORS.secondary);
  doc.setLineWidth(2);
  doc.rect(25, yPosition, 160, 60);
  doc.setFillColor(...COLORS.light);
  doc.rect(25, yPosition, 160, 60, 'F');
  
  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  const visionText = "To revolutionize the global construction industry through intelligent automation, comprehensive safety management, and data-driven decision making, creating a world where every construction project is delivered safely, efficiently, and sustainably.";
  const splitVision = doc.splitTextToSize(visionText, 140);
  doc.text(splitVision, 35, yPosition + 15);
  yPosition += 80;
  
  // Mission section
  doc.setFillColor(...COLORS.accent);
  doc.rect(20, yPosition, 170, 25, 'F');
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("OUR MISSION", 105, yPosition + 16, { align: 'center' });
  yPosition += 40;
  
  // Mission content box
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(2);
  doc.rect(25, yPosition, 160, 80);
  doc.setFillColor(...COLORS.white);
  doc.rect(25, yPosition, 160, 80, 'F');
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  const missionText = "We are committed to delivering cutting-edge construction management solutions that enhance productivity, ensure compliance, and promote safety across all project phases. Through continuous innovation and client partnership, we strive to set new industry standards while building lasting relationships based on trust, expertise, and exceptional service delivery.";
  const splitMission = doc.splitTextToSize(missionText, 140);
  doc.text(splitMission, 35, yPosition + 15);
};

// Create Market Analysis page
const createMarketAnalysisPage = (doc) => {
  doc.addPage();
  let yPosition = createPageHeader(doc, "Market Analysis", "MARKET INSIGHTS");
  
  // Market Size section
  doc.setFillColor(...COLORS.primary);
  doc.rect(20, yPosition, 170, 25, 'F');
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("MARKET SIZE & OPPORTUNITIES", 105, yPosition + 16, { align: 'center' });
  yPosition += 40;
  
  // Market data in attractive format
  const marketData = [
    ["Global Construction Software Market", "$2.4 Billion", "2023"],
    ["Projected Market Size", "$4.2 Billion", "2028"],
    ["Annual Growth Rate (CAGR)", "12.8%", "2023-2028"],
    ["North American Market Share", "35%", "Current"],
    ["Target Segment Growth", "18%", "Annual"]
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Market Metric', 'Value', 'Period']],
    body: marketData,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.accent,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 12
    },
    bodyStyles: {
      fontSize: 11,
      textColor: COLORS.text
    },
    alternateRowStyles: {
      fillColor: COLORS.light
    },
    styles: {
      cellPadding: 8,
      lineColor: COLORS.secondary,
      lineWidth: 1
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 50, align: 'center' },
      2: { cellWidth: 50, align: 'center' }
    },
    margin: { left: 20, right: 20 }
  });
  
  yPosition = doc.lastAutoTable.finalY + 25;
  
  // Opportunities section
  doc.setFillColor(...COLORS.secondary);
  doc.rect(20, yPosition, 80, 20, 'F');
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("OPPORTUNITIES", 25, yPosition + 13);
  
  // Threats section
  doc.setFillColor(...COLORS.accent);
  doc.rect(110, yPosition, 80, 20, 'F');
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("THREATS", 115, yPosition + 13);
  yPosition += 30;
  
  // Two-column layout for opportunities and threats
  const opportunities = [
    "Digital transformation drive",
    "IoT & AI integration demand",
    "Sustainability requirements",
    "Remote work adaptation"
  ];
  
  const threats = [
    "Economic uncertainties",
    "Cybersecurity concerns",
    "Regulatory changes",
    "Market competition"
  ];
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  opportunities.forEach((opp, index) => {
    doc.text(`• ${opp}`, 25, yPosition + (index * 12));
  });
  
  threats.forEach((threat, index) => {
    doc.text(`• ${threat}`, 115, yPosition + (index * 12));
  });
};

// Create Team page
const createTeamPage = (doc) => {
  doc.addPage();
  let yPosition = createPageHeader(doc, "Our Team", "TEAM MEMBERS");
  
  // Team heading
  doc.setFillColor(...COLORS.accent);
  doc.rect(20, yPosition, 170, 25, 'F');
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("LEADERSHIP TEAM", 105, yPosition + 16, { align: 'center' });
  yPosition += 40;
  
  // Team members in a professional layout
  const teamMembers = [
    {
      position: "Chief Executive Officer",
      name: "John Smith",
      experience: "15+ years construction industry leadership",
      background: "Former VP at major construction firm"
    },
    {
      position: "Chief Technology Officer", 
      name: "Sarah Johnson",
      experience: "12+ years software architecture",
      background: "Ex-Google senior engineer"
    },
    {
      position: "Head of Operations",
      name: "Mike Davis", 
      experience: "10+ years project management",
      background: "PMP certified, MBA"
    },
    {
      position: "Safety Director",
      name: "Emily Chen",
      experience: "8+ years safety compliance",
      background: "OSHA certified specialist"
    }
  ];
  
  teamMembers.forEach((member, index) => {
    // Member box
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(1);
    doc.rect(20, yPosition, 170, 35);
    doc.setFillColor(...COLORS.light);
    doc.rect(20, yPosition, 170, 35, 'F');
    
    // Position title
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.accent);
    doc.text(member.position, 25, yPosition + 10);
    
    // Name
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.dark);
    doc.text(member.name, 25, yPosition + 22);
    
    // Experience and background
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    doc.text(member.experience, 105, yPosition + 15);
    doc.text(member.background, 105, yPosition + 27);
    
    yPosition += 45;
  });
};

// Create project data page
const createProjectDataPage = (doc, project, reportType) => {
  doc.addPage();
  let yPosition = createPageHeader(doc, `${reportType} Details`, reportType.toUpperCase());
  
  // Data section heading
  doc.setFillColor(...COLORS.primary);
  doc.rect(20, yPosition, 170, 25, 'F');
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text(`${reportType.toUpperCase()} INFORMATION`, 105, yPosition + 16, { align: 'center' });
  yPosition += 40;
  
  if (reportType === "PROJECT") {
    // Project details table
    const projectData = [
      ["Project Name", project.pname || 'N/A'],
      ["Project Code", project.pcode || 'N/A'],
      ["Project Type", project.ptype || 'N/A'],
      ["Location", project.plocation || 'N/A'],
      ["Status", project.pstatus || 'N/A'],
      ["Priority", project.ppriority || 'N/A'],
      ["Budget", project.pbudget ? `$${parseFloat(project.pbudget).toLocaleString()}` : 'N/A'],
      ["Start Date", project.pcreatedat ? new Date(project.pcreatedat).toLocaleDateString() : 'N/A'],
      ["End Date", project.penddate ? new Date(project.penddate).toLocaleDateString() : 'N/A'],
      ["Owner", project.pownername || 'N/A'],
      ["Contact", project.potelnumber || 'N/A'],
      ["Email", project.powmail || 'N/A']
    ];
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Field', 'Details']],
      body: projectData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.accent,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 12
      },
      bodyStyles: {
        fontSize: 11,
        textColor: COLORS.text
      },
      alternateRowStyles: {
        fillColor: COLORS.light
      },
      styles: {
        cellPadding: 6,
        lineColor: COLORS.secondary,
        lineWidth: 0.5
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold', fillColor: COLORS.secondary },
        1: { cellWidth: 110 }
      },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 20;
    
    // Project description if available
    if (project.pdescription) {
      doc.setFillColor(...COLORS.secondary);
      doc.rect(20, yPosition, 170, 15, 'F');
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.dark);
      doc.text("PROJECT DESCRIPTION", 25, yPosition + 10);
      yPosition += 25;
      
      doc.setDrawColor(...COLORS.primary);
      doc.setLineWidth(1);
      doc.rect(25, yPosition, 160, 50);
      doc.setFillColor(...COLORS.white);
      doc.rect(25, yPosition, 160, 50, 'F');
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.text);
      const splitDescription = doc.splitTextToSize(project.pdescription, 150);
      doc.text(splitDescription, 30, yPosition + 10);
    }
  }
};

// Create signature page
const createSignaturePage = (doc) => {
  doc.addPage();
  let yPosition = createPageHeader(doc, "Authorization", "SIGNATURES");
  
  // Signature section
  doc.setFillColor(...COLORS.primary);
  doc.rect(20, yPosition, 170, 25, 'F');
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("DOCUMENT AUTHORIZATION", 105, yPosition + 16, { align: 'center' });
  yPosition += 50;
  
  // Signature boxes
  const signatures = [
    { title: "Prepared by", role: "Project Manager" },
    { title: "Reviewed by", role: "Technical Lead" },
    { title: "Approved by", role: "Department Head" }
  ];
  
  signatures.forEach((sig, index) => {
    // Signature box
    doc.setDrawColor(...COLORS.secondary);
    doc.setLineWidth(1);
    doc.rect(30, yPosition, 150, 50);
    
    // Title
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.dark);
    doc.text(`${sig.title}:`, 35, yPosition + 15);
    
    // Role
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    doc.text(`(${sig.role})`, 35, yPosition + 25);
    
    // Signature line
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(1);
    doc.line(35, yPosition + 35, 120, yPosition + 35);
    doc.text("Signature", 35, yPosition + 42);
    
    // Date line
    doc.line(130, yPosition + 35, 175, yPosition + 35);
    doc.text("Date", 130, yPosition + 42);
    
    yPosition += 70;
  });
};

// Create thank you page
const createThankYouPage = (doc) => {
  doc.addPage();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Full page design
  doc.setFillColor(...COLORS.background);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Decorative top
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 100, 'F');
  
  // Thank you message
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("THANK YOU", pageWidth/2, 150, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("For choosing Workflows Engineering", pageWidth/2, 180, { align: 'center' });
  
  // Contact information
  doc.setFillColor(...COLORS.secondary);
  doc.rect(40, 220, pageWidth - 80, 60, 'F');
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("CONTACT US", pageWidth/2, 240, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Email: info@workflowsengineering.com", pageWidth/2, 255, { align: 'center' });
  doc.text("Phone: +1 (555) 123-4567", pageWidth/2, 270, { align: 'center' });
  
  // Bottom decorative
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, pageHeight - 60, pageWidth, 60, 'F');
};

// Main export functions
export const exportProjectToPDF = (project, filename) => {
  const doc = new jsPDF();
  
  // Create all pages in order
  createCoverPage(doc, `Project Report: ${project.pname || 'Unnamed Project'}`, "PROJECT REPORT");
  createAboutCompanyPage(doc);
  createVisionMissionPage(doc);
  createMarketAnalysisPage(doc);
  createTeamPage(doc);
  createProjectDataPage(doc, project, "PROJECT");
  createSignaturePage(doc);
  createThankYouPage(doc);
  
  // Apply finishing touches
  addWatermark(doc);
  addPageNumbers(doc);
  
  // Add footer to content pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 2; i <= pageCount - 1; i++) { // Skip cover and thank you pages
    doc.setPage(i);
    createFooter(doc);
  }
  
  // Save the PDF
  doc.save(filename || `project-${project.pcode || 'report'}.pdf`);
};

export const exportTimelineToPDF = (timeline, filename) => {
  const doc = new jsPDF();
  
  // Create all pages in order
  createCoverPage(doc, `Timeline Report: ${timeline.projectDetails?.pname || timeline.pcode || 'Timeline'}`, "TIMELINE REPORT");
  createAboutCompanyPage(doc);
  createVisionMissionPage(doc);
  createMarketAnalysisPage(doc);
  createTeamPage(doc);
  
  // Timeline specific pages
  doc.addPage();
  let yPosition = createPageHeader(doc, "Timeline Details", "TIMELINE DATA");
  
  // Timeline information
  doc.setFillColor(...COLORS.primary);
  doc.rect(20, yPosition, 170, 25, 'F');
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("TIMELINE INFORMATION", 105, yPosition + 16, { align: 'center' });
  yPosition += 40;
  
  const timelineData = [
    ["Project Code", timeline.pcode || 'N/A'],
    ["Project Name", timeline.projectDetails?.pname || 'N/A'],
    ["Date", timeline.date ? new Date(timeline.date).toLocaleDateString() : 'N/A'],
    ["Workers Count", timeline.workerCount || 0],
    ["Engineers Count", timeline.tengineerCount || 0],
    ["Architects Count", timeline.architectCount || 0]
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Details']],
    body: timelineData,
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.accent,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 12
    },
    bodyStyles: {
      fontSize: 11,
      textColor: COLORS.text
    },
    alternateRowStyles: {
      fillColor: COLORS.light
    },
    styles: {
      cellPadding: 6,
      lineColor: COLORS.secondary,
      lineWidth: 0.5
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold', fillColor: COLORS.secondary },
      1: { cellWidth: 110 }
    },
    margin: { left: 20, right: 20 }
  });
  
  // Add resource tables on separate pages if data exists
  if (timeline.tworker && timeline.tworker.length > 0) {
    doc.addPage();
    yPosition = createPageHeader(doc, "Workers", "WORKFORCE");
    
    doc.setFillColor(...COLORS.primary);
    doc.rect(20, yPosition, 170, 20, 'F');
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.dark);
    doc.text("WORKERS ASSIGNED", 25, yPosition + 13);
    yPosition += 30;
    
    const workerData = timeline.tworker.map(worker => [
      worker.name || 'N/A',
      worker.role || 'N/A',
      worker.hoursWorked || 0
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Name', 'Role', 'Hours Worked']],
      body: workerData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.accent,
        textColor: COLORS.white,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: COLORS.light
      },
      styles: {
        cellPadding: 5,
        fontSize: 11
      },
      margin: { left: 20, right: 20 }
    });
  }
  
  createSignaturePage(doc);
  createThankYouPage(doc);
  
  // Apply finishing touches
  addWatermark(doc);
  addPageNumbers(doc);
  
  // Add footer to content pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 2; i <= pageCount - 1; i++) {
    doc.setPage(i);
    createFooter(doc);
  }
  
  // Save the PDF
  doc.save(filename || `timeline-${timeline.pcode || 'report'}.pdf`);
};

// Export Financial Dashboard to PDF
export const exportFinancialToPDF = (financial, filename) => {
  const doc = new jsPDF();
  
  createCoverPage(doc, `Financial Dashboard: ${financial.projectName || 'Financial Report'}`, "FINANCIAL REPORT");
  createAboutCompanyPage(doc);
  createVisionMissionPage(doc);
  createMarketAnalysisPage(doc);
  createTeamPage(doc);
  
  // Financial data page
  doc.addPage();
  let yPosition = createPageHeader(doc, "Financial Dashboard", "FINANCIAL DATA");
  
  doc.setFillColor(...COLORS.primary);
  doc.rect(20, yPosition, 170, 25, 'F');
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("FINANCIAL OVERVIEW", 105, yPosition + 16, { align: 'center' });
  yPosition += 40;
  
  // Create financial summary table based on your financial data structure
  const financialData = [
    ["Total Budget", financial.totalBudget ? `$${financial.totalBudget.toLocaleString()}` : 'N/A'],
    ["Spent to Date", financial.spentAmount ? `$${financial.spentAmount.toLocaleString()}` : 'N/A'],
    ["Remaining Budget", financial.remainingBudget ? `$${financial.remainingBudget.toLocaleString()}` : 'N/A'],
    ["Cost Variance", financial.costVariance || 'N/A'],
    ["Budget Utilization", financial.utilizationPercent ? `${financial.utilizationPercent}%` : 'N/A']
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Financial Metric', 'Amount']],
    body: financialData,
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.accent,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 12
    },
    bodyStyles: {
      fontSize: 11,
      textColor: COLORS.text
    },
    alternateRowStyles: {
      fillColor: COLORS.light
    },
    styles: {
      cellPadding: 6,
      lineColor: COLORS.secondary,
      lineWidth: 0.5
    },
    columnStyles: {
      0: { cellWidth: 85, fontStyle: 'bold', fillColor: COLORS.secondary },
      1: { cellWidth: 85, align: 'right' }
    },
    margin: { left: 20, right: 20 }
  });
  
  createSignaturePage(doc);
  createThankYouPage(doc);
  
  addWatermark(doc);
  addPageNumbers(doc);
  
  const pageCount = doc.getNumberOfPages();
  for (let i = 2; i <= pageCount - 1; i++) {
    doc.setPage(i);
    createFooter(doc);
  }
  
  doc.save(filename || `financial-${financial.projectCode || 'report'}.pdf`);
};

// Export alias for backward compatibility with existing imports
export const exportFinancialDashboardToPDF = exportFinancialToPDF;
