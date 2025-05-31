import React, { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle, AlertTriangle, FolderKanban, CheckSquare } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

// Mock data
const projectData = [
  { name: 'Website Redesign', progress: 75, priority: 'high', dueDate: '2025-07-15' },
  { name: 'Mobile App Development', progress: 45, priority: 'medium', dueDate: '2025-08-30' },
  { name: 'Marketing Campaign', progress: 90, priority: 'high', dueDate: '2025-06-25' },
  { name: 'Database Migration', progress: 30, priority: 'low', dueDate: '2025-09-10' },
];

const taskStatusData = [
  { name: 'Completed', value: 58, color: '#10B981' },
  { name: 'In Progress', value: 27, color: '#3B82F6' },
  { name: 'Not Started', value: 15, color: '#6B7280' },
];

const activityData = [
  { day: 'Mon', tasks: 5 },
  { day: 'Tue', tasks: 8 },
  { day: 'Wed', tasks: 12 },
  { day: 'Thu', tasks: 7 },
  { day: 'Fri', tasks: 10 },
  { day: 'Sat', tasks: 4 },
  { day: 'Sun', tasks: 2 },
];

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Trigger chart animations after loading
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowCharts(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="loading-animation">
          <div className="circle bg-blue-500"></div>
          <div className="circle bg-purple-500 delay-150"></div>
          <div className="circle bg-pink-500 delay-300"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Welcome back to your TaskFlow dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">12</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <FolderKanban className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center">
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                </svg>
                25%
              </span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">vs last month</span>
            </span>
          </div>
        </div>

        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">134</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <CheckSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center">
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                </svg>
                12%
              </span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">vs last month</span>
            </span>
          </div>
        </div>

        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Hours Logged</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">87.5</p>
            </div>
            <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-full">
              <Clock className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center">
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
                8%
              </span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">vs last month</span>
            </span>
          </div>
        </div>

        <div className="dashboard-card bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Tasks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">58</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center">
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                </svg>
                17%
              </span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">vs last month</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Activity Overview</h2>
          </div>
          <div className="p-5 h-80">
            {showCharts && (
              <ResponsiveContainer width="100%\" height="100%">
                <BarChart data={activityData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar 
                    dataKey="tasks" 
                    fill="#3B82F6" 
                    radius={[4, 4, 0, 0]} 
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Task Status</h2>
          </div>
          <div className="p-5 h-80">
            {showCharts && (
              <ResponsiveContainer width="100%\" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            <div className="mt-4 space-y-2">
              {taskStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Project Status</h2>
        </div>
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {projectData.map((project, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                        <div 
                          className="h-2.5 rounded-full progress-bar" 
                          style={{ width: `${project.progress}%`, backgroundColor: getProgressColor(project.progress) }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{project.progress}% Complete</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 py-1 text-xs rounded-full ${getPriorityClass(project.priority)}`}
                      >
                        {project.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(project.dueDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="p-5">
          <div className="flow-root">
            <ul className="-mb-8">
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                        <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Task Completed</div>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">John Doe completed "Update user documentation"</p>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                        <FolderKanban className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">New Project</div>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Jane Smith created a new project "Marketing Campaign Q3"</p>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>Yesterday at 2:34 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Deadline Approaching</div>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Deadline for "Website Redesign" is in 3 days</p>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>2 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative">
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                        <Activity className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Project Update</div>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Alex Johnson updated "Mobile App Development" to 45% complete</p>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>3 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function getProgressColor(progress: number) {
  if (progress < 30) return '#EF4444'; // red
  if (progress < 70) return '#F59E0B'; // amber
  return '#10B981'; // green
}

function getPriorityClass(priority: string) {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    default:
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export default Dashboard;