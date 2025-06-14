import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Download, 
  Calendar,
  Users,
  Clock,
  Loader2
} from 'lucide-react';
import axios from 'axios';

const REPORT_TYPES = [
  {
    id: 'attendance',
    name: 'Attendance Report',
    description: 'Daily check-in/out records with duration',
    icon: Calendar,
  },
  {
    id: 'members',
    name: 'Members Report',
    description: 'Complete member list with details',
    icon: Users,
  },
  {
    id: 'duration',
    name: 'Duration Analysis',
    description: 'Average stay duration by member',
    icon: Clock,
  }
];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateReport = async () => {
    if (!selectedReport || !dateRange.start || !dateRange.end) {
      setError('Please select report type and date range');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end,
        format: 'csv'
      });

      const response = await axios.get(
        `http://localhost:5000/api/attendance/export?${params}`,
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedReport.id}_report_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-600">
          Generate and download detailed reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Select Report Type</h3>
              <p className="mt-1 text-sm text-gray-600">
                Choose the type of report you want to generate
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {REPORT_TYPES.map((report) => (
                <div
                  key={report.id}
                  className={`p-6 hover:bg-gray-50 cursor-pointer ${
                    selectedReport?.id === report.id ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${
                      selectedReport?.id === report.id ? 'bg-indigo-100' : 'bg-gray-100'
                    }`}>
                      <report.icon size={24} className={
                        selectedReport?.id === report.id ? 'text-indigo-600' : 'text-gray-600'
                      } />
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-gray-900">{report.name}</h4>
                      <p className="mt-1 text-sm text-gray-600">{report.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Report Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Report Options</h3>
              <p className="mt-1 text-sm text-gray-600">
                Configure your report parameters
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGenerateReport}
                  disabled={loading || !selectedReport}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="-ml-1 mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-sm font-medium text-gray-900">Quick Tips</h4>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <FileSpreadsheet className="h-5 w-5 text-gray-400 mr-2" />
                Reports are generated in CSV format
              </li>
              <li className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                Maximum date range is 3 months
              </li>
              <li className="flex items-start">
                <Download className="h-5 w-5 text-gray-400 mr-2" />
                Downloads start automatically
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 