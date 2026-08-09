import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, X, LayoutDashboard, ListTodo, 
  ShieldAlert, CheckCircle, FolderKanban, PlayCircle
} from 'lucide-react';
import BacklogView from './components/BacklogView';
import ActiveSprintKanban from './components/ActiveSprintKanban';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('kanban');

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
    assigneeName: ''
  });

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const resProjects = await axios.get(`${API_BASE}/projects`);
        const projectList = resProjects.data.data || resProjects.data;

        if (isMounted && Array.isArray(projectList) && projectList.length > 0) {
          const pId = projectList[0]._id;
          setProjectId(pId);

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

  const refreshTasks = async () => {
    if (!projectId) return;
    try {
      const resTasks = await axios.get(`${API_BASE}/tasks/project/${projectId}`);
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
        assigneeName: taskToEdit.assigneeId?.name || ''
      });
    } else {
      setEditingTask(null);
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', assigneeName: '' });
    }
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    try {
      if (editingTask) {
        const taskId = editingTask._id || editingTask.id;
        await axios.put(`${API_BASE}/tasks/${taskId}`, taskForm);
      } else {
        await axios.post(`${API_BASE}/tasks`, { ...taskForm, projectId });
      }
      setShowTaskModal(false);
      await refreshTasks();
    } catch (error) {
      alert(`Lỗi: ${error.response?.data?.message || 'Không thể cập nhật Task!'}`);
    }
  };

  const handleSubmitDaily = async () => {
    if (!reportText.trim()) return;
    try {
      setAiAnalyzing(true);
      const res = await axios.post(`${API_BASE}/daily`, {
        projectId,
        userId: '66a012345678901234567890',
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

          <div className="space-y-1">
            <p className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Giao diện làm việc</p>
            <button
              onClick={() => setActiveTab('kanban')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                activeTab === 'kanban' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span className="truncate">Active Sprint Board</span>
            </button>

            <button
              onClick={() => setActiveTab('backlog')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                activeTab === 'backlog' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <ListTodo className="w-4 h-4 shrink-0" />
              <span className="truncate">Backlog & Sprint</span>
            </button>
          </div>
        </div>

        <div className="p-3 border-t border-slate-800/80">
          <button onClick={() => setShowAiModal(true)} className="w-full flex items-center justify-between p-2.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 cursor-pointer">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span className="truncate">Daily AI Assistant</span>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-1" />
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#090D16]">
        <header className="h-13 border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 bg-[#0F172A]/40 backdrop-blur-sm">
          <h2 className="text-xs font-bold text-slate-200 flex items-center gap-2">
            {activeTab === 'kanban' ? <LayoutDashboard className="w-4 h-4 text-indigo-400" /> : <ListTodo className="w-4 h-4 text-indigo-400" />}
            <span>{activeTab === 'kanban' ? 'Active Sprint Kanban Board' : 'Backlog & Planning'}</span>
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1 rounded-md border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Project ID: <strong className="text-slate-200 font-mono">{projectId || 'Đang tải...'}</strong></span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'kanban' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-3 flex items-center justify-between">
                <div><p className="text-[11px] text-slate-400">Tổng công việc</p><p className="text-base font-bold text-slate-100">{stats.total}</p></div>
                <div className="p-2 bg-slate-800 rounded-lg text-slate-300"><ListTodo className="w-4 h-4" /></div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-3 flex items-center justify-between">
                <div><p className="text-[11px] text-slate-400">Đang triển khai</p><p className="text-base font-bold text-blue-400">{stats.inProgress}</p></div>
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><PlayCircle className="w-4 h-4" /></div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-3 flex items-center justify-between">
                <div><p className="text-[11px] text-slate-400">Vấn đề (Blocked)</p><p className="text-base font-bold text-red-400">{stats.blocked}</p></div>
                <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><ShieldAlert className="w-4 h-4" /></div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-3 flex items-center justify-between">
                <div><p className="text-[11px] text-slate-400">Đã hoàn thành</p><p className="text-base font-bold text-emerald-400">{stats.done}</p></div>
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><CheckCircle className="w-4 h-4" /></div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Đang đồng bộ dữ liệu...</span>
            </div>
          ) : activeTab === 'kanban' ? (
            <ActiveSprintKanban 
              projectId={projectId} 
              onTaskUpdate={refreshTasks} 
              onOpenCreateModal={handleOpenCreateModal}
            />
          ) : (
            <BacklogView 
              projectId={projectId} 
              onTaskUpdate={refreshTasks}
            />
          )}
        </main>
      </div>

      {/* Modal Task */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <form onSubmit={handleSaveTask} className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700/60 pb-3">
              <h2 className="text-xs font-bold text-slate-100">{editingTask ? 'Cập nhật Task' : 'Thêm Task mới'}</h2>
              <button type="button" onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tên Task (*)</label>
                <input type="text" required value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mô tả</label>
                <textarea rows={3} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Mức ưu tiên</label>
                  <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500">
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Trạng thái</label>
                  <select value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500">
                    <option value="TODO">CẦN LÀM</option>
                    <option value="IN_PROGRESS">ĐANG LÀM</option>
                    <option value="DONE">HOÀN THÀNH</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold cursor-pointer">Hủy</button>
              <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold cursor-pointer">{editingTask ? 'Cập nhật' : 'Tạo mới'}</button>
            </div>
          </form>
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