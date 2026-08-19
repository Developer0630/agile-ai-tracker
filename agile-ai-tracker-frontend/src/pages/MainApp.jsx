import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  Sparkles, X, FolderKanban, LogOut, User,
  Globe, Columns, Calendar as CalendarIcon, AlignLeft, FileText, ClipboardList,
  Settings, Users, BarChart2, ListTodo
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

const API_BASE = 'http://localhost:5000/api';

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export default function MainApp({ projectId: initialProjectId, onBackToDashboard }) {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [projectId, setProjectId] = useState(initialProjectId || '');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');
  const [activityFilter, setActivityFilter] = useState('All');
  const [activities, setActivities] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [members, setMembers] = useState([]);

  // State Modal AI Daily
  const [showAiModal, setShowAiModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // State Modal Task
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

  // Tính toán quyền của người dùng hiện tại trong dự án
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
        // 1. Lấy danh sách dự án mà user có quyền truy cập
        const resProjects = await axios.get(`${API_BASE}/projects`, getAuthConfig());
        const projectList = resProjects.data.data || resProjects.data || [];

        if (isMounted && projectList.length > 0) {
          // Ưu tiên projectId truyền vào từ dashboard, nếu không có lấy dự án đầu tiên
          const activeProj = projectList.find(p => (p._id || p.id) === initialProjectId) || projectList[0];
          const activeId = activeProj._id || activeProj.id;
          
          setProject(activeProj);
          setProjectId(activeId);

          // 2. Lấy danh sách thành viên & tasks
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

  return (
    <div className="flex h-screen w-full bg-[#090D16] text-slate-100 font-sans antialiased overflow-hidden m-0 p-0">
      {/* SIDEBAR */}
      <aside className="w-60 bg-[#0F172A] border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-full">
        <div className="p-4 space-y-5">
          <div className="flex items-center gap-3 px-1 cursor-pointer" onClick={onBackToDashboard}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shrink-0">
              <FolderKanban className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent truncate">FJra Workspace</h1>
              <p className="text-[10px] text-slate-400 font-medium truncate">{project?.name || 'Agile Project'}</p>
            </div>
          </div>

          {/* Menu Quản lý chung */}
          <div className="space-y-1">
            <p className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Quản lý dự án</p>

            <button
              onClick={() => setActiveTab('members')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                activeTab === 'members' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="truncate">Thành viên & Quyền</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                activeTab === 'reports' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-4 h-4 shrink-0" />
              <span className="truncate">Báo cáo & Thống kê</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                activeTab === 'settings' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="truncate">Cài đặt chung</span>
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <button onClick={() => setShowAiModal(true)} className="w-full flex items-center justify-between p-2.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 cursor-pointer">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span className="truncate">Daily AI Assistant</span>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-1" />
          </button>

          <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <div className="flex items-center gap-2 min-w-0 pr-1">
              <div className="p-1 bg-slate-800 rounded-full text-slate-300">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="text-xs font-medium text-slate-200 block truncate">{user?.name || user?.email}</span>
                <span className="text-[10px] text-indigo-400 font-mono block uppercase">{currentUserRole}</span>
              </div>
            </div>
            <button onClick={logout} title="Đăng xuất" className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded cursor-pointer">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#090D16]">
        {/* Header & Tabs */}
        <div className="bg-[#0F172A]/40 backdrop-blur-sm border-b border-slate-800/80 flex flex-col shrink-0">
          <header className="h-14 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                {project?.key || 'FJ'}
              </div>
              <h2 className="text-sm font-bold text-slate-200">{project?.name || 'Dự án hiện tại'}</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-md border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Role của bạn: <strong className="text-indigo-300 font-semibold">{currentUserRole}</strong></span>
            </div>
          </header>

          {/* Jira Tabs */}
          <div className="flex items-center gap-1 px-4 overflow-x-auto custom-scrollbar">
            {[
              { id: 'summary', icon: Globe, label: 'Summary' },
              { id: 'backlog', icon: ListTodo, label: 'Backlog' },
              { id: 'board', icon: Columns, label: 'Board' },
              { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
              { id: 'timeline', icon: AlignLeft, label: 'Timeline' },
              { id: 'docs', icon: FileText, label: 'Docs' },
              { id: 'forms', icon: ClipboardList, label: 'Forms' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold cursor-pointer transition-all border-b-2 ${
                    isActive ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-t-lg'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Workspace Views */}
        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          <AIChatBar projectId={projectId} onTaskCreated={() => refreshTasks(projectId)} />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Đang đồng bộ dữ liệu...</span>
            </div>
          ) : activeTab === 'board' ? (
            <ActiveSprintKanban
              projectId={projectId}
              onTaskUpdate={() => refreshTasks(projectId)}
              onOpenCreateModal={handleOpenCreateModal}
            />
          ) : activeTab === 'backlog' ? (
            <BacklogView
              projectId={projectId}
              onTaskUpdate={() => refreshTasks(projectId)}
            />
          ) : activeTab === 'calendar' ? (
            <CalendarView
              tasks={tasks}
              onOpenTaskModal={handleOpenCreateModal}
            />
          ) : activeTab === 'timeline' ? (
            <TimelineView
              tasks={tasks}
              onOpenTaskModal={handleOpenCreateModal}
            />
          ) : activeTab === 'forms' ? (
            <FormsView
              projectId={projectId}
              onTaskUpdate={() => refreshTasks(projectId)}
            />
          ) : activeTab === 'summary' ? (
            <ProjectSummary tasks={tasks} project={project} />
          ) : activeTab === 'docs' ? (
            <DocsView projectId={projectId} />
          ) : activeTab === 'members' ? (
            <MembersView 
              projectId={projectId} 
              currentUserRole={currentUserRole} 
            />
          ) : activeTab === 'reports' ? (
            <ReportsView projectId={projectId} />
          ) : activeTab === 'settings' ? (
            <SettingsView projectId={projectId} />
          ) : null}
        </main>
      </div>

      {/* Modal Task Detail */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex justify-end z-50 animate-fadeIn">
          <div className="bg-[#0B132B] border-l border-slate-800/80 w-full max-w-4xl h-full p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span className="text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {project?.key || 'TASK'}
                </span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-200 font-medium truncate max-w-xs">{editingTask ? editingTask.title : 'Task mới'}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 p-2 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="flex-1 flex gap-6 pt-5 overflow-hidden">
              <div className="flex-1 space-y-5 overflow-y-auto pr-3 custom-scrollbar">
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full bg-transparent text-base font-bold text-slate-100 placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-indigo-500 pb-2 transition-all"
                  placeholder="Tên công việc..."
                />
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    rows={5}
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="w-full bg-slate-900/90 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="Thêm mô tả chi tiết cho công việc này..."
                  />
                </div>

                {editingTask && (
                  <TaskSubtaskSection
                    task={editingTask}
                    onTaskUpdated={(updatedTask) => setEditingTask(updatedTask)}
                  />
                )}

                <div className="pt-6 border-t border-slate-800/80 space-y-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Activity</h3>
                  <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80 w-fit">
                    {['All', 'Comments', 'History'].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActivityFilter(tab)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                          activityFilter === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-4 items-center">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendComment(editingTask._id || editingTask.id)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Gửi
                    </button>
                  </div>

                  <div className="space-y-3 pt-2">
                    {activities.map((act) => (
                      <div key={act._id || act.id} className="flex gap-3 items-start">
                        <div className="text-xs text-slate-300">
                          <span className="font-bold text-slate-200">{act.userId?.name || 'Thành viên'}</span> {act.action} <span className="text-indigo-300">{act.content}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-80 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shrink-0">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3">Details</h3>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Assignee</label>
                    <select
                      value={taskForm.assigneeId}
                      onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                    >
                      <option value="">-- Chưa phân công --</option>
                      {members.map(m => (
                        <option key={m._id || m.user?._id} value={m.user?._id || m._id}>
                          {m.user?.name || m.user?.email || m.name || m.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Status</label>
                    <select
                      value={taskForm.status}
                      onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                    >
                      <option value="TODO">CẦN LÀM</option>
                      <option value="IN_PROGRESS">ĐANG LÀM</option>
                      <option value="DONE">HOÀN THÀNH</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Due Date</label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Daily AI */}
      {showAiModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h2 className="text-xs font-bold text-slate-100">Báo cáo Daily với AI Gemini</h2>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            {!aiResult ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">Nhập tiến độ tự do, AI sẽ tự động phân loại công việc và cập nhật thẻ Kanban.</p>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Hôm nay tôi đã làm..."
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSubmitDaily}
                  disabled={aiAnalyzing}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold text-xs text-white disabled:opacity-50"
                >
                  {aiAnalyzing ? 'AI đang xử lý...' : 'Phân tích & Cập nhật'}
                </button>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-900 p-4 rounded-lg border border-slate-700 text-xs">
                <h3 className="font-semibold text-emerald-400">✅ Kết quả AI phân tích:</h3>
                <div>
                  <strong className="text-slate-300 block mb-1">Đã làm:</strong>
                  <ul className="list-disc pl-4 text-slate-400">{aiResult.yesterdayDone?.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
                <button onClick={() => { setAiResult(null); setShowAiModal(false); }} className="w-full py-2 bg-slate-800 rounded-lg text-slate-300 font-medium mt-2">
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}