import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Company branding constants
const COMPANY_NAME = "Workflows Engineering";
const COMPANY_TAGLINE = "Smart Construction Workflow & Safety Management System";
const CONFIDENTIAL_TEXT = "CONFIDENTIAL";

// Create a professional header for all exports
const createHeader = (doc, title, date = new Date()) => {
  // Add company logo (using a construction-themed emoji for now)
  doc.setFontSize(24);
  doc.setTextColor(40, 53, 147); // Dark blue
  doc.text("🏗️", 20, 25);
  
  // Company name
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 53, 147);
  doc.text(COMPANY_NAME, 40, 25);
  
  // Company tagline
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(COMPANY_TAGLINE, 40, 32);
  
  // Report title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(title, doc.internal.pageSize.width / 2, 50, { align: 'center' });
  
  // Report date
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${date.toLocaleDateString()}`, doc.internal.pageSize.width - 20, 25, { align: 'right' });
  
  // Add a line separator
  doc.setDrawColor(212, 175, 55); // Gold color
  doc.setLineWidth(0.5);
  doc.line(20, 60, doc.internal.pageSize.width - 20, 60);
  
  return 65; // Return next Y position
};

// Create a professional footer for all exports
const createFooter = (doc) => {
  const pageHeight = doc.internal.pageSize.height;
  
  // Add a line separator
  doc.setDrawColor(212, 175, 55); // Gold color
  doc.setLineWidth(0.5);
  doc.line(20, pageHeight - 30, doc.internal.pageSize.width - 20, pageHeight - 30);
  
  // Confidential watermark
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(200, 200, 200);
  doc.text(CONFIDENTIAL_TEXT, doc.internal.pageSize.width / 2, pageHeight - 20, { align: 'center' });
  
  // Page number
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, pageHeight - 10, { align: 'right' });
  }
};

// Add a watermark to all pages
const addWatermark = (doc) => {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Add confidential watermark in the background
    doc.setFontSize(40);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(240, 240, 240);
    
    // Rotate and add watermark text
    doc.saveGraphicsState();
    doc.setTextColor(240, 240, 240);
    doc.text(CONFIDENTIAL_TEXT, doc.internal.pageSize.width / 2, doc.internal.pageSize.height / 2, {
      align: 'center',
      angle: 45
    });
    doc.restoreGraphicsState();
  }
};

// Export Project Data to PDF
export const exportProjectToPDF = (project, filename) => {
  const doc = new jsPDF();
  
  // Create header
  let yPosition = createHeader(doc, `Project Report: ${project.pname}`);
  
  // Project Information Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Project Information", 20, yPosition);
  yPosition += 10;
  
  // Project details table
  const projectData = [
    ["Project Name", project.pname],
    ["Project Code", project.pcode],
    ["Project Number", project.pnumber],
    ["Project Type", project.ptype],
    ["Location", project.plocation],
    ["Status", project.pstatus],
    ["Priority", project.ppriority],
    ["Budget", `$${parseFloat(project.pbudget || 0).toLocaleString()}`],
    ["Start Date", new Date(project.pcreatedat).toLocaleDateString()],
    ["End Date", new Date(project.penddate).toLocaleDateString()],
    ["Owner ID", project.pownerid],
    ["Owner Name", project.pownername],
    ["Phone", project.potelnumber],
    ["Email", project.powmail]
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Value']],
    body: projectData,
    theme: 'grid',
    headStyles: {
      fillColor: [40, 53, 147],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      cellPadding: 3,
      fontSize: 10,
      overflow: 'linebreak',
      tableWidth: 'wrap'
    },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 120 }
    },
    margin: { left: 20, right: 20 }
  });
  
  yPosition = doc.lastAutoTable.finalY + 15;
  
  // Project Description Section
  if (project.pdescription) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Project Description", 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const splitDescription = doc.splitTextToSize(project.pdescription, 170);
    doc.text(splitDescription, 20, yPosition);
    yPosition += splitDescription.length * 7 + 10;
  }
  
  // Issues Section
  if (project.pissues && project.pissues.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Issues", 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const issuesText = Array.isArray(project.pissues) ? project.pissues.join(', ') : project.pissues;
    const splitIssues = doc.splitTextToSize(issuesText, 170);
    doc.text(splitIssues, 20, yPosition);
    yPosition += splitIssues.length * 7 + 10;
  }
  
  // Observations Section
  if (project.pobservations) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Observations", 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const splitObservations = doc.splitTextToSize(project.pobservations, 170);
    doc.text(splitObservations, 20, yPosition);
    yPosition += splitObservations.length * 7 + 10;
  }
  
  // Signatures Section
  yPosition = Math.max(yPosition, doc.internal.pageSize.height - 100);
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Signatures", 20, yPosition);
  yPosition += 10;
  
  // Signature lines
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Prepared by: ________________________", 20, yPosition);
  doc.text("Date: _________", 150, yPosition);
  yPosition += 15;
  
  doc.text("Approved by: ________________________", 20, yPosition);
  doc.text("Date: _________", 150, yPosition);
  
  // Add watermark and footer
  addWatermark(doc);
  createFooter(doc);
  
  // Save the PDF
  doc.save(filename || `project-${project.pcode || 'report'}.pdf`);
};

// Export Project Timeline Data to PDF
export const exportTimelineToPDF = (timeline, filename) => {
  const doc = new jsPDF();
  
  // Create header
  let yPosition = createHeader(doc, `Project Timeline Report: ${timeline.projectDetails?.pname || timeline.pcode}`);
  
  // Timeline Information Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Timeline Information", 20, yPosition);
  yPosition += 10;
  
  // Timeline details table
  const timelineData = [
    ["Project Code", timeline.pcode],
    ["Project Name", timeline.projectDetails?.pname || 'N/A'],
    ["Date", new Date(timeline.date).toLocaleDateString()],
    ["Workers Count", timeline.workerCount || 0],
    ["Engineers Count", timeline.tengineerCount || 0],
    ["Architects Count", timeline.architectCount || 0]
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Value']],
    body: timelineData,
    theme: 'grid',
    headStyles: {
      fillColor: [40, 53, 147],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      cellPadding: 3,
      fontSize: 10,
      overflow: 'linebreak',
      tableWidth: 'wrap'
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 110 }
    },
    margin: { left: 20, right: 20 }
  });
  
  yPosition = doc.lastAutoTable.finalY + 15;
  
  // Workers Section
  if (timeline.tworker && timeline.tworker.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Workers", 20, yPosition);
    yPosition += 10;
    
    const workerData = timeline.tworker.map(worker => [
      worker.name || 'N/A',
      worker.role || 'N/A',
      worker.hoursWorked || 0
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Name', 'Role', 'Hours Worked']],
      body: workerData,
      theme: 'grid',
      headStyles: {
        fillColor: [40, 53, 147],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 3,
        fontSize: 10
      },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;
  }
  
  // Engineers Section
  if (timeline.tengineer && timeline.tengineer.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Engineers", 20, yPosition);
    yPosition += 10;
    
    const engineerData = timeline.tengineer.map(engineer => [
      engineer.name || 'N/A',
      engineer.specialty || 'N/A',
      engineer.hoursWorked || 0
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Name', 'Specialty', 'Hours Worked']],
      body: engineerData,
      theme: 'grid',
      headStyles: {
        fillColor: [40, 53, 147],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 3,
        fontSize: 10
      },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;
  }
  
  // Architects Section
  if (timeline.tarchitect && timeline.tarchitect.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Architects", 20, yPosition);
    yPosition += 10;
    
    const architectData = timeline.tarchitect.map(architect => [
      architect.name || 'N/A',
      architect.specialty || 'N/A',
      architect.hoursWorked || 0
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Name', 'Specialty', 'Hours Worked']],
      body: architectData,
      theme: 'grid',
      headStyles: {
        fillColor: [40, 53, 147],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 3,
        fontSize: 10
      },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;
  }
  
  // Materials Section
  if (timeline.tmaterials && timeline.tmaterials.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Materials", 20, yPosition);
    yPosition += 10;
    
    const materialData = timeline.tmaterials.map(material => [
      material.name || 'N/A',
      material.quantity || 0,
      material.unit || 'N/A',
      material.cost ? `$${material.cost}` : 'N/A'
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Name', 'Quantity', 'Unit', 'Cost']],
      body: materialData,
      theme: 'grid',
      headStyles: {
        fillColor: [40, 53, 147],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 3,
        fontSize: 10
      },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;
  }
  
  // Tools Section
  if (timeline.ttools && timeline.ttools.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Tools", 20, yPosition);
    yPosition += 10;
    
    const toolData = timeline.ttools.map(tool => [
      tool.name || 'N/A',
      tool.quantity || 0,
      tool.status || 'N/A'
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Name', 'Quantity', 'Status']],
      body: toolData,
      theme: 'grid',
      headStyles: {
        fillColor: [40, 53, 147],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 3,
        fontSize: 10
      },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;
  }
  
  // Expenses Section
  if (timeline.texpenses && timeline.texpenses.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Expenses", 20, yPosition);
    yPosition += 10;
    
    const expenseData = timeline.texpenses.map(expense => [
      expense.description || 'N/A',
      expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A',
      expense.amount ? `$${expense.amount}` : 'N/A'
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Description', 'Date', 'Amount']],
      body: expenseData,
      theme: 'grid',
      headStyles: {
        fillColor: [40, 53, 147],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 3,
        fontSize: 10
      },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;
  }
  
  // Notes Section
  if (timeline.tnotes) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Notes", 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const splitNotes = doc.splitTextToSize(timeline.tnotes, 170);
    doc.text(splitNotes, 20, yPosition);
    yPosition += splitNotes.length * 7 + 10;
  }
  
  // Signatures Section
  yPosition = Math.max(yPosition, doc.internal.pageSize.height - 100);
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Signatures", 20, yPosition);
  yPosition += 10;
  
  // Signature lines
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Prepared by: ________________________", 20, yPosition);
  doc.text("Date: _________", 150, yPosition);
  yPosition += 15;
  
  doc.text("Approved by: ________________________", 20, yPosition);
  doc.text("Date: _________", 150, yPosition);
  
  // Add watermark and footer
  addWatermark(doc);
  createFooter(doc);
  
  // Save the PDF
  doc.save(filename || `timeline-${timeline.pcode || 'report'}-${new Date(timeline.date).toISOString().split('T')[0]}.pdf`);
};

// Export Financial Dashboard Data to PDF
export const exportFinancialDashboardToPDF = (dashboard, filename) => {
  const doc = new jsPDF();
  
  // Create header
  let yPosition = createHeader(doc, `Financial Dashboard Report: ${dashboard.dashboardName}`);
  
  // Dashboard Information Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Dashboard Information", 20, yPosition);
  yPosition += 10;
  
  // Dashboard details table
  const dashboardData = [
    ["Dashboard Name", dashboard.dashboardName],
    ["Dashboard ID", dashboard.dashboardId],
    ["Calculation Date", new Date(dashboard.calculationDate).toLocaleDateString()],
    ["Projects Analyzed", dashboard.financialSummary?.projectCount || 0],
    ["Timeline Entries", dashboard.financialSummary?.timelineEntries || 0]
  ];
  
  if (dashboard.selectedProjects && dashboard.selectedProjects.length > 0) {
    dashboardData.push(["Selected Projects", dashboard.selectedProjects.join(', ')]);
  }
  
  if (dashboard.dateFrom) {
    dashboardData.push(["Date From", new Date(dashboard.dateFrom).toLocaleDateString()]);
  }
  
  if (dashboard.dateTo) {
    dashboardData.push(["Date To", new Date(dashboard.dateTo).toLocaleDateString()]);
  }
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Value']],
    body: dashboardData,
    theme: 'grid',
    headStyles: {
      fillColor: [40, 53, 147],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      cellPadding: 3,
      fontSize: 10,
      overflow: 'linebreak',
      tableWidth: 'wrap'
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 110 }
    },
    margin: { left: 20, right: 20 }
  });
  
  yPosition = doc.lastAutoTable.finalY + 15;
  
  // Financial Summary Section
  if (dashboard.financialSummary) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Financial Summary", 20, yPosition);
    yPosition += 10;
    
    const summaryData = [
      ["Grand Total", `$${(dashboard.financialSummary.grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ["Average Project Cost", `$${(dashboard.financialSummary.averageProjectCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ["Profit Margin", `$${(dashboard.financialSummary.profitMargin || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ["ROI", `${(dashboard.financialSummary.roi || 0).toFixed(2)}%`]
    ];
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: {
        fillColor: [40, 53, 147],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 3,
        fontSize: 10
      },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;
  }
  
  // Cost Breakdown Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Cost Breakdown", 20, yPosition);
  yPosition += 10;
  
  const costData = [
    ["Labor Costs", `$${(dashboard.totalLaborCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ["Material Costs", `$${(dashboard.totalMaterialCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ["Tool Costs", `$${(dashboard.totalToolCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ["Expenses", `$${(dashboard.totalExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ["Project Costs", `$${(dashboard.totalProjectCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Cost Type', 'Amount']],
    body: costData,
    theme: 'grid',
    headStyles: {
      fillColor: [40, 53, 147],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      cellPadding: 3,
      fontSize: 10
    },
    margin: { left: 20, right: 20 }
  });
  
  yPosition = doc.lastAutoTable.finalY + 15;
  
  // Project Breakdown Section
  if (dashboard.projectBreakdown && dashboard.projectBreakdown.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Project Breakdown", 20, yPosition);
    yPosition += 10;
    
    const projectData = dashboard.projectBreakdown.map(project => [
      project.projectName || project.projectCode,
      project.projectType || 'N/A',
      `$${(project.totalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `$${(project.laborCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `$${(project.materialCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `$${(project.toolCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Project', 'Type', 'Total Cost', 'Labor', 'Materials', 'Tools']],
      body: projectData,
      theme: 'grid',
      headStyles: {
        fillColor: [40, 53, 147],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 3,
        fontSize: 8
      },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;
  }
  
  // Signatures Section
  yPosition = Math.max(yPosition, doc.internal.pageSize.height - 100);
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Signatures", 20, yPosition);
  yPosition += 10;
  
  // Signature lines
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Prepared by: ________________________", 20, yPosition);
  doc.text("Date: _________", 150, yPosition);
  yPosition += 15;
  
  doc.text("Approved by: ________________________", 20, yPosition);
  doc.text("Date: _________", 150, yPosition);
  
  // Add watermark and footer
  addWatermark(doc);
  createFooter(doc);
  
  // Save the PDF
  doc.save(filename || `financial-dashboard-${dashboard.dashboardId || 'report'}.pdf`);
};