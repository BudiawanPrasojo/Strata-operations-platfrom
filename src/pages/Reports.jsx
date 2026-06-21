import { FileText, Download, Calendar, Search, Eye, Clock, File } from 'lucide-react';
import { useState } from 'react';
import Card from '../components/common/Card';
import { reportsData, kpiData, equipmentData } from '../data/mockData';
import { exportToCSV } from '../utils/exportCSV';

const typeColors = {
  Operations: 'text-industrial-400 bg-industrial-500/10',
  Maintenance: 'text-amber-400 bg-amber-400/10',
  Safety: 'text-danger bg-danger/10',
  Fuel: 'text-info bg-info/10',
  Performance: 'text-success bg-success/10',
  Compliance: 'text-steel-400 bg-steel-400/10',
};

function generateOperationsCSV() {
  const data = reportsData.map((r) => ({
    'Report ID': r.id,
    'Title': r.title,
    'Type': r.type,
    'Date': r.date,
    'Status': r.status,
    'Size': r.size,
  }));
  exportToCSV(data, 'strata-operations-report');
}

function generateKPICSV() {
  const data = kpiData.map((k) => ({
    'KPI': k.title,
    'Value': k.value,
    'Unit': k.unit,
    'Change (%)': k.change,
  }));
  exportToCSV(data, 'strata-kpi-report');
}

function generateEquipmentCSV() {
  const data = (equipmentData || []).map((u) => ({
    'Unit ID': u.id,
    'Name': u.name,
    'Type': u.type,
    'Status': u.status,
    'Health (%)': u.health,
    'Fuel (%)': u.fuelLevel,
    'Location': u.location,
    'Operator': u.operator,
  }));
  exportToCSV(data, 'strata-equipment-report');
}

export default function Reports() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [generating, setGenerating] = useState(false);

  const filtered = reportsData.filter((r) => {
    if (filterType !== 'all' && r.type.toLowerCase() !== filterType.toLowerCase()) return false;
    if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const types = ['all', ...new Set(reportsData.map((r) => r.type))];

  const handleGenerateReport = () => {
    setGenerating(true);
    // Export the currently filtered view, or all operations report as default
    generateOperationsCSV();
    setTimeout(() => setGenerating(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gradient">Reporting Center</h1>
          <p className="text-sm text-graphite-400 mt-1">Generate, view, and export operational reports</p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-industrial-500 text-white text-sm font-medium hover:bg-industrial-400 transition-colors disabled:opacity-60"
        >
          <FileText size={16} />
          {generating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: reportsData.length, icon: File },
          { label: 'This Week', value: 4, icon: Calendar },
          { label: 'Pending Review', value: 1, icon: Eye },
          { label: 'Total Size', value: '15.9 MB', icon: Download },
        ].map((s) => (
          <Card key={s.label} hover>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-graphite-700/50">
                <s.icon size={16} className="text-graphite-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-graphite-100">{s.value}</p>
                <p className="text-xs text-graphite-400">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-graphite-800/60 rounded-lg px-3 py-2 border border-graphite-700/40 flex-1 max-w-md">
          <Search size={16} className="text-graphite-500" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-graphite-200 placeholder-graphite-500 outline-none w-full"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                filterType === t
                  ? 'bg-industrial-500/20 text-industrial-400 border border-industrial-500/30'
                  : 'bg-graphite-800/40 text-graphite-400 border border-graphite-700/30 hover:text-graphite-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-graphite-700/50">
                <th className="text-left py-3 px-4 text-xs font-medium text-graphite-500 uppercase tracking-wider">Report</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-graphite-500 uppercase tracking-wider">Type</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-graphite-500 uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-graphite-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-graphite-500 uppercase tracking-wider">Size</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-graphite-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((report) => (
                <tr key={report.id} className="border-b border-graphite-800/30 hover:bg-graphite-800/20 transition-colors group">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-graphite-700/50">
                        <FileText size={14} className="text-graphite-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-graphite-200">{report.title}</p>
                        <p className="text-[10px] text-graphite-500 font-mono">{report.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${typeColors[report.type]}`}>
                      {report.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-graphite-400">
                      <Clock size={12} />
                      {report.date}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium ${
                      report.status === 'Generated' ? 'text-success' : 'text-warning'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-graphite-400 font-mono">{report.size}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg hover:bg-graphite-700/40 text-graphite-400 hover:text-graphite-200 transition-colors">
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => exportToCSV([report], `${report.id}`)}
                        className="p-1.5 rounded-lg hover:bg-graphite-700/40 text-graphite-400 hover:text-graphite-200 transition-colors"
                        title="Download as CSV"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Export Panels */}
      <div>
        <h2 className="text-sm font-semibold text-graphite-300 mb-3">Quick Export</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Operations Report', desc: 'All report records as CSV', fn: generateOperationsCSV, type: 'Operations' },
            { title: 'KPI Summary', desc: 'Key performance indicators', fn: generateKPICSV, type: 'Performance' },
            { title: 'Equipment Status', desc: 'Fleet health & fuel data', fn: generateEquipmentCSV, type: 'Maintenance' },
          ].map((tmpl) => (
            <Card key={tmpl.title} hover className="cursor-pointer" onClick={tmpl.fn}>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-graphite-700/50 flex-shrink-0">
                  <Download size={16} className="text-industrial-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-graphite-200">{tmpl.title}</h3>
                  <p className="text-[10px] text-graphite-400 mt-0.5">{tmpl.desc}</p>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-medium mt-2 ${typeColors[tmpl.type]}`}>
                    {tmpl.type} · CSV
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
