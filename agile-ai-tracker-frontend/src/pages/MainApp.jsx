import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  X, FolderKanban, LogOut, Globe, Columns, Calendar as CalendarIcon,
  AlignLeft, FileText, ClipboardList, Settings, Users, BarChart2, ListTodo,
  Menu, ChevronLeft, SunMedium, MoonStar, MonitorSmartphone
} from 'lucide-react';
import BacklogView from '../components/BacklogView';
import ActiveSprintKanban from '../components/ActiveSprintKanban';
import { useAuth } from '../context/AuthContext';
import ProjectSummary from '../components/ProjectSummary';
import CalendarView from '../components/CalendarView';
import DocsView from '../components/DocsView';
import TimelineView from '../components/TimelineView';
import FormsView from '../components/FormsView';
import MembersView from '../components/MembersView';
import ReportsView from '../components/ReportsView';
import SettingsView from '../components/SettingsView';
import AIChatBar from '../components/AIChatBar';
import TaskSubtaskSection from '../components/TaskSubtaskSection';
import { Button, Select, Textarea, Input, LoadingState, Avatar, SegmentGroup, SidebarNavButton,  } from '../components/ui';

const API_BASE = 'http://localhost:5000/api';

const getAuthConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const PROJECT_TABS = [
  { id: 'summary', icon: Globe, label: 'Summary' },
  { id: 'backlog', icon: ListTodo, label: 'Backlog' },
  { id: 'board', icon: Columns, label: 'Board' },
  { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
  { id: 'timeline', icon: AlignLeft, label: 'Timeline' },
  { id: 'docs', icon: FileText, label: 'Docs' },
  { id: 'forms', icon: ClipboardList, label: 'Forms' },
];

export default function MainApp({
  projectId: initialProjectId,
  onBackToDashboard,
  theme = 'system',
  setTheme = () => { },
  density = 'standard',
  setDensity = () => { }
}) {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [projectId, setProjectId] = useState(initialProjectId || '');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activityFilter, setActivityFilter] = useState('All');
  const [activities, setActivities] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [members, setMembers] = useState([]);

  const [showAiModal, setShowAiModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    assigneeId: '',
    dueDate: ''
  });

  const currentUserRole = useMemo(() => {
    if (!project || !user) return 'VIEWER';
    const userId = user._id || user.id;
    const ownerId = typeof project.owner === 'object' ? project.owner?._id : project.owner;
    if (ownerId && ownerId.toString() === userId.toString()) return 'OWNER';
    const memberObj = project.members?.find(m => {
      const mUserId = typeof m.user === 'object' ? m.user?._id : m.user;
      return mUserId && mUserId.toString() === userId.toString();
    });
    return memberObj?.role || 'VIEWER';
  }, [project, user]);

  const fetchActivities = async (taskId) => {
    try {
      const res = await axios.get(`${API_BASE}/activities/${taskId}`, getAuthConfig());
      setActivities(res.data.data || []);
    } catch (err) {
      console.error('Lỗi tải activity:', err);
    }
  };

  const refreshTasks = useCallback(async (currId = projectId) => {
    if (!currId) return;
    try {
      const resTasks = await axios.get(`${API_BASE}/tasks/project/${currId}`, getAuthConfig());
      const taskList = resTasks.data.data || resTasks.data;
      setTasks(Array.isArray(taskList) ? taskList : []);
    } catch (error) {
      console.error('Lỗi reload tasks:', error);
    }
  }, [projectId]);

  useEffect(() => {
    let isMounted = true;
    const loadProjectData = async () => {
      try {
        setLoading(true);
        const resProjects = await axios.get(`${API_BASE}/projects`, getAuthConfig());
        const projectList = resProjects.data.data || resProjects.data || [];
        if (isMounted && projectList.length > 0) {
          const activeProj = projectList.find(p => (p._id || p.id) === initialProjectId) || projectList[0];
          const activeId = activeProj._id || activeProj.id;
          setProject(activeProj);
          setProjectId(activeId);
          const [resMembers, resTasks] = await Promise.all([
            axios.get(`${API_BASE}/projects/${activeId}/members`, getAuthConfig()),
            axios.get(`${API_BASE}/tasks/project/${activeId}`, getAuthConfig())
          ]);
          if (isMounted) {
            setMembers(resMembers.data.data || []);
            const taskList = resTasks.data.data || resTasks.data;
            setTasks(Array.isArray(taskList) ? taskList : []);
          }
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu workspace:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadProjectData();
    return () => { isMounted = false; };
  }, [initialProjectId]);

  const handleOpenCreateModal = (taskToEdit = null) => {
    if (taskToEdit) {
      setEditingTask(taskToEdit);
      setTaskForm({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        priority: taskToEdit.priority || 'MEDIUM',
        status: taskToEdit.status || 'TODO',
        assigneeId: taskToEdit.assigneeId?._id || taskToEdit.assigneeId || '',
        dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : ''
      });
      const tId = taskToEdit._id || taskToEdit.id;
      if (tId) fetchActivities(tId);
    } else {
      setEditingTask(null);
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', assigneeId: '', dueDate: '' });
    }
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    try {
      if (editingTask) {
        const taskId = editingTask._id || editingTask.id;
        const res = await axios.put(`${API_BASE}/tasks/${taskId}`, taskForm, getAuthConfig());
        if (res.data.success) {
          setTasks(tasks.map(t => ((t._id || t.id) === taskId ? res.data.data : t)));
        }
      } else {
        const res = await axios.post(`${API_BASE}/tasks`, { ...taskForm, projectId }, getAuthConfig());
        if (res.data.success) {
          setTasks([...tasks, res.data.data]);
        }
      }
      setShowTaskModal(false);
      setEditingTask(null);
      await refreshTasks(projectId);
    } catch (error) {
      alert(`Lỗi: ${error.response?.data?.message || 'Không thể cập nhật Task!'}`);
    }
  };
  
  const handleSendComment = async (taskId) => {
    if (!newComment.trim()) return;
    try {
      await axios.post(`${API_BASE}/tasks/${taskId}/comment`, { content: newComment }, getAuthConfig());
      setNewComment('');
      fetchActivities(taskId);
    } catch {
      alert('Không thể gửi bình luận!');
    }
  };

  const handleSubmitDaily = async () => {
    if (!reportText.trim()) return;
    try {
      setAiAnalyzing(true);
      const res = await axios.post(`${API_BASE}/daily`, {
        projectId,
        userId: user?._id || user?.id,
        rawContent: reportText
      }, getAuthConfig());
      setAiResult(res.data.data.aiAnalysis);
      await refreshTasks();
    } catch {
      alert('Lỗi khi phân tích báo cáo AI!');
    } finally {
      setAiAnalyzing(false);
    }
  };
   const densityOptions = [
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'standard', label: 'Standard' },
    { value: 'compact', label: 'Compact' }
  ];

  const themeOptions = [
    { value: 'system', label: 'System', icon: MonitorSmartphone },
    { value: 'light', label: 'Light', icon: SunMedium },
    { value: 'dark', label: 'Dark', icon: MoonStar }
  ];
  const navButtonClass = (isActive) =>
    `w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-[3px] cursor-pointer transition-colors ${isActive
      ? 'bg-[#DEEBFF] text-[#0052CC] font-medium'
      : 'text-[#44546F] hover:bg-[#F4F5F7]'
    }`;

  const tabButtonClass = (isActive) =>
    `flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap border-b-2 cursor-pointer transition-colors ${isActive
      ? 'border-[#0052CC] text-[#0052CC] font-medium'
      : 'border-transparent text-[#626F86] hover:text-[#172B4D] hover:border-[#DFE1E6]'
    }`;

  
  const renderContent = () => {
    if (loading) return <LoadingState message="Loading workspace..." />;
    if (activeTab === 'board') {
      return (
        <ActiveSprintKanban
          projectId={projectId}
          onTaskUpdate={() => refreshTasks(projectId)}
          onOpenCreateModal={handleOpenCreateModal}
        />
      );
    }
    if (activeTab === 'backlog') {
      return (
        <BacklogView
          projectId={projectId}
          onTaskUpdate={() => refreshTasks(projectId)}
          onOpenCreateModal={handleOpenCreateModal}
        />
      );
    }
    if (activeTab === 'calendar') return <CalendarView tasks={tasks} onOpenTaskModal={handleOpenCreateModal} />;
    if (activeTab === 'timeline') return <TimelineView tasks={tasks} onOpenTaskModal={handleOpenCreateModal} />;
    if (activeTab === 'forms') return <FormsView projectId={projectId} onTaskUpdate={() => refreshTasks(projectId)} />;
    if (activeTab === 'summary') return <ProjectSummary tasks={tasks} project={project} />;
    if (activeTab === 'docs') return <DocsView projectId={projectId} />;
    if (activeTab === 'members') return <MembersView projectId={projectId} currentUserRole={currentUserRole} />;
    if (activeTab === 'reports') return <ReportsView projectId={projectId} />;
    if (activeTab === 'settings') return <SettingsView projectId={projectId} />;
    return null;
  };
 

  return (
    <div className="flex h-screen w-full bg-[#FAFBFC] overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-[#091E42]/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-56 bg-white border-r border-[#DFE1E6] flex flex-col shrink-0 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-3 border-b border-[#DFE1E6]">
          <button type="button" onClick={onBackToDashboard} className="flex items-center gap-2 w-full text-left hover:bg-[#F4F5F7] rounded-[3px] p-1.5 cursor-pointer">
            <div className="w-7 h-7 rounded-[3px] bg-[#0052CC] flex items-center justify-center shrink-0">
              <FolderKanban className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#172B4D] truncate">FJra</p>
              <p className="text-xs text-[#626F86] truncate">{project?.name || 'Project'}</p>
            </div>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-4">

          <div>
            <p className="px-3 py-1 text-[11px] font-semibold text-[#626F86] uppercase">Administration</p>
            <SidebarNavButton
              icon={Users}
              label="Thành viên & Quyền"
              isActive={activeTab === 'members'}
              onClick={() => setActiveTab('members')}
            />
            <SidebarNavButton
              icon={BarChart2}
              label="Báo cáo & Thống kê"
              isActive={activeTab === 'reports'}
              onClick={() => setActiveTab('reports')}
            />
            <SidebarNavButton
              icon={Settings}
              label="Cài đặt chung"
              isActive={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
            />
          </div>
        </nav>

        <div className="p-2 border-t border-[#DFE1E6] space-y-1">
          <button type="button" onClick={() => setShowAiModal(true)} className={navButtonClass(false)}>
            Daily report
          </button>
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar name={user?.name || user?.email} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#172B4D] truncate">{user?.name || user?.email}</p>
                <p className="text-[10px] text-[#626F86]">{currentUserRole}</p>
              </div>
            </div>
            <button type="button" onClick={logout} aria-label="Sign out" className="p-1 text-[#626F86] hover:text-[#DE350B] hover:bg-[#FFEBE6] rounded-[3px] cursor-pointer">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-[#DFE1E6] shrink-0">
          <div className="h-11 px-3 sm:px-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button type="button" className="lg:hidden p-1 text-[#626F86] hover:bg-[#F4F5F7] rounded-[3px] cursor-pointer" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                <Menu className="w-4 h-4" />
              </button>
              <button type="button" onClick={onBackToDashboard} className="hidden sm:flex items-center gap-1 text-xs text-[#626F86] hover:text-[#172B4D] cursor-pointer">
                <ChevronLeft className="w-3.5 h-3.5" /> Projects
              </button>
              <span className="text-[#DFE1E6] hidden sm:inline">/</span>
              <span className="text-sm font-medium text-[#172B4D] truncate">{project?.name || 'Project'}</span>
              {project?.key && (
                <span className="hidden sm:inline text-xs font-mono text-[#626F86] bg-[#F4F5F7] px-1.5 py-0.5 rounded-[3px]">{project.key}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#626F86] hidden md:inline">Role: <strong className="text-[#172B4D]">{currentUserRole}</strong></span>
              <Button variant="primary" size="sm" onClick={() => handleOpenCreateModal()}>Create</Button>
              <SegmentGroup
  ariaLabel="Choose color theme"
  value={theme}
  onChange={(val) => typeof val === 'string' && setTheme(val)}
  options={themeOptions.map((option) => ({ value: option.value, label: option.label, icon: option.icon }))}
  className="fjra-segment-group--header"
/>

<SegmentGroup
  ariaLabel="Choose workspace density"
  value={density}
  onChange={(val) => typeof val === 'string' && setDensity(val)}
  options={densityOptions}
  className="fjra-segment-group--header"
/>
            </div>
          </div>
          <div className="flex items-center gap-0 px-2 overflow-x-auto custom-scrollbar border-t border-[#DFE1E6]">
            {PROJECT_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={tabButtonClass(activeTab === tab.id)}>
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-5">
          <AIChatBar projectId={projectId} onTaskCreated={() => refreshTasks(projectId)} />
          {renderContent()}
        </main>
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 bg-[#091E42]/50 z-50 flex justify-end">
          <div className="bg-white border-l border-[#DFE1E6] w-full max-w-3xl h-full flex flex-col shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#DFE1E6] shrink-0">
              <div className="flex items-center gap-2 text-xs text-[#626F86]">
                <span className="font-mono text-[#0052CC] bg-[#DEEBFF] px-1.5 py-0.5 rounded-[3px]">{project?.key || 'TASK'}</span>
                <span>/</span>
                <span className="text-[#172B4D] font-medium truncate max-w-xs">{editingTask ? editingTask.title : 'New task'}</span>
              </div>
              <button type="button" onClick={() => setShowTaskModal(false)} aria-label="Close" className="p-1 text-[#626F86] hover:bg-[#F4F5F7] rounded-[3px] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <Input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Task title"
                  className="text-base font-medium border-0 border-b border-[#DFE1E6] rounded-none px-0 focus:ring-0"
                />
                <Textarea
                  label="Description"
                  rows={5}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Add a description..."
                />
                {editingTask && (
                  <TaskSubtaskSection task={editingTask} onTaskUpdated={(updatedTask) => setEditingTask(updatedTask)} />
                )}
                {editingTask && (
                  <div className="pt-4 border-t border-[#DFE1E6] space-y-3">
                    <h3 className="text-sm font-medium text-[#172B4D]">Activity</h3>
                    <div className="flex items-center gap-1">
                      {['All', 'Comments', 'History'].map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActivityFilter(tab)}
                          className={`px-2 py-1 text-xs rounded-[3px] cursor-pointer ${activityFilter === tab ? 'bg-[#DEEBFF] text-[#0052CC]' : 'text-[#626F86] hover:bg-[#F4F5F7]'
                            }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1"
                      />
                      <Button type="button" variant="secondary" size="sm" onClick={() => handleSendComment(editingTask._id || editingTask.id)}>
                        Send
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {activities.map((act) => (
                        <div key={act._id || act.id} className="text-xs text-[#626F86]">
                          <span className="font-medium text-[#172B4D]">{act.userId?.name || 'Member'}</span> {act.action}{' '}
                          <span className="text-[#0052CC]">{act.content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-[#DFE1E6] bg-[#FAFBFC] p-4 space-y-3 shrink-0">
                <h3 className="text-xs font-semibold text-[#44546F] uppercase">Details</h3>
                <Select label="Assignee" value={taskForm.assigneeId} onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m._id || m.user?._id} value={m.user?._id || m._id}>
                      {m.user?.name || m.user?.email || m.name || m.email}
                    </option>
                  ))}
                </Select>
                <Select label="Status" value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </Select>
                <Select label="Priority" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </Select>
                <Input label="Due date" type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={() => setShowTaskModal(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="sm" className="flex-1">Save</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAiModal && (
        <div className="fixed inset-0 bg-[#091E42]/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFE1E6] rounded-[3px] w-full max-w-md shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#DFE1E6]">
              <h2 className="text-sm font-semibold text-[#172B4D]">Daily report</h2>
              <button type="button" onClick={() => setShowAiModal(false)} aria-label="Close" className="p-1 text-[#626F86] hover:bg-[#F4F5F7] rounded-[3px] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {!aiResult ? (
                <>
                  <p className="text-xs text-[#626F86]">Enter your daily progress. AI will categorize and update tasks.</p>
                  <Textarea rows={4} value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="Today I completed..." />
                  <Button variant="primary" size="sm" className="w-full" onClick={handleSubmitDaily} disabled={aiAnalyzing}>
                    {aiAnalyzing ? 'Processing...' : 'Analyze & update'}
                  </Button>
                </>
              ) : (
                <div className="space-y-3 text-xs">
                  <p className="font-medium text-[#006644]">Analysis complete</p>
                  {aiResult.yesterdayDone?.length > 0 && (
                    <div>
                      <strong className="text-[#172B4D]">Done:</strong>
                      <ul className="list-disc pl-4 text-[#626F86] mt-1">{aiResult.yesterdayDone.map((item, i) => <li key={i}>{item}</li>)}</ul>
                    </div>
                  )}
                  {aiResult.todayPlan?.length > 0 && (
                    <div>
                      <strong className="text-[#172B4D]">Plan:</strong>
                      <ul className="list-disc pl-4 text-[#626F86] mt-1">{aiResult.todayPlan.map((item, i) => <li key={i}>{item}</li>)}</ul>
                    </div>
                  )}
                  <Button variant="secondary" size="sm" className="w-full" onClick={() => { setAiResult(null); setShowAiModal(false); }}>Close</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
