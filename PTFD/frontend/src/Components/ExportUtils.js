// ExportUtils.js 

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Company branding constants
const COMPANY_NAME = "Workflows Engineering";
const COMPANY_TAGLINE = "Build Your Dreams.. ";

// Professional Blue/White Color Scheme 
const COLORS = {
  primary: [41, 98, 255],      // Deep Blue #2962FF
  secondary: [33, 150, 243],    // Light Blue #2196F3
  accent: [63, 81, 181],        // Indigo #3F51B5
  dark: [21, 32, 43],           // Dark Navy #15202B
  light: [245, 248, 250],       // Light Gray #F5F8FA
  white: [255, 255, 255],       // Pure White
  text: [33, 37, 41],           // Dark Text #212529
  background: [248, 249, 250],  // Background #F8F9FA
  success: [76, 175, 80],       // Green #4CAF50
  warning: [255, 193, 7],       // Amber #FFC107
  danger: [244, 67, 54]         // Red #F44336
};

// Page margins and helpers
const MARGINS = { left: 20, right: 20, top: 45, bottom: 40 };
const getPageSize = (doc) => ({
  width: doc.internal.pageSize.width,
  height: doc.internal.pageSize.height
});

// ---------- Helper: ensure there is enough space, otherwise add page & header ----------
const ensureSpace = (doc, yPos, neededHeight, headerCallback) => {
  const { height } = getPageSize(doc);
  if (yPos + neededHeight > height - MARGINS.bottom) {
    doc.addPage();
    // headerCallback should return the new yPosition (like createPageHeader does)
    if (typeof headerCallback === 'function') {
      return headerCallback();
    }
    // fallback: return top margin
    return MARGINS.top;
  }
  return yPos;
};

// ---------- Helper: draw a lighter hexagon (clipped to safe area) ----------
const drawHexagon = (doc, x, y, size) => {
  // Keep hexagon light and small
  doc.saveGraphicsState?.();
  try {
    doc.moveTo(x + size * Math.cos(0), y + size * Math.sin(0));
    for (let i = 1; i <= 6; i++) {
      const angle = (i * 60 * Math.PI) / 180;
      const nextX = x + size * Math.cos(angle);
      const nextY = y + size * Math.sin(angle);
      doc.lineTo(nextX, nextY);
    }
    // fill lightly
    doc.setFillColor(...COLORS.primary);
    doc.setGState?.(new doc.GState() ? new doc.GState({ opacity: 0.02 }) : {});
    doc.fill();
  } catch (e) {
    // if low-level path ops not supported, silently skip fancy hexes
  } finally {
    doc.restoreGraphicsState?.();
  }
};

// ---------- Geometric background (subtle, clipped to margins) ----------
const addGeometricBackground = (doc, pageNumber) => {
  const { width, height } = getPageSize(doc);

  // Only draw within safe margins to avoid touching page edges
  const left = MARGINS.left;
  const right = width - MARGINS.right;
  const top = MARGINS.top / 2;
  const bottom = height - MARGINS.bottom / 2;

  doc.saveGraphicsState?.();

  //  very low opacity so lines don't dominate
  try {
    doc.setGState?.(new doc.GState() ? new doc.GState({ opacity: 0.03 }) : {});
  } catch (e) { /* ignore */ }

  if (pageNumber === 1) {
    // Cover page - subtle hex pattern inside safe box
    doc.setFillColor(...COLORS.primary);
    for (let x = left; x < right; x += 48) {
      for (let y = top; y < bottom; y += 42) {
        // staggered offsets
        const offsetX = (Math.floor((y - top) / 42) % 2 === 0) ? 20 : 0;
        drawHexagon(doc, x + offsetX, y, 6);
      }
    }
  } else {
    // Content pages - soft diagonal hatch inside the safe area (thin lines)
    doc.setDrawColor(...COLORS.secondary);
    doc.setLineWidth(0.25);
    // keep lines sparse and only within margins
    for (let i = - (bottom - top); i < (right - left) + (bottom - top); i += 80) {
      doc.line(left + i, top, left + i + (bottom - top), bottom);
    }
  }

  doc.restoreGraphicsState?.();
};

// ---------- Cover page (improved margins & reduced gradients) ----------
const createCoverPage = (doc, title, reportType) => {
  const { width, height } = getPageSize(doc);

  // Full white background
  doc.setFillColor(...COLORS.white);
  doc.rect(0, 0, width, height, 'F');

  // Subtle geometric background inside safe area
  addGeometricBackground(doc, 1);

  // Top banner (contained within page width but not too tall)
  const bannerHeight = 72;
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, width, bannerHeight, 'F');

  // Simple, less heavy gradient band: only 6 steps
  for (let i = 0; i < 6; i++) {
    const alpha = 0.6 - (i * 0.08);
    if (alpha <= 0) break;
    doc.saveGraphicsState?.();
    doc.setGState?.(new doc.GState() ? new doc.GState({ opacity: alpha }) : {});
    doc.setFillColor(...COLORS.secondary);
    doc.rect(0, bannerHeight + (i * 2), width, 2, 'F');
    doc.restoreGraphicsState?.();
  }

  // Logo circle centered but within margins
  const cx = width / 2;
  doc.setFillColor(...COLORS.white);
  doc.circle(cx, 54, 26, 'F');
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(1.6);
  doc.circle(cx, 54, 26);

  // Logo icon
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("⚡", cx, 62, { align: 'center' });

  // Company title block (within margins)
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text(COMPANY_NAME, cx, 118, { align: 'center' });

  // Tagline
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  doc.text(COMPANY_TAGLINE, cx, 132, { align: 'center' });

  // Decorative subtle separator within margins
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.6);
  doc.line(MARGINS.left + 30, 144, width - MARGINS.right - 30, 144);

  // Title box (rounded) inside margins
  doc.setFillColor(...COLORS.light);
  doc.roundedRect(MARGINS.left + 10, 156, width - MARGINS.left - MARGINS.right - 20, 48, 6, 6, 'F');
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGINS.left + 10, 156, width - MARGINS.left - MARGINS.right - 20, 48, 6, 6);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text(title, width / 2, 186, { align: 'center' });

  // Small badge for report type
  const badgeW = 72;
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(width/2 - badgeW/2, 196, badgeW, 16, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text(reportType, width/2, 208, { align: 'center' });

  // Bottom info area inside margins
  const now = new Date();
  doc.setFillColor(...COLORS.light);
  doc.rect(MARGINS.left, height - MARGINS.bottom + 2, width - MARGINS.left - MARGINS.right, MARGINS.bottom - 6, 'F');

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  doc.text("Report Generated:", MARGINS.left + 6, height - MARGINS.bottom + 18);
  doc.setFont("helvetica", "bold");
  doc.text(now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }), MARGINS.left + 6, height - MARGINS.bottom + 30);

  doc.setFont("helvetica", "normal");
  doc.text("Version: 1.0", width - MARGINS.right - 6, height - MARGINS.bottom + 18, { align: 'right' });
  doc.text("Internal Use Only", width - MARGINS.right - 6, height - MARGINS.bottom + 30, { align: 'right' });
};

// ---------- Header for content pages (returns starting Y position for content) ----------
const createPageHeader = (doc, title, pageType) => {
  const { width } = getPageSize(doc);

  // Header band within top margin
  const headerHeight = 36;
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, width, headerHeight, 'F');

  // Soft gradient with fewer steps
  for (let i = 0; i < 4; i++) {
    const alpha = 0.7 - (i * 0.12);
    if (alpha <= 0) break;
    doc.saveGraphicsState?.();
    doc.setGState?.(new doc.GState() ? new doc.GState({ opacity: alpha }) : {});
    doc.setFillColor(...COLORS.secondary);
    doc.rect(0, headerHeight + i, width, 1.5, 'F');
    doc.restoreGraphicsState?.();
  }

  // Small logo circle at left (within margins)
  doc.setFillColor(...COLORS.white);
  doc.circle(MARGINS.left + 14, headerHeight / 2, 10, 'F');
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(1);
  doc.circle(MARGINS.left + 14, headerHeight / 2, 10);
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.primary);
  doc.text("⚡", MARGINS.left + 14, (headerHeight/2) + 3, { align: 'center' });

  // Company name
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text(COMPANY_NAME, MARGINS.left + 36, headerHeight / 2 + 4);

  // Page title right-aligned within margins
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(title, width - MARGINS.right, 12, { align: 'right' });

  // Page type smaller
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(pageType, width - MARGINS.right, 22, { align: 'right' });

  // Return the Y start for content — leave a gap after the header
  return headerHeight + 14;
};

// ---------- Footer (contained within margin) ----------
const createFooter = (doc) => {
  const { width, height } = getPageSize(doc);

  // Light separator line inside margins
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.35);
  doc.line(MARGINS.left, height - MARGINS.bottom + 6, width - MARGINS.right, height - MARGINS.bottom + 6);

  // Company info and contact
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  doc.text(`${COMPANY_NAME} -`, MARGINS.left, height - MARGINS.bottom + 18);

  doc.text("www.workflowsengineering.com | info@workflowsengineering.com", width - MARGINS.right, height - MARGINS.bottom + 18, { align: 'right' });
};

// ---------- Page numbering (skip cover; number content pages starting at 1) ----------
const addPageNumbers = (doc) => {
  const pageCount = doc.getNumberOfPages();
  const { height, width } = getPageSize(doc);

  // Number pages 2..(pageCount-1) as content pages; show smaller pill to be less intrusive
  for (let i = 2; i <= pageCount - 1; i++) {
    doc.setPage(i);
    doc.setFillColor(...COLORS.primary);
    // small rounded rect instead of full circle
    const px = width - MARGINS.right + 4;
    const py = height - MARGINS.bottom + 18;
    doc.roundedRect(px - 16, py - 8, 30, 16, 8, 8, 'F');
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.white);
    // label content pages starting from 1
    doc.text(`${i - 1}`, px - 1, py + 3, { align: 'center' });
  }
};

// ---------- Image watermark helper (applies to pages 2..pageCount-1 only) ----------
const addWatermark = (doc, imageBase64 = null, opts = {}) => {
  const pageCount = doc.getNumberOfPages();
  const { width, height } = getPageSize(doc);

  // default options
  const settings = {
    maxWidth: Math.min(300, width - MARGINS.left - MARGINS.right),
    maxHeight: Math.min(250, height - MARGINS.top - MARGINS.bottom),
    opacity: 0.06,
    ...opts
  };

  for (let i = 2; i <= pageCount - 1; i++) {
    doc.setPage(i);

    // Light geometric background for each content page (but very subtle)
    addGeometricBackground(doc, i);

    if (imageBase64) {
      // Draw the logo image at the center with low opacity and constrained size
      doc.saveGraphicsState?.();
      try {
        doc.setGState?.(new doc.GState() ? new doc.GState({ opacity: settings.opacity }) : {});
      } catch (e) { /* ignore */ }

      // compute placement
      const imgW = settings.maxWidth;
      const imgH = settings.maxHeight;
      const x = (width - imgW) / 2;
      const y = (height - imgH) / 2;
      try {
        doc.addImage(imageBase64, imageBase64.startsWith('/9j') ? 'JPEG' : 'PNG', x, y, imgW, imgH, undefined, 'NONE');
      } catch (e) {
        // if image invalid, fallback to text watermark below
      } finally {
        doc.restoreGraphicsState?.();
      }
    } else {
      // fallback text watermark (light)
      doc.saveGraphicsState?.();
      try {
        doc.setGState?.(new doc.GState() ? new doc.GState({ opacity: 0.03 }) : {});
      } catch (e) { /* ignore */ }
      doc.setFontSize(84);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text("WE", width / 2, height / 2 + 30, { align: 'center' });
      doc.restoreGraphicsState?.();
    }
  }
};

// ---------- About Company (uses ensureSpace to avoid overflow) ----------
const createAboutCompanyPage = (doc) => {
  const { width } = getPageSize(doc);
  doc.addPage();
  let yPosition = createPageHeader(doc, "About Our Company", "COMPANY PROFILE");

  // Section header block (within margins)
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(MARGINS.left, yPosition, width - MARGINS.left - MARGINS.right, 26, 4, 4, 'F');
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("ABOUT WORKFLOWS ENGINEERING", width / 2, yPosition + 18, { align: 'center' });
  yPosition += 36;

  const sections = [
    {
      title: "WHO WE ARE",
      content: "Workflows Engineering stands as a premier technology solutions provider, specializing in revolutionary construction management systems. Our platform transforms traditional project delivery through intelligent automation, comprehensive safety protocols, and data-driven insights."
    },
    {
      title: "OUR EXPERTISE",
      content: "We deliver cutting-edge software solutions that integrate seamlessly with existing workflows, providing real-time project monitoring, resource optimization, and predictive analytics. Our expertise spans across project management, safety compliance, and operational efficiency."
    },
    {
      title: "WHY CHOOSE US",
      content: "With a proven track record of successful implementations across diverse construction projects, we combine technical excellence with deep industry knowledge. Our solutions are designed to scale with your business while maintaining the highest standards of security and reliability."
    }
  ];

  sections.forEach((section) => {
    // ensure space before drawing the next 68px block
    yPosition = ensureSpace(doc, yPosition, 72, () => createPageHeader(doc, "About Our Company", "COMPANY PROFILE"));

    doc.setFillColor(...COLORS.light);
    doc.roundedRect(MARGINS.left, yPosition, width - MARGINS.left - MARGINS.right, 56, 4, 4, 'F');
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.45);
    doc.roundedRect(MARGINS.left, yPosition, width - MARGINS.left - MARGINS.right, 56, 4, 4);

    // Section title pill
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(MARGINS.left + 6, yPosition + 6, 92, 16, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.white);
    doc.text(section.title, MARGINS.left + 52, yPosition + 18, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    const splitText = doc.splitTextToSize(section.content, width - MARGINS.left - MARGINS.right - 40);
    doc.text(splitText, MARGINS.left + 12, yPosition + 32);

    yPosition += 72;
  });

  // Key metrics section
  yPosition = ensureSpace(doc, yPosition, 86, () => createPageHeader(doc, "About Our Company", "COMPANY PROFILE"));

  doc.setFillColor(...COLORS.secondary);
  doc.roundedRect(MARGINS.left, yPosition, width - MARGINS.left - MARGINS.right, 22, 3, 3, 'F');
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("KEY ACHIEVEMENTS", MARGINS.left + 10, yPosition + 15);

  yPosition += 36;

  const metrics = [
    { label: "Projects Completed", value: "500+" },
    { label: "Client Satisfaction", value: "98%" },
    { label: "Years Experience", value: "15+" },
    { label: "Team Members", value: "50+" }
  ];

  metrics.forEach((metric, index) => {
    const colWidth = (width - MARGINS.left - MARGINS.right - 40) / 4;
    const xPos = MARGINS.left + 10 + (index * colWidth);

    doc.setFillColor(...COLORS.white);
    doc.roundedRect(xPos, yPosition, colWidth - 6, 44, 3, 3, 'F');
    doc.setDrawColor(...COLORS.secondary);
    doc.setLineWidth(0.45);
    doc.roundedRect(xPos, yPosition, colWidth - 6, 44, 3, 3);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text(metric.value, xPos + (colWidth - 6)/2, yPosition + 22, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    const splitLabel = doc.splitTextToSize(metric.label, colWidth - 12);
    doc.text(splitLabel, xPos + (colWidth - 6)/2, yPosition + 36, { align: 'center' });
  });

  return yPosition + 60;
};

// ---------- Vision & Mission page ----------
const createVisionMissionPage = (doc) => {
  doc.addPage();
  let yPosition = createPageHeader(doc, "Vision & Mission", "CORPORATE PHILOSOPHY");
  // Page width not used in this function
  getPageSize(doc);

  // Vision
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(MARGINS.left, yPosition, 170, 26, 3, 3, 'F');
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("OUR VISION", MARGINS.left + 85, yPosition + 18, { align: 'center' });
  yPosition += 36;

  yPosition = ensureSpace(doc, yPosition, 78, () => createPageHeader(doc, "Vision & Mission", "CORPORATE PHILOSOPHY"));
  doc.setFillColor(...COLORS.light);
  doc.roundedRect(MARGINS.left + 5, yPosition, 160, 58, 5, 5, 'F');
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.45);
  doc.roundedRect(MARGINS.left + 5, yPosition, 160, 58, 5, 5);

  doc.setFillColor(...COLORS.primary);
  doc.circle(MARGINS.left + 24, yPosition + 18, 8, 'F');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.white);
  doc.text("👁", MARGINS.left + 24, yPosition + 21, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  const visionText = "To revolutionize the construction industry through innovative technology solutions that enhance productivity, ensure safety, and promote sustainable building practices worldwide.";
  const splitVision = doc.splitTextToSize(visionText, 120);
  doc.text(splitVision, MARGINS.left + 54, yPosition + 21);
  yPosition += 78;

  // Mission
  doc.setFillColor(...COLORS.secondary);
  doc.roundedRect(MARGINS.left, yPosition, 170, 26, 3, 3, 'F');
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("OUR MISSION", MARGINS.left + 85, yPosition + 18, { align: 'center' });
  yPosition += 36;

  yPosition = ensureSpace(doc, yPosition, 95, () => createPageHeader(doc, "Vision & Mission", "CORPORATE PHILOSOPHY"));
  doc.setFillColor(...COLORS.light);
  doc.roundedRect(MARGINS.left + 5, yPosition, 160, 78, 5, 5, 'F');
  doc.setDrawColor(...COLORS.secondary);
  doc.setLineWidth(0.45);
  doc.roundedRect(MARGINS.left + 5, yPosition, 160, 78, 5, 5);

  doc.setFillColor(...COLORS.secondary);
  doc.circle(MARGINS.left + 24, yPosition + 24, 8, 'F');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.white);
  doc.text("🎯", MARGINS.left + 24, yPosition + 27, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  const missionText = "We are committed to delivering exceptional software solutions that streamline construction workflows, enhance project outcomes, and empower teams to achieve their goals efficiently. Through continuous innovation and client partnership, we build lasting relationships based on trust and excellence.";
  const splitMission = doc.splitTextToSize(missionText, 120);
  doc.text(splitMission, MARGINS.left + 54, yPosition + 22);
  yPosition += 95;

  // Values
  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(MARGINS.left, yPosition, 170, 22, 3, 3, 'F');
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("CORE VALUES", MARGINS.left + 20, yPosition + 15);

  yPosition += 32;
  const values = ["Innovation", "Quality", "Integrity", "Safety", "Excellence"];
  values.forEach((value, index) => {
    const xPos = MARGINS.left + 10 + (index * 32);
    doc.setFillColor(...COLORS.accent);
    doc.roundedRect(xPos, yPosition, 28, 16, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.white);
    doc.text(value, xPos + 14, yPosition + 11, { align: 'center' });
  });

  return yPosition + 36;
};

// ---------- Project Data Page (with safe tables) ----------
const createProjectDataPage = (doc, project, reportType) => {
  doc.addPage();
  let yPosition = createPageHeader(doc, `${reportType} Details`, reportType.toUpperCase());
  const { width } = getPageSize(doc);

  // Data header
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(MARGINS.left, yPosition, 170, 26, 3, 3, 'F');
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text(`${reportType.toUpperCase()} OVERVIEW`, MARGINS.left + 85, yPosition + 18, { align: 'center' });
  yPosition += 34;

  if (reportType === "PROJECT") {
    const summaryData = [
      { label: "Budget", value: project.pbudget ? `$${parseFloat(project.pbudget).toLocaleString()}` : 'N/A', color: COLORS.success },
      { label: "Status", value: project.pstatus || 'N/A', color: COLORS.primary },
      { label: "Priority", value: project.ppriority || 'N/A', color: COLORS.warning }
    ];

    summaryData.forEach((item, index) => {
      const xPos = MARGINS.left + (index * 66);
      doc.setFillColor(...COLORS.white);
      doc.roundedRect(xPos, yPosition, 60, 46, 4, 4, 'F');
      doc.setDrawColor(...item.color);
      doc.setLineWidth(0.6);
      doc.roundedRect(xPos, yPosition, 60, 46, 4, 4);

      // header pill
      doc.setFillColor(...item.color);
      doc.roundedRect(xPos + 4, yPosition + 4, 52, 16, 3, 3, 'F');
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.white);
      doc.text(item.label, xPos + 30, yPosition + 15, { align: 'center' });

      // value
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...item.color);
      const splitValue = doc.splitTextToSize(item.value, 52);
      doc.text(splitValue, xPos + 30, yPosition + 30, { align: 'center' });
    });

    yPosition += 62;

    // Detailed table
    const projectData = [
      ["Project Name", project.pname || 'N/A'],
      ["Project Code", project.pcode || 'N/A'],
      ["Project Type", project.ptype || 'N/A'],
      ["Location", project.plocation || 'N/A'],
      ["Start Date", project.pcreatedat ? new Date(project.pcreatedat).toLocaleDateString() : 'N/A'],
      ["End Date", project.penddate ? new Date(project.penddate).toLocaleDateString() : 'N/A'],
      ["Owner", project.powner || 'N/A'],
      ["Contact", project.potelnumber || 'N/A'],
      ["Email", project.powmail || 'N/A']
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Property', 'Details']],
      body: projectData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 10,
        cellPadding: 6
      },
      bodyStyles: {
        fontSize: 9,
        textColor: COLORS.text,
        cellPadding: 6
      },
      alternateRowStyles: {
        fillColor: COLORS.light
      },
      styles: {
        lineColor: COLORS.primary,
        lineWidth: 0.25,
        cellPadding: 6
      },
      columnStyles: {
        0: {
          cellWidth: 55,
          fontStyle: 'bold',
          fillColor: [245, 248, 250],
          textColor: COLORS.primary
        },
        1: { cellWidth: width - MARGINS.left - MARGINS.right - 90 }
      },
      margin: { left: MARGINS.left, right: MARGINS.right },
      pageBreak: 'auto'
    });

    yPosition = doc.lastAutoTable ? doc.lastAutoTable.finalY + 14 : yPosition + 20;

    // Description
    if (project.pdescription) {
      yPosition = ensureSpace(doc, yPosition, 68, () => createPageHeader(doc, `${reportType} Details`, reportType.toUpperCase()));
      doc.setFillColor(...COLORS.secondary);
      doc.roundedRect(MARGINS.left, yPosition, width - MARGINS.left - MARGINS.right, 22, 3, 3, 'F');
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.white);
      doc.text("PROJECT DESCRIPTION", MARGINS.left + 6, yPosition + 15);
      yPosition += 28;

      doc.setFillColor(...COLORS.light);
      doc.roundedRect(MARGINS.left + 6, yPosition, width - MARGINS.left - MARGINS.right - 12, 52, 4, 4, 'F');
      doc.setDrawColor(...COLORS.secondary);
      doc.setLineWidth(0.45);
      doc.roundedRect(MARGINS.left + 6, yPosition, width - MARGINS.left - MARGINS.right - 12, 52, 4, 4);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.text);
      const splitDescription = doc.splitTextToSize(project.pdescription, width - MARGINS.left - MARGINS.right - 36);
      doc.text(splitDescription, MARGINS.left + 12, yPosition + 12);
      yPosition += 64;
    }
  }

  return yPosition + 26;
};

// ---------- Signature Page ----------
const createSignaturePage = (doc) => {
  doc.addPage();
  let yPosition = createPageHeader(doc, "Authorization", "DOCUMENT APPROVAL");
  const { width } = getPageSize(doc);

  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(MARGINS.left, yPosition, 170, 26, 3, 3, 'F');
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("DOCUMENT AUTHORIZATION", MARGINS.left + 85, yPosition + 18, { align: 'center' });
  yPosition += 38;

  const signatures = [
    { title: "Owned by", role: "Project Owner", department: "Identifier" },
    { title: "Prepared by", role: "Project Manager", department: "Engineering" },
    { title: "Reviewed by", role: "Technical Lead", department: "Quality Assurance" },
    { title: "Approved by", role: "Department Head", department: "Management" }
  ];

  signatures.forEach((sig) => {
    yPosition = ensureSpace(doc, yPosition, 86, () => createPageHeader(doc, "Authorization", "DOCUMENT APPROVAL"));

    doc.setFillColor(...COLORS.light);
    doc.roundedRect(MARGINS.left + 10, yPosition, width - MARGINS.left - MARGINS.right - 20, 70, 6, 6, 'F');
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.45);
    doc.roundedRect(MARGINS.left + 10, yPosition, width - MARGINS.left - MARGINS.right - 20, 70, 6, 6);

    // Title pill
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(MARGINS.left + 16, yPosition + 6, width - MARGINS.left - MARGINS.right - 32, 18, 3, 3, 'F');
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.white);
    doc.text(sig.title.toUpperCase(), width / 2, yPosition + 18, { align: 'center' });

    // Role and dept
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text(`Role: ${sig.role}`, MARGINS.left + 20, yPosition + 36);
    doc.text(`Department: ${sig.department}`, MARGINS.left + 20, yPosition + 48);

    // Signature & date lines
    doc.setDrawColor(...COLORS.secondary);
    doc.setLineWidth(0.45);
    doc.line(MARGINS.left + 28, yPosition + 62, MARGINS.left + 140, yPosition + 62);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    doc.text("Signature", MARGINS.left + 28, yPosition + 68);

    doc.line(MARGINS.left + 150, yPosition + 62, width - MARGINS.right - 28, yPosition + 62);
    doc.text("Date", width - MARGINS.right - 28, yPosition + 68);

    yPosition += 86;
  });

  // Disclaimer box - place after signatures
  yPosition = ensureSpace(doc, yPosition, 48, () => createPageHeader(doc, "Authorization", "DOCUMENT APPROVAL"));
  doc.setFillColor(...COLORS.light);
  doc.roundedRect(MARGINS.left + 10, yPosition, width - MARGINS.left - MARGINS.right - 20, 42, 4, 4, 'F');
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  const disclaimerText = "This document contains confidential information. By signing above, you acknowledge receipt and agree to maintain confidentiality as per company policy.";
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, width - MARGINS.left - MARGINS.right - 36);
  doc.text(splitDisclaimer, MARGINS.left + 16, yPosition + 12);

  return yPosition + 50;
};

// ---------- Thank You Page ----------
const createThankYouPage = (doc) => {
  doc.addPage();
  const { width, height } = getPageSize(doc);

  // full white to avoid artifacts
  doc.setFillColor(...COLORS.white);
  doc.rect(0, 0, width, height, 'F');

  addGeometricBackground(doc, 99);

  // Top banner
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, width, 100, 'F');

  // Reduced gradient steps
  for (let i = 0; i < 10; i++) {
    const alpha = 0.6 - (i * 0.05);
    if (alpha <= 0) break;
    doc.saveGraphicsState?.();
    doc.setGState?.(new doc.GState() ? new doc.GState({ opacity: alpha }) : {});
    doc.setFillColor(...COLORS.secondary);
    doc.rect(0, 100 + i, width, 1, 'F');
    doc.restoreGraphicsState?.();
  }

  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("THANK YOU", width / 2, 160, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  doc.text("For choosing Workflows Engineering", width / 2, 180, { align: 'center' });

  // Message
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  const thankYouMsg = "We appreciate your trust in our solutions. Our commitment to excellence ensures that your projects are delivered with the highest standards of quality and professionalism.";
  const splitMsg = doc.splitTextToSize(thankYouMsg, 360);
  doc.text(splitMsg, width / 2, 200, { align: 'center' });

  // Contact box
  doc.setFillColor(...COLORS.light);
  doc.roundedRect(MARGINS.left + 20, 230, width - MARGINS.left - MARGINS.right - 40, 70, 6, 6, 'F');
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.45);
  doc.roundedRect(MARGINS.left + 20, 230, width - MARGINS.left - MARGINS.right - 40, 70, 6, 6);

  // Contact header
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(MARGINS.left + 26, 235, width - MARGINS.left - MARGINS.right - 52, 18, 3, 3, 'F');
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("GET IN TOUCH", width / 2, 246, { align: 'center' });

  // Contact details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  doc.text("Email: info@workflowsengineering.com", width / 2, 265, { align: 'center' });
  doc.text("Phone: +1 (555) 123-4567", width / 2, 278, { align: 'center' });
  doc.text("Website: www.workflowsengineering.com", width / 2, 291, { align: 'center' });

  // Bottom bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, height - 50, width, 50, 'F');
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.white);
  doc.text("Professional Construction Management Solutions", width / 2, height - 25, { align: 'center' });
};

// ---------- Timeline data page ----------
const createTimelineDataPage = (doc, timeline) => {
  doc.addPage();
  let yPosition = createPageHeader(doc, "Timeline Details", "PROJECT TIMELINE");
  const { width } = getPageSize(doc);

  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(MARGINS.left, yPosition, 170, 26, 3, 3, 'F');
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("TIMELINE OVERVIEW", MARGINS.left + 85, yPosition + 18, { align: 'center' });
  yPosition += 36;

  const timelineCards = [
    { label: "Total Workers", value: timeline.workerCount || 0, color: COLORS.primary },
    { label: "Engineers", value: timeline.tengineerCount || 0, color: COLORS.secondary },
    { label: "Architects", value: timeline.architectCount || 0, color: COLORS.accent }
  ];

  timelineCards.forEach((card, index) => {
    const xPos = MARGINS.left + (index * 70);
    doc.setFillColor(...COLORS.white);
    doc.roundedRect(xPos, yPosition, 60, 56, 4, 4, 'F');
    doc.setDrawColor(...card.color);
    doc.setLineWidth(0.6);
    doc.roundedRect(xPos, yPosition, 60, 56, 4, 4);

    doc.setFillColor(...card.color);
    doc.roundedRect(xPos + 4, yPosition + 4, 52, 18, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.white);
    doc.text(card.label, xPos + 30, yPosition + 15, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...card.color);
    doc.text(String(card.value), xPos + 30, yPosition + 36, { align: 'center' });
  });

  yPosition += 74;

  const timelineData = [
    ["Project Code", timeline.pcode || 'N/A'],
    ["Project Name", timeline.projectDetails?.pname || 'N/A'],
    ["Timeline Date", timeline.date ? new Date(timeline.date).toLocaleDateString() : 'N/A'],
    ["Total Staff", (timeline.workerCount || 0) + (timeline.tengineerCount || 0) + (timeline.architectCount || 0)],
    ["Materials Used", timeline.tmaterials?.length || 0],
    ["Tools Required", timeline.ttools?.length || 0],
    ["Expenses Count", timeline.texpenses?.length || 0]
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Timeline Property', 'Value']],
    body: timelineData,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLORS.text
    },
    alternateRowStyles: {
      fillColor: COLORS.light
    },
    styles: {
      lineColor: COLORS.primary,
      lineWidth: 0.25
    },
    columnStyles: {
      0: {
        cellWidth: 80,
        fontStyle: 'bold',
        fillColor: [245, 248, 250],
        textColor: COLORS.primary
      },
      1: { cellWidth: width - MARGINS.left - MARGINS.right - 120 }
    },
    margin: { left: MARGINS.left, right: MARGINS.right },
    pageBreak: 'auto'
  });

  yPosition = doc.lastAutoTable ? doc.lastAutoTable.finalY + 14 : yPosition + 20;

  if (timeline.tnotes) {
    yPosition = ensureSpace(doc, yPosition, 68, () => createPageHeader(doc, "Timeline Details", "PROJECT TIMELINE"));
    doc.setFillColor(...COLORS.secondary);
    doc.roundedRect(MARGINS.left, yPosition, width - MARGINS.left - MARGINS.right, 22, 3, 3, 'F');
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.white);
    doc.text("TIMELINE NOTES", MARGINS.left + 6, yPosition + 15);
    yPosition += 28;

    doc.setFillColor(...COLORS.light);
    doc.roundedRect(MARGINS.left + 6, yPosition, width - MARGINS.left - MARGINS.right - 12, 48, 4, 4, 'F');
    doc.setDrawColor(...COLORS.secondary);
    doc.setLineWidth(0.45);
    doc.roundedRect(MARGINS.left + 6, yPosition, width - MARGINS.left - MARGINS.right - 12, 48, 4, 4);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    const splitNotes = doc.splitTextToSize(timeline.tnotes, width - MARGINS.left - MARGINS.right - 36);
    doc.text(splitNotes, MARGINS.left + 12, yPosition + 12);
    yPosition += 60;
  }

  return yPosition + 26;
};

// ---------- Resource Breakdown Page ----------
const createResourceBreakdownPage = (doc, timeline) => {
  doc.addPage();
  let yPosition = createPageHeader(doc, "Resource Breakdown", "DETAILED RESOURCES");
  const { width } = getPageSize(doc);

  if (timeline.tworker && timeline.tworker.length > 0) {
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(MARGINS.left, yPosition, width - MARGINS.left - MARGINS.right, 22, 3, 3, 'F');
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.white);
    doc.text(`WORKERS (${timeline.tworker.length})`, MARGINS.left + 8, yPosition + 15);
    yPosition += 32;

    const workerData = timeline.tworker.map(worker => [
      worker.name || 'N/A',
      worker.role || 'N/A',
      worker.hoursWorked || 0,
      worker.specialization || 'General'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Name', 'Role', 'Hours', 'Specialization']],
      body: workerData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 4
      },
      alternateRowStyles: {
        fillColor: COLORS.light
      },
      styles: {
        fontSize: 8,
        cellPadding: 4,
        lineColor: COLORS.primary,
        lineWidth: 0.25
      },
      margin: { left: MARGINS.left, right: MARGINS.right },
      pageBreak: 'auto'
    });

    yPosition = doc.lastAutoTable ? doc.lastAutoTable.finalY + 14 : yPosition + 20;
  }

  if (timeline.tengineer && timeline.tengineer.length > 0) {
    doc.setFillColor(...COLORS.secondary);
    doc.roundedRect(MARGINS.left, yPosition, width - MARGINS.left - MARGINS.right, 22, 3, 3, 'F');
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.white);
    doc.text(`ENGINEERS (${timeline.tengineer.length})`, MARGINS.left + 8, yPosition + 15);
    yPosition += 32;

    const engineerData = timeline.tengineer.map(engineer => [
      engineer.name || 'N/A',
      engineer.specialty || 'N/A',
      engineer.hoursWorked || 0,
      engineer.certification || 'Standard'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Name', 'Specialty', 'Hours', 'Certification']],
      body: engineerData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.secondary,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 4
      },
      alternateRowStyles: {
        fillColor: COLORS.light
      },
      styles: {
        fontSize: 8,
        cellPadding: 4,
        lineColor: COLORS.secondary,
        lineWidth: 0.25
      },
      margin: { left: MARGINS.left, right: MARGINS.right },
      pageBreak: 'auto'
    });

    yPosition = doc.lastAutoTable ? doc.lastAutoTable.finalY + 14 : yPosition + 20;
  }

  if (timeline.tmaterials && timeline.tmaterials.length > 0) {
    if (yPosition > (getPageSize(doc).height - MARGINS.bottom - 120)) {
      doc.addPage();
      yPosition = createPageHeader(doc, "Materials & Expenses", "RESOURCE COSTS");
    }

    doc.setFillColor(...COLORS.accent);
    doc.roundedRect(MARGINS.left, yPosition, width - MARGINS.left - MARGINS.right, 22, 3, 3, 'F');
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.white);
    doc.text(`MATERIALS (${timeline.tmaterials.length})`, MARGINS.left + 8, yPosition + 15);
    yPosition += 32;

    const materialData = timeline.tmaterials.map(material => [
      material.name || 'N/A',
      material.quantity || 0,
      material.unit || 'units',
      material.cost ? `$${parseFloat(material.cost).toLocaleString()}` : '$0'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Material', 'Quantity', 'Unit', 'Cost']],
      body: materialData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.accent,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 4
      },
      alternateRowStyles: {
        fillColor: COLORS.light
      },
      styles: {
        fontSize: 8,
        cellPadding: 4,
        lineColor: COLORS.accent,
        lineWidth: 0.25
      },
      columnStyles: {
        3: { halign: 'right' }
      },
      margin: { left: MARGINS.left, right: MARGINS.right },
      pageBreak: 'auto'
    });
  }

  return yPosition + 26;
};

// ---------- Main export functions (unchanged names, improved finishing) ----------
export const exportProjectToPDF = (project, filename) => {
  const doc = new jsPDF();

  try {
    createCoverPage(doc, `Project Report: ${project.pname || 'Unnamed Project'}`, "PROJECT ANALYSIS");
    createAboutCompanyPage(doc);
    createVisionMissionPage(doc);
    createProjectDataPage(doc, project, "PROJECT");
    createSignaturePage(doc);
    createThankYouPage(doc);

    // Try to pull a base64 logo image from project (optional)
    const logo = project?.logoBase64 || project?.logo || null;
    addWatermark(doc, logo);
    addPageNumbers(doc);

    // Add footers to content pages (skip cover and last)
    const pageCount = doc.getNumberOfPages();
    for (let i = 2; i <= pageCount - 1; i++) {
      doc.setPage(i);
      createFooter(doc);
    }

    doc.save(filename || `project-${project.pcode || Date.now()}.pdf`);
  } catch (error) {
    console.error('Error generating project PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};

export const exportTimelineToPDF = (timeline, filename) => {
  const doc = new jsPDF();

  try {
    createCoverPage(doc, `Timeline Report: ${timeline.projectDetails?.pname || timeline.pcode || 'Timeline'}`, "TIMELINE ANALYSIS");
    createAboutCompanyPage(doc);
    createVisionMissionPage(doc);
    createTimelineDataPage(doc, timeline);
    createResourceBreakdownPage(doc, timeline);
    createSignaturePage(doc);
    createThankYouPage(doc);

    const logo = timeline?.logoBase64 || timeline?.logo || null;
    addWatermark(doc, logo);
    addPageNumbers(doc);

    const pageCount = doc.getNumberOfPages();
    for (let i = 2; i <= pageCount - 1; i++) {
      doc.setPage(i);
      createFooter(doc);
    }

    doc.save(filename || `timeline-${timeline.pcode || Date.now()}.pdf`);
  } catch (error) {
    console.error('Error generating timeline PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};

export const exportFinancialDashboardToPDF = (financial, filename) => {
  const doc = new jsPDF();

  try {
    createCoverPage(doc, `Financial Dashboard: ${financial.dashboardName || 'Financial Report'}`, "FINANCIAL ANALYSIS");
    createAboutCompanyPage(doc);
    createVisionMissionPage(doc);

    // Financial page
    doc.addPage();
    let yPosition = createPageHeader(doc, "Financial Dashboard", "FINANCIAL OVERVIEW");
    const { width } = getPageSize(doc);

    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(MARGINS.left, yPosition, 170, 26, 3, 3, 'F');
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.white);
    doc.text("FINANCIAL SUMMARY", MARGINS.left + 85, yPosition + 18, { align: 'center' });
    yPosition += 34;

    const financialCards = [
      {
        label: "Grand Total",
        value: financial.financialSummary?.grandTotal ? `$${financial.financialSummary.grandTotal.toLocaleString()}` : '$0',
        color: COLORS.success
      },
      {
        label: "Dashboard ID",
        value: financial.dashboardId || 'N/A',
        color: COLORS.primary
      },
      {
        label: "Status",
        value: financial.status || 'Active',
        color: COLORS.secondary
      }
    ];

    financialCards.forEach((card, index) => {
      const xPos = MARGINS.left + (index * 66);
      doc.setFillColor(...COLORS.white);
      doc.roundedRect(xPos, yPosition, 60, 46, 4, 4, 'F');
      doc.setDrawColor(...card.color);
      doc.setLineWidth(0.6);
      doc.roundedRect(xPos, yPosition, 60, 46, 4, 4);

      doc.setFillColor(...card.color);
      doc.roundedRect(xPos + 4, yPosition + 4, 52, 16, 3, 3, 'F');
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.white);
      doc.text(card.label, xPos + 30, yPosition + 15, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...card.color);
      const splitValue = doc.splitTextToSize(card.value, 52);
      doc.text(splitValue, xPos + 30, yPosition + 30, { align: 'center' });
    });

    yPosition += 64;

    const financialData = [
      ["Dashboard Name", financial.dashboardName || 'N/A'],
      ["Dashboard ID", financial.dashboardId || 'N/A'],
      ["Status", financial.status || 'N/A'],
      ["Created Date", financial.createdAt ? new Date(financial.createdAt).toLocaleDateString() : 'N/A'],
      ["Grand Total", financial.financialSummary?.grandTotal ? `$${financial.financialSummary.grandTotal.toLocaleString()}` : '$0']
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Financial Property', 'Value']],
      body: financialData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 11
      },
      bodyStyles: {
        fontSize: 10,
        textColor: COLORS.text
      },
      alternateRowStyles: {
        fillColor: COLORS.light
      },
      columnStyles: {
        0: {
          cellWidth: 72,
          fontStyle: 'bold',
          fillColor: [245, 248, 250],
          textColor: COLORS.primary
        },
        1: { cellWidth: width - MARGINS.left - MARGINS.right - 120 }
      },
      margin: { left: MARGINS.left, right: MARGINS.right }
    });

    createSignaturePage(doc);
    createThankYouPage(doc);

    const logo = financial?.logoBase64 || financial?.logo || null;
    addWatermark(doc, logo);
    addPageNumbers(doc);

    const pageCount = doc.getNumberOfPages();
    for (let i = 2; i <= pageCount - 1; i++) {
      doc.setPage(i);
      createFooter(doc);
    }

    doc.save(filename || `financial-${financial.dashboardId || Date.now()}.pdf`);
  } catch (error) {
    console.error('Error generating financial PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};
