const { FinancialDashboard, SALARY_CONFIG } = require('../Model/FinancialDashboardMdl');
const Project = require('../Model/ProjectModel');
const ProjectTimeline = require('../Model/ProjectTimelineMdl');

// Helper function to generate unique dashboard ID
const generateDashboardId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5);
  return `FDASH-${timestamp}-${randomStr}`.toUpperCase();
};

// Calculate labor costs based on roles and hours
const calculateLaborCosts = (workers, engineers, architects, projectManagers) => {
  let totalLaborCost = 0;
  const laborBreakdown = [];

  // Calculate worker costs
  workers.forEach(worker => {
    const roleConfig = SALARY_CONFIG.WORKER_ROLES[worker.role];
    if (roleConfig && worker.hoursWorked) {
      const cost = parseFloat(worker.hoursWorked) * roleConfig.hourlyRate;
      totalLaborCost += cost;
      laborBreakdown.push({
        type: 'Worker',
        name: worker.name,
        role: worker.role,
        hours: parseFloat(worker.hoursWorked),
        rate: roleConfig.hourlyRate,
        cost: cost
      });
    }
  });

  // Calculate engineer costs
  engineers.forEach(engineer => {
    const roleConfig = SALARY_CONFIG.ENGINEER_SPECIALTIES[engineer.specialty];
    if (roleConfig && engineer.hoursWorked) {
      const cost = parseFloat(engineer.hoursWorked) * roleConfig.hourlyRate;
      totalLaborCost += cost;
      laborBreakdown.push({
        type: 'Engineer',
        name: engineer.name,
        role: engineer.specialty,
        hours: parseFloat(engineer.hoursWorked),
        rate: roleConfig.hourlyRate,
        cost: cost
      });
    }
  });

  // Calculate architect costs
  architects.forEach(architect => {
    const roleConfig = SALARY_CONFIG.ARCHITECT_SPECIALTIES[architect.specialty];
    if (roleConfig && architect.hoursWorked) {
      const cost = parseFloat(architect.hoursWorked) * roleConfig.hourlyRate;
      totalLaborCost += cost;
      laborBreakdown.push({
        type: 'Architect',
        name: architect.name,
        role: architect.specialty,
        hours: parseFloat(architect.hoursWorked),
        rate: roleConfig.hourlyRate,
        cost: cost
      });
    }
  });

  // Calculate project manager costs (estimated 8 hours per day)
  projectManagers.forEach(pm => {
    const avgPMRate = 85; // Average PM hourly rate
    const estimatedHours = 8; // Standard working day
    const cost = estimatedHours * avgPMRate;
    totalLaborCost += cost;
    laborBreakdown.push({
      type: 'Project Manager',
      name: pm.name,
      role: 'Project Manager',
      hours: estimatedHours,
      rate: avgPMRate,
      cost: cost
    });
  });

  return { totalLaborCost, laborBreakdown };
};

// Calculate material costs
const calculateMaterialCosts = (materials) => {
  let totalMaterialCost = 0;
  const materialBreakdown = [];

  materials.forEach(material => {
    const materialConfig = SALARY_CONFIG.MATERIAL_COSTS[material.name];
    if (materialConfig && material.quantity) {
      const cost = parseFloat(material.quantity) * materialConfig.costPerUnit;
      totalMaterialCost += cost;
      materialBreakdown.push({
        name: material.name,
        quantity: parseFloat(material.quantity),
        unit: material.unit || materialConfig.unit,
        unitCost: materialConfig.costPerUnit,
        totalCost: cost,
        category: materialConfig.category
      });
    } else if (material.cost) {
      // Use provided cost if no predefined cost available
      const cost = parseFloat(material.cost);
      totalMaterialCost += cost;
      materialBreakdown.push({
        name: material.name,
        quantity: parseFloat(material.quantity || 1),
        unit: material.unit || 'unit',
        unitCost: cost / (parseFloat(material.quantity) || 1),
        totalCost: cost,
        category: 'Custom'
      });
    }
  });

  return { totalMaterialCost, materialBreakdown };
};

// Calculate tool costs
const calculateToolCosts = (tools) => {
  let totalToolCost = 0;
  const toolBreakdown = [];

  tools.forEach(tool => {
    const toolConfig = SALARY_CONFIG.TOOL_COSTS[tool.name];
    if (toolConfig && tool.quantity) {
      // Assume rental for 1 day per quantity
      const cost = parseFloat(tool.quantity) * toolConfig.rentalPerDay;
      totalToolCost += cost;
      toolBreakdown.push({
        name: tool.name,
        quantity: parseFloat(tool.quantity),
        dailyRate: toolConfig.rentalPerDay,
        totalCost: cost,
        category: toolConfig.category,
        status: tool.status
      });
    }
  });

  return { totalToolCost, toolBreakdown };
};

// Calculate project-specific costs based on type and priority
const calculateProjectCosts = (project) => {
  let projectCost = 0;
  let projectMultiplier = 1.0;

  // Apply project type multiplier
  const typeConfig = SALARY_CONFIG.PROJECT_TYPES[project.ptype];
  if (typeConfig) {
    projectCost += typeConfig.baseCost;
    projectMultiplier *= typeConfig.multiplier;
  }

  // Apply project priority multiplier
  const priorityConfig = SALARY_CONFIG.PROJECT_PRIORITIES[project.ppriority];
  if (priorityConfig) {
    projectCost += priorityConfig.urgencyFee;
    projectMultiplier *= priorityConfig.multiplier;
  }

  return { projectCost, projectMultiplier };
};

// Get all financial dashboards
const getAllDashboards = async (req, res) => {
  try {
    const dashboards = await FinancialDashboard.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      message: `Found ${dashboards.length} financial dashboards`,
      count: dashboards.length,
      data: dashboards
    });
  } catch (error) {
    console.error('Error fetching financial dashboards:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching financial dashboards',
      error: error.message
    });
  }
};

// Get single financial dashboard by ID
const getDashboardById = async (req, res) => {
  try {
    const dashboard = await FinancialDashboard.findById(req.params.id);
    
    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Financial dashboard not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Financial dashboard retrieved successfully',
      data: dashboard
    });
  } catch (error) {
    console.error('Error fetching financial dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching financial dashboard',
      error: error.message
    });
  }
};

// Calculate comprehensive financial dashboard
const calculateFinancialDashboard = async (req, res) => {
  try {
    const { dashboardName, selectedProjects, dateFrom, dateTo } = req.body;

    console.log('🔢 Starting financial calculations...');
    console.log('📊 Selected projects:', selectedProjects);
    console.log('📅 Date range:', { dateFrom, dateTo });

    // Get all projects if none specified
    let projectQuery = {};
    if (selectedProjects && selectedProjects.length > 0) {
      projectQuery = { pcode: { $in: selectedProjects } };
    }

    const projects = await Project.find(projectQuery);
    console.log(`📋 Found ${projects.length} projects for calculation`);

    // Get timeline data
    let timelineQuery = {};
    if (selectedProjects && selectedProjects.length > 0) {
      timelineQuery.projectCode = { $in: selectedProjects };
    }
    if (dateFrom || dateTo) {
      timelineQuery.date = {};
      if (dateFrom) timelineQuery.date.$gte = new Date(dateFrom);
      if (dateTo) timelineQuery.date.$lte = new Date(dateTo);
    }

    const timelines = await ProjectTimeline.find(timelineQuery);
    console.log(`📈 Found ${timelines.length} timeline entries for calculation`);

    // Initialize calculation variables
    let totalProjectCost = 0;
    let totalLaborCost = 0;
    let totalMaterialCost = 0;
    let totalToolCost = 0;
    let totalExpenses = 0;
    const projectBreakdown = [];
    const laborAnalytics = {
      totalWorkers: 0,
      totalEngineers: 0,
      totalArchitects: 0,
      totalProjectManagers: 0,
      totalLaborHours: 0,
      laborByRole: []
    };
    const materialAnalytics = { totalMaterials: 0, materialsByType: [] };
    const toolAnalytics = { totalTools: 0, toolsByType: [] };

    // Process each project
    for (const project of projects) {
      console.log(`💼 Processing project: ${project.pcode} - ${project.pname}`);

      // Calculate base project costs
      const { projectCost, projectMultiplier } = calculateProjectCosts(project);

      // Get timelines for this project
      const projectTimelines = timelines.filter(t => t.projectCode === project.pcode);
      console.log(`📊 Found ${projectTimelines.length} timelines for project ${project.pcode}`);

      let projectLaborCost = 0;
      let projectMaterialCost = 0;
      let projectToolCost = 0;
      let projectExpenses = 0;
      let projectWorkerCount = 0;
      let projectEngineerCount = 0;
      let projectArchitectCount = 0;
      let projectPMCount = 0;
      const timelineDetails = [];

      // Process each timeline entry for this project
      for (const timeline of projectTimelines) {
        // Calculate costs for this timeline entry
        const { totalLaborCost: timelineLaborCost, laborBreakdown } = calculateLaborCosts(
          timeline.tworker || [],
          timeline.tengineer || [],
          timeline.tarchitect || [],
          timeline.tprojectManager || []
        );

        const { totalMaterialCost: timelineMaterialCost, materialBreakdown } = calculateMaterialCosts(
          timeline.tmaterials || []
        );

        const { totalToolCost: timelineToolCost, toolBreakdown } = calculateToolCosts(
          timeline.ttools || []
        );

        // Calculate expenses
        const timelineExpenses = (timeline.texpenses || []).reduce((sum, exp) => {
          return sum + (parseFloat(exp.amount) || 0);
        }, 0);

        // Apply project multiplier to all costs
        const adjustedLaborCost = timelineLaborCost * projectMultiplier;
        const adjustedMaterialCost = timelineMaterialCost * projectMultiplier;
        const adjustedToolCost = timelineToolCost * projectMultiplier;
        const adjustedExpenses = timelineExpenses * projectMultiplier;

        projectLaborCost += adjustedLaborCost;
        projectMaterialCost += adjustedMaterialCost;
        projectToolCost += adjustedToolCost;
        projectExpenses += adjustedExpenses;

        // Count resources
        projectWorkerCount += (timeline.tworker || []).length;
        projectEngineerCount += (timeline.tengineer || []).length;
        projectArchitectCount += (timeline.tarchitect || []).length;
        projectPMCount += (timeline.tprojectManager || []).length;

        // Store timeline details
        timelineDetails.push({
          date: timeline.date,
          dailyCost: adjustedLaborCost + adjustedMaterialCost + adjustedToolCost + adjustedExpenses,
          workers: (timeline.tworker || []).length,
          engineers: (timeline.tengineer || []).length,
          architects: (timeline.tarchitect || []).length,
          materials: adjustedMaterialCost,
          tools: adjustedToolCost,
          expenses: adjustedExpenses
        });

        // Update analytics
        laborAnalytics.totalWorkers += (timeline.tworker || []).length;
        laborAnalytics.totalEngineers += (timeline.tengineer || []).length;
        laborAnalytics.totalArchitects += (timeline.tarchitect || []).length;
        laborAnalytics.totalProjectManagers += (timeline.tprojectManager || []).length;

        // Count labor hours
        laborBreakdown.forEach(labor => {
          laborAnalytics.totalLaborHours += labor.hours;
        });

        materialAnalytics.totalMaterials += (timeline.tmaterials || []).length;
        toolAnalytics.totalTools += (timeline.ttools || []).length;
      }

      // Calculate total project cost
      const totalProjectCostForThisProject = projectCost + projectLaborCost + projectMaterialCost + projectToolCost + projectExpenses;

      // Add to project breakdown
      projectBreakdown.push({
        projectCode: project.pcode,
        projectName: project.pname,
        projectType: project.ptype,
        projectPriority: project.ppriority,
        totalCost: totalProjectCostForThisProject,
        laborCost: projectLaborCost,
        materialCost: projectMaterialCost,
        toolCost: projectToolCost,
        expenses: projectExpenses,
        workerCount: projectWorkerCount,
        engineerCount: projectEngineerCount,
        architectCount: projectArchitectCount,
        pmCount: projectPMCount,
        timeline: timelineDetails
      });

      // Add to totals
      totalProjectCost += totalProjectCostForThisProject;
      totalLaborCost += projectLaborCost;
      totalMaterialCost += projectMaterialCost;
      totalToolCost += projectToolCost;
      totalExpenses += projectExpenses;
    }

    // Calculate financial summary
    const grandTotal = totalProjectCost;
    const averageProjectCost = projects.length > 0 ? grandTotal / projects.length : 0;
    const profitMargin = grandTotal * 0.15; // Assume 15% profit margin
    const roi = grandTotal > 0 ? (profitMargin / grandTotal) * 100 : 0;

    // Create financial dashboard
    const dashboardData = {
      dashboardId: generateDashboardId(),
      dashboardName: dashboardName || `Financial Analysis - ${new Date().toLocaleDateString()}`,
      calculationDate: new Date(),
      selectedProjects: selectedProjects || [],
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      totalProjectCost,
      totalLaborCost,
      totalMaterialCost,
      totalToolCost,
      totalExpenses,
      projectBreakdown,
      laborAnalytics: {
        ...laborAnalytics,
        averageHourlyRate: laborAnalytics.totalLaborHours > 0 ? totalLaborCost / laborAnalytics.totalLaborHours : 0
      },
      materialAnalytics,
      toolAnalytics,
      financialSummary: {
        grandTotal,
        projectCount: projects.length,
        timelineEntries: timelines.length,
        averageProjectCost,
        profitMargin,
        roi
      }
    };

    const dashboard = new FinancialDashboard(dashboardData);
    const savedDashboard = await dashboard.save();

    console.log('✅ Financial dashboard calculation completed');
    console.log(`💰 Grand Total: $${grandTotal.toFixed(2)}`);

    res.status(201).json({
      success: true,
      message: 'Financial dashboard calculated and saved successfully',
      data: savedDashboard
    });

  } catch (error) {
    console.error('❌ Error calculating financial dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating financial dashboard',
      error: error.message
    });
  }
};

// Update financial dashboard
const updateDashboard = async (req, res) => {
  try {
    const dashboard = await FinancialDashboard.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Financial dashboard not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Financial dashboard updated successfully',
      data: dashboard
    });
  } catch (error) {
    console.error('Error updating financial dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating financial dashboard',
      error: error.message
    });
  }
};

// Delete financial dashboard
const deleteDashboard = async (req, res) => {
  try {
    const dashboard = await FinancialDashboard.findByIdAndDelete(req.params.id);

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Financial dashboard not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Financial dashboard deleted successfully',
      data: dashboard
    });
  } catch (error) {
    console.error('Error deleting financial dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting financial dashboard',
      error: error.message
    });
  }
};

// Get salary configuration
const getSalaryConfig = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Salary configuration retrieved successfully',
      data: SALARY_CONFIG
    });
  } catch (error) {
    console.error('Error getting salary config:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting salary configuration',
      error: error.message
    });
  }
};

// Get available projects for selection
const getAvailableProjects = async (req, res) => {
  try {
    const projects = await Project.find({}, 'pcode pname ptype ppriority pstatus plocation').sort({ pname: 1 });
    
    res.status(200).json({
      success: true,
      message: `Found ${projects.length} available projects`,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching available projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available projects',
      error: error.message
    });
  }
};

module.exports = {
  getAllDashboards,
  getDashboardById,
  calculateFinancialDashboard,
  updateDashboard,
  deleteDashboard,
  getSalaryConfig,
  getAvailableProjects
};