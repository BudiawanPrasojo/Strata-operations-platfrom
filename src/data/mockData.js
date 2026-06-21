export const kpiData = [
  {
    id: 'daily-production',
    title: 'Daily Production',
    value: '12,847',
    unit: 'tons',
    change: +3.2,
    icon: 'TrendingUp',
    color: 'industrial',
  },
  {
    id: 'active-equipment',
    title: 'Active Equipment',
    value: '34',
    unit: 'of 41',
    change: -2.4,
    icon: 'Truck',
    color: 'info',
  },
  {
    id: 'fuel-consumption',
    title: 'Fuel Consumption',
    value: '8,423',
    unit: 'liters',
    change: -1.8,
    icon: 'Fuel',
    color: 'amber',
  },
  {
    id: 'safety-score',
    title: 'Safety Score',
    value: '94.7',
    unit: '%',
    change: +0.5,
    icon: 'Shield',
    color: 'success',
  },
  {
    id: 'operational-efficiency',
    title: 'Operational Efficiency',
    value: '87.3',
    unit: '%',
    change: +1.1,
    icon: 'Gauge',
    color: 'steel',
  },
];

export const liveFeedData = [
  {
    id: 1,
    timestamp: '08:42:15',
    type: 'movement',
    message: 'Truck DT-09 entered Sector B — Hauling Route Alpha',
    severity: 'info',
  },
  {
    id: 2,
    timestamp: '08:39:22',
    type: 'anomaly',
    message: 'Fuel anomaly detected on Excavator EX-14 — consumption 23% above baseline',
    severity: 'warning',
  },
  {
    id: 3,
    timestamp: '08:36:08',
    type: 'maintenance',
    message: 'Maintenance warning triggered — Drill Unit DR-03 approaching service interval',
    severity: 'warning',
  },
  {
    id: 4,
    timestamp: '08:33:41',
    type: 'ai',
    message: 'AI congestion risk identified — Sector C haul route bottleneck probability 78%',
    severity: 'danger',
  },
  {
    id: 5,
    timestamp: '08:30:19',
    type: 'safety',
    message: 'Worker fatigue alert — Operator J. Wilson approaching shift hour limit',
    severity: 'warning',
  },
  {
    id: 6,
    timestamp: '08:27:55',
    type: 'production',
    message: 'Sector A daily target reached — 4,200 tons extracted',
    severity: 'success',
  },
  {
    id: 7,
    timestamp: '08:24:33',
    type: 'movement',
    message: 'Bulldozer BD-11 repositioning to Sector D — grade adjustment',
    severity: 'info',
  },
  {
    id: 8,
    timestamp: '08:21:10',
    type: 'ai',
    message: 'Predicted maintenance required for Excavator EX-14 within 36 operational hours',
    severity: 'warning',
  },
];

export const equipmentData = [
  {
    id: 'EX-14',
    name: 'Excavator EX-14',
    type: 'Excavator',
    status: 'Active',
    health: 72,
    utilization: 85,
    maintenance: 'Due Soon',
    location: 'Sector A',
    operator: 'R. Martinez',
    fuelLevel: 64,
    hoursToday: 6.5,
    lastService: '12 days ago',
  },
  {
    id: 'DT-07',
    name: 'Dump Truck DT-07',
    type: 'Dump Truck',
    status: 'Active',
    health: 91,
    utilization: 78,
    maintenance: 'Good',
    location: 'Sector B',
    operator: 'K. Thompson',
    fuelLevel: 82,
    hoursToday: 5.2,
    lastService: '3 days ago',
  },
  {
    id: 'DR-03',
    name: 'Drill Unit DR-03',
    type: 'Drill',
    status: 'Maintenance',
    health: 45,
    utilization: 0,
    maintenance: 'In Progress',
    location: 'Workshop',
    operator: 'Unassigned',
    fuelLevel: 30,
    hoursToday: 0,
    lastService: 'Today',
  },
  {
    id: 'BD-11',
    name: 'Bulldozer BD-11',
    type: 'Bulldozer',
    status: 'Active',
    health: 88,
    utilization: 62,
    maintenance: 'Good',
    location: 'Sector D',
    operator: 'A. Chen',
    fuelLevel: 71,
    hoursToday: 4.8,
    lastService: '7 days ago',
  },
  {
    id: 'DT-09',
    name: 'Dump Truck DT-09',
    type: 'Dump Truck',
    status: 'Active',
    health: 95,
    utilization: 90,
    maintenance: 'Good',
    location: 'Sector B',
    operator: 'M. Johnson',
    fuelLevel: 55,
    hoursToday: 7.1,
    lastService: '5 days ago',
  },
  {
    id: 'EX-22',
    name: 'Excavator EX-22',
    type: 'Excavator',
    status: 'Idle',
    health: 83,
    utilization: 0,
    maintenance: 'Good',
    location: 'Sector C',
    operator: 'Standby',
    fuelLevel: 90,
    hoursToday: 0,
    lastService: '2 days ago',
  },
];

export const productionTrendData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  values: [11200, 12400, 11800, 13100, 12847, 10500, 9200],
};

export const fuelUsageData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  values: [7800, 8200, 7950, 8600, 8423, 6800, 5900],
};

export const equipmentUtilizationData = {
  labels: ['Excavators', 'Dump Trucks', 'Drills', 'Bulldozers', 'Loaders', 'Graders'],
  values: [85, 78, 45, 62, 71, 58],
};

export const safetyIncidentData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  values: [3, 1, 2, 0, 1, 0],
};

export const efficiencyData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  values: [82, 85, 84, 87.3],
};

export const aiInsights = [
  {
    id: 1,
    type: 'fuel',
    severity: 'high',
    title: 'Abnormal Fuel Usage — Sector C',
    description: 'AI detected abnormal fuel usage patterns in Sector C. Excavator EX-14 is consuming 23% more fuel than baseline. Recommend immediate inspection of fuel injection system.',
    confidence: 94,
    timestamp: '2 hours ago',
    actionable: true,
  },
  {
    id: 2,
    type: 'maintenance',
    severity: 'medium',
    title: 'Predictive Maintenance — EX-14',
    description: 'Predicted maintenance required for Excavator EX-14 within 36 operational hours. Hydraulic pressure readings indicate potential seal degradation.',
    confidence: 87,
    timestamp: '4 hours ago',
    actionable: true,
  },
  {
    id: 3,
    type: 'congestion',
    severity: 'high',
    title: 'Haul Route Congestion Risk',
    description: 'Sector C haul route bottleneck probability at 78%. Three dump trucks converging on single-lane section. Recommend staggered dispatch schedule.',
    confidence: 91,
    timestamp: '1 hour ago',
    actionable: true,
  },
  {
    id: 4,
    type: 'bottleneck',
    severity: 'medium',
    title: 'Operational Bottleneck — Loading Zone',
    description: 'Loading Zone Alpha experiencing 15-minute average wait times. Excavator throughput below optimal. Consider reassigning Excavator EX-22 from standby.',
    confidence: 82,
    timestamp: '3 hours ago',
    actionable: true,
  },
  {
    id: 5,
    type: 'safety',
    severity: 'low',
    title: 'Safety Pattern Analysis',
    description: 'Near-miss incidents trending downward. Current safety protocols effective. No immediate action required.',
    confidence: 96,
    timestamp: '6 hours ago',
    actionable: false,
  },
  {
    id: 6,
    type: 'optimization',
    severity: 'medium',
    title: 'Route Optimization Opportunity',
    description: 'Alternative haul route via Sector D could reduce fuel consumption by 12% and transit time by 8 minutes per trip.',
    confidence: 79,
    timestamp: '5 hours ago',
    actionable: true,
  },
];

export const fuelIntelligence = {
  efficiencyScore: 76.4,
  totalConsumption: 8423,
  anomalies: 3,
  optimizationPotential: 14.2,
  trends: {
    labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
    actual: [320, 680, 1200, 1850, 2400, 2900, 3200],
    expected: [300, 650, 1100, 1700, 2200, 2700, 3100],
  },
  suspiciousLoss: [
    { location: 'Fuel Depot B', amount: '47L', time: '14:22', status: 'Investigating' },
    { location: 'Sector C Refuel Point', amount: '23L', time: '11:15', status: 'Resolved' },
  ],
};

export const safetyData = {
  complianceScore: 94.7,
  activeAlerts: 2,
  fatigueRisks: 3,
  unsafeZones: 1,
  workers: [
    { name: 'J. Wilson', role: 'Operator', shiftHours: 10.5, fatigueRisk: 'High', status: 'Alert' },
    { name: 'R. Martinez', role: 'Operator', shiftHours: 6.5, fatigueRisk: 'Low', status: 'Active' },
    { name: 'K. Thompson', role: 'Driver', shiftHours: 5.2, fatigueRisk: 'Low', status: 'Active' },
    { name: 'A. Chen', role: 'Operator', shiftHours: 8.1, fatigueRisk: 'Medium', status: 'Monitoring' },
    { name: 'M. Johnson', role: 'Driver', shiftHours: 7.1, fatigueRisk: 'Medium', status: 'Active' },
    { name: 'P. Davis', role: 'Supervisor', shiftHours: 9.3, fatigueRisk: 'Medium', status: 'Monitoring' },
  ],
  recentIncidents: [
    { id: 'INC-041', date: '2024-01-15', type: 'Near Miss', severity: 'Medium', location: 'Sector B', status: 'Resolved' },
    { id: 'INC-040', date: '2024-01-12', type: 'Minor Injury', severity: 'Low', location: 'Workshop', status: 'Closed' },
    { id: 'INC-039', date: '2024-01-08', type: 'Equipment Damage', severity: 'Medium', location: 'Sector C', status: 'Under Review' },
  ],
};

export const tacticalMapZones = [
  { id: 'sector-a', name: 'Sector A', type: 'extraction', status: 'active', density: 85, x: 15, y: 20, w: 22, h: 25 },
  { id: 'sector-b', name: 'Sector B', type: 'extraction', status: 'active', density: 72, x: 45, y: 15, w: 20, h: 22 },
  { id: 'sector-c', name: 'Sector C', type: 'extraction', status: 'congested', density: 95, x: 70, y: 25, w: 18, h: 20 },
  { id: 'sector-d', name: 'Sector D', type: 'preparation', status: 'idle', density: 20, x: 20, y: 55, w: 25, h: 22 },
  { id: 'workshop', name: 'Workshop', type: 'maintenance', status: 'active', density: 40, x: 55, y: 60, w: 15, h: 18 },
  { id: 'fuel-depot', name: 'Fuel Depot', type: 'logistics', status: 'active', density: 55, x: 78, y: 58, w: 14, h: 16 },
];

export const haulRoutes = [
  { id: 'route-alpha', name: 'Route Alpha', from: 'Sector A', to: 'Processing', status: 'active', traffic: 'normal' },
  { id: 'route-beta', name: 'Route Beta', from: 'Sector B', to: 'Processing', status: 'active', traffic: 'heavy' },
  { id: 'route-gamma', name: 'Route Gamma', from: 'Sector C', to: 'Processing', status: 'congested', traffic: 'critical' },
  { id: 'route-delta', name: 'Route Delta', from: 'Sector D', to: 'Stockpile', status: 'idle', traffic: 'none' },
];

export const operationsData = {
  shifts: [
    { id: 'DAY-A', name: 'Day Shift A', time: '06:00 - 18:00', workers: 45, status: 'Active', supervisor: 'P. Davis' },
    { id: 'DAY-B', name: 'Day Shift B', time: '06:00 - 18:00', workers: 38, status: 'Active', supervisor: 'L. Wang' },
    { id: 'NIGHT-A', name: 'Night Shift A', time: '18:00 - 06:00', workers: 32, status: 'Standby', supervisor: 'S. Kumar' },
  ],
  sectorProduction: [
    { sector: 'Sector A', target: 5000, actual: 4200, progress: 84, status: 'On Track' },
    { sector: 'Sector B', target: 4500, actual: 3850, progress: 85.6, status: 'On Track' },
    { sector: 'Sector C', target: 4000, actual: 2900, progress: 72.5, status: 'Behind' },
    { sector: 'Sector D', target: 3000, actual: 1897, progress: 63.2, status: 'Delayed' },
  ],
  blastingSchedule: [
    { id: 'BL-112', sector: 'Sector A', time: '14:00', charge: '450kg ANFO', radius: '300m', status: 'Scheduled' },
    { id: 'BL-113', sector: 'Sector C', time: '16:30', charge: '320kg ANFO', radius: '250m', status: 'Pending Approval' },
  ],
};

export const reportsData = [
  { id: 'RPT-2024-001', title: 'Daily Operations Summary', date: '2024-01-15', type: 'Operations', status: 'Generated', size: '2.4 MB' },
  { id: 'RPT-2024-002', title: 'Equipment Maintenance Log', date: '2024-01-15', type: 'Maintenance', status: 'Generated', size: '1.8 MB' },
  { id: 'RPT-2024-003', title: 'Safety Incident Report', date: '2024-01-14', type: 'Safety', status: 'Generated', size: '3.1 MB' },
  { id: 'RPT-2024-004', title: 'Fuel Consumption Analysis', date: '2024-01-14', type: 'Fuel', status: 'Generated', size: '1.5 MB' },
  { id: 'RPT-2024-005', title: 'Weekly Performance Report', date: '2024-01-12', type: 'Performance', status: 'Generated', size: '4.2 MB' },
  { id: 'RPT-2024-006', title: 'Environmental Compliance', date: '2024-01-10', type: 'Compliance', status: 'Pending Review', size: '2.9 MB' },
];
