import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Sparkles, X, LayoutDashboard, ListTodo,
  ShieldAlert, CheckCircle, FolderKanban, PlayCircle, LogOut, User,
  Globe, Columns, Calendar as CalendarIcon, AlignLeft, FileText, ClipboardList,
  Settings, Users, BarChart2
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

// --- MAIN WORKSPACE APP ---
export default function MainApp(
  {
    projectId: initialProjectId
  }) {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projectId, setProjectId] = useState(initialProjectId || '');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Board');
  const [activityFilter, setActivityFilter] = useState('All');
  const [activities, setActivities] = useState([]);
  const [newComment, setNewComment] = useState('');
  const fetchActivities = async (taskId) => {
    const res = await axios.get(`${API_BASE}/activities/${taskId}`);
    setActivities(res.data.data);
  };
  // State Modal AI Daily
  const [showAiModal, setShowAiModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [members, setMembers] = useState([]);
  // State Modal Task
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    assigneeName: '',
    dueDate: ''
  });

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const resProjects = await axios.get(`${API_BASE}/projects`);
        console.log('Dữ liệu dự án:', resProjects.data);
        const projectList = resProjects.data.data || resProjects.data;
        console.log('Danh sách dự án:', projectList);

        if (isMounted && Array.isArray(projectList) && projectList.length > 0) {

          const pId = projectList[0]._id || projectList[0].id;
          setProjectId(pId);

          // Gọi lấy members SAU KHI đã có pId
          const resMembers = await axios.get(`${API_BASE}/projects/${pId}/members`);
          setMembers(resMembers.data.data || []);
          const resTasks = await axios.get(`${API_BASE}/tasks/project/${pId}`);
          const taskList = resTasks.data.data || resTasks.data;
          if (isMounted) setTasks(Array.isArray(taskList) ? taskList : []);
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  const refreshTasks = async (currentProjectId = projectId) => {
    if (!currentProjectId) return;
    try {
      const resTasks = await axios.get(`${API_BASE}/tasks/project/${currentProjectId}`);
      const taskList = resTasks.data.data || resTasks.data;
      setTasks(Array.isArray(taskList) ? taskList : []);
    } catch (error) {
      console.error('Lỗi reload tasks:', error);
    }
  };

  const handleOpenCreateModal = (taskToEdit = null) => {
    if (taskToEdit) {
      setEditingTask(taskToEdit);
      setTaskForm({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        priority: taskToEdit.priority || 'MEDIUM',
        status: taskToEdit.status || 'TODO',
        assigneeId: taskToEdit.assigneeId?._id || taskToEdit.assigneeId || '',
        // Format ngày chuẩn HTML Date Input: YYYY-MM-DD
        dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : ''
      });
      const tId = taskToEdit._id || taskToEdit.id;
      if (tId) {
        fetchActivities(tId);
      }
    } else {
      setEditingTask(null);
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', assigneeName: '', dueDate: '' });
    }
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    try {
      if (editingTask) {
        // Lấy chính xác _id hoặc id của task đang sửa
        const taskId = editingTask._id || editingTask.id;
        if (!taskId) {
          alert('Không tìm thấy ID của Task cần sửa!');
          return;
        }

        // Gọi đúng route PUT /api/tasks/:id
        const res = await axios.put(`${API_BASE}/tasks/${taskId}`, taskForm);

        if (res.data.success) {
          // Cập nhật lại state tasks ngay lập tức
          setTasks(tasks.map(t => ((t._id || t.id) === taskId ? res.data.data : t)));
        }
      } else {
        // Tạo mới task
        const res = await axios.post(`${API_BASE}/tasks`, { ...taskForm, projectId });
        if (res.data.success) {
          setTasks([...tasks, res.data.data]);
        }
      }

      setShowTaskModal(false);
      setEditingTask(null);
      await refreshTasks(projectId); // Làm mới dữ liệu toàn ứng dụng
    } catch (error) {
      console.error('Lỗi khi lưu task:', error);
      alert(`Lỗi: ${error.response?.data?.message || 'Không thể cập nhật Task!'}`);
    }
  };
  const handleSendComment = async (taskId) => {
    if (!newComment.trim()) return;

    try {
      await axios.post(`${API_BASE}/tasks/${taskId}/comment`, { content: newComment });
      setNewComment(''); // Xóa nội dung input sau khi gửi
      fetchActivities(taskId); // Tải lại log để thấy bình luận mới ngay
    } catch (error) {
      alert("Không thể gửi bình luận!");
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
      });
      setAiResult(res.data.data.aiAnalysis);
      await refreshTasks();
    } catch (error) {
      console.error('Lỗi AI:', error);
      alert('Lỗi khi phân tích báo cáo AI!');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    blocked: tasks.filter(t => t.isBlocked).length,
    done: tasks.filter(t => t.status === 'DONE').length
  };

  return (
    <div className="flex h-screen w-full bg-[#090D16] text-slate-100 font-sans antialiased overflow-hidden m-0 p-0">

      {/* SIDEBAR */}
      <aside className="w-60 bg-[#0F172A] border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-full">
        <div className="p-4 space-y-5">
          <div className="flex items-center gap-3 px-1">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shrink-0">
              <FolderKanban className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent truncate">FJra</h1>
              <p className="text-[10px] text-slate-400 font-medium truncate">Agile Project Manager</p>
            </div>
          </div>

          {/* Menu Quản lý chung */}
          <div className="space-y-1">
            <p className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Quản lý dự án</p>

            <button
              onClick={() => setActiveTab('members')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${activeTab === 'members' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="truncate">Thành viên & Quyền</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${activeTab === 'reports' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
            >
              <BarChart2 className="w-4 h-4 shrink-0" />
              <span className="truncate">Báo cáo & Thống kê</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${activeTab === 'settings' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="truncate">Cài đặt chung</span>
            </button>
          </div>
        </div>

        {/* PROFILE & LOGOUT SECTION */}
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
              <span className="text-xs font-medium text-slate-200 truncate">{user?.name || user?.email || 'User'}</span>
            </div>
            <button
              onClick={logout}
              title="Đăng xuất"
              className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#090D16]">

        {/* Header & Horizontal Tabs */}
        <div className="bg-[#0F172A]/40 backdrop-blur-sm border-b border-slate-800/80 flex flex-col shrink-0">
          {/* Top Header */}
          <header className="h-14 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                FJ
              </div>
              <h2 className="text-sm font-bold text-slate-200">
                Dự án hiện tại
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-md border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Project ID: <strong className="text-slate-200 font-mono">{projectId || 'Đang tải...'}</strong></span>
            </div>
          </header>

          {/* Jira-style Horizontal Tabs */}
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
                  className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold cursor-pointer transition-all border-b-2 ${isActive
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-t-lg'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          <AIChatBar projectId={projectId} onTaskCreated={refreshTasks} />
          {/* Cập nhật lại điều kiện render cho các View */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Đang đồng bộ dữ liệu...</span>
            </div>
          ) : activeTab === 'board' ? (
            <ActiveSprintKanban
              projectId={projectId}
              onTaskUpdate={refreshTasks}
              onOpenCreateModal={handleOpenCreateModal}
            />
          ) : activeTab === 'backlog' ? (
            <BacklogView
              projectId={projectId}
              onTaskUpdate={refreshTasks}
            />
          ) : activeTab === 'calendar' ? (
            // Thêm tab Calendar vào đây
            <CalendarView
              tasks={tasks}
              onOpenTaskModal={handleOpenCreateModal}
            />
          ) : activeTab === 'timeline' ? (
            // Thêm tab Timeline vào đây
            <TimelineView
              tasks={tasks}
              onOpenTaskModal={handleOpenCreateModal}
            />
          ) : activeTab === 'forms' ? (
            <FormsView
              projectId={projectId}
              onTaskUpdate={refreshTasks}
            />

          ) : activeTab === 'summary' ? (
            <ProjectSummary tasks={tasks} />
          ) : activeTab === 'docs' ? (
            <DocsView projectId={projectId} />
          ) : activeTab === 'board' ? (
            <ActiveSprintKanban
              projectId={projectId}
              onTaskUpdate={refreshTasks}
              onOpenCreateModal={handleOpenCreateModal}
            />
          ) : activeTab === 'members' ? (
            <MembersView projectId={projectId} />
          ) : activeTab === 'reports' ? (
            <ReportsView projectId={projectId} />
          ) : activeTab === 'settings' ? (
            <SettingsView projectId={projectId} />
          ) : (
            // Placeholder cho các tab chưa phát triển
            <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-4">
              <Globe className="w-12 h-12 opacity-20" />
              <p className="text-sm">Tính năng <strong className="text-slate-300">{activeTab.toUpperCase()}</strong> đang được phát triển.</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal Task */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex justify-end z-50 animate-fadeIn">
          {/* Khung Sidebar trượt từ phải sang */}
          <div className="bg-[#0B132B] border-l border-slate-800/80 w-full max-w-4xl h-full p-6 shadow-2xl flex flex-col justify-between overflow-hidden">

            {/* Top Action Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span className="text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {projectId ? `PROJECT-${projectId.slice(-4).toUpperCase()}` : 'TASK'}
                </span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-200 font-medium truncate max-w-xs">{editingTask ? editingTask.title : 'Task mới'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 p-2 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Nội dung chính chia 2 cột cuộn độc lập */}
            <form onSubmit={handleSaveTask} className="flex-1 flex gap-6 pt-5 overflow-hidden">

              {/* CỘT BÊN TRÁI: Tiêu đề, Mô tả, Subtasks (Cuộn riêng) */}
              <div className="flex-1 space-y-5 overflow-y-auto pr-3 custom-scrollbar">
                <div>
                  <input
                    type="text"
                    required
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full bg-transparent text-base font-bold text-slate-100 placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-indigo-500 pb-2 transition-all"
                    placeholder="Tên công việc..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    rows={5}
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="w-full bg-slate-900/90 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all resize-none leading-relaxed shadow-inner"
                    placeholder="Thêm mô tả chi tiết cho công việc này..."
                  />
                </div>

                {/* Phần Subtasks & AI Breakdown */}
                {editingTask && (
                  <TaskSubtaskSection
                    task={editingTask}
                    onTaskUpdated={(updatedTask) => {
                      setEditingTask(updatedTask);
                    }}
                  />
                )}
                {/* 4. Activity Log (Nằm ngay bên dưới, liền mạch) */}
                <div className="pt-6 border-t border-slate-800/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Activity</h3>
                  </div>

                  {/* Thanh lọc pill-buttons (All | Comments | History | Work log) */}
                  <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80 w-fit">
                    {['All', 'Comments', 'History', 'Work log'].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActivityFilter(tab)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${activityFilter === tab
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                          }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Khung hiển thị nội dung theo bộ lọc được chọn */}
                  <div className="space-y-4 pt-2">

                    {/* Ô nhập bình luận nhanh */}
                    <div className="flex gap-3 mt-4 items-center">
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                        {user?.name?.[0] || 'U'}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => handleSendComment(editingTask._id || editingTask.id)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Gửi
                        </button>
                      </div>
                    </div>

                    {/* Danh sách Activity thật từ Database */}
                    <div className="space-y-3 pt-2">
                      {activities.length > 0 ? (
                        activities.filter((act) => {
                          if (activityFilter === 'All') return true;
                          if (activityFilter === 'Comments') return act.action === 'đã bình luận';
                          if (activityFilter === 'History') return act.action !== 'đã bình luận';
                          if (activityFilter === 'Work log') return act.action === 'đã cập nhật thời gian'; // Tùy chỉnh theo logic của bạn
                          return true;
                        })
                          .map((act) => (
                            <div key={act._id || act.id} className="flex gap-3 items-start">
                              <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400 border border-indigo-500/30 shrink-0">
                                {act.userId?.name ? act.userId.name.substring(0, 2).toUpperCase() : 'U'}
                              </div>
                              <div className="text-xs text-slate-300 space-y-1">
                                <p>
                                  <span className="font-bold text-slate-200">{act.userId?.name || 'Thành viên'}</span> {act.action} <span className="text-indigo-300">{act.content}</span>
                                </p>
                                <span className="text-[10px] text-slate-500 block">
                                  {new Date(act.createdAt).toLocaleString('vi-VN')}
                                </span>
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="text-xs text-slate-500 italic text-center py-2">Chưa có hoạt động nào gần đây.</p>
                      )}
                    </div>

                  </div>
                </div>
              </div>

              {/* CỘT BÊN PHẢI: Khung Details cố định không bị trôi */}
              <div className="w-80 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shrink-0 shadow-lg">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center justify-between">
                    <span>Details</span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  </h3>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Assignee</label>
                    <select
                      value={taskForm.assigneeId || ''}
                      onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer transition-all"
                    >
                      <option value="">-- Chưa phân công --</option>
                      {members.map(m => (
                        <option key={m._id} value={m._id}>{m.name || m.email}</option>
                      ))}
                    </select>
                  </div>
                  {/* Trạng thái */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Status</label>
                    <select
                      value={taskForm.status}
                      onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer transition-all"
                    >
                      <option value="TODO">CẦN LÀM</option>
                      <option value="IN_PROGRESS">ĐANG LÀM</option>
                      <option value="DONE">HOÀN THÀNH</option>
                    </select>
                  </div>

                  {/* Mức ưu tiên */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer transition-all"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Due Date</label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer transition-all"
                    />
                  </div>
                </div>

                {/* Nút Lưu / Hủy cố định dưới cùng của cột Details */}
                <div className="pt-4 border-t border-slate-800/80 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="flex-1 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal AI Daily */}
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
                <p className="text-xs text-slate-400 leading-relaxed">
                  Nhập tiến độ tự do, AI sẽ tự động phân loại công việc và cập nhật thẻ Kanban lên hệ thống.
                </p>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Hôm nay tôi đã xong tính năng X, nhưng gặp khó khăn khi liên kết API..."
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
                <button
                  onClick={handleSubmitDaily}
                  disabled={aiAnalyzing}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold text-xs transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {aiAnalyzing ? 'AI đang xử lý...' : 'Phân tích & Cập nhật'}
                </button>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-900 p-4 rounded-lg border border-slate-700/80 text-xs">
                <h3 className="font-semibold text-emerald-400 text-xs border-b border-slate-800 pb-2">✅ Kết quả AI phân tích:</h3>
                <div>
                  <strong className="text-slate-300 block mb-1">Đã làm:</strong>
                  <ul className="list-disc pl-4 text-slate-400 space-y-0.5">{aiResult.yesterdayDone?.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
                <div>
                  <strong className="text-slate-300 block mb-1">Kế hoạch:</strong>
                  <ul className="list-disc pl-4 text-slate-400 space-y-0.5">{aiResult.todayPlan?.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
                {aiResult.blockers?.length > 0 && (
                  <div className="bg-red-500/10 p-2.5 rounded-lg border border-red-500/20 text-red-300">
                    <strong className="block mb-1">⚠️ Sự cố (Blockers):</strong>
                    <ul className="list-disc pl-4 space-y-0.5">{aiResult.blockers.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </div>
                )}
                <button onClick={() => { setAiResult(null); setShowAiModal(false); }} className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-medium mt-2 cursor-pointer">
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