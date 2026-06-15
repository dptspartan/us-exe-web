import React, { useCallback, useState, useEffect } from 'react';
import { networkUtility } from '../api/NetworkUtils';
import { useApp } from '../hooks/useApp';
import { useCoupleRealtime } from '../hooks/useCoupleRealtime';
import { DatePlannerPanel } from './DatePlannerPanel';

const DATE_FILTERS = ['all', 'pending', 'completed'];
const GOAL_FILTERS = ['all', 'pending', 'completed'];

function GoalsPanel({ filter }) {
  const { coupleId } = useApp();
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const todoRows = await networkUtility.getTodos(coupleId);
      setTodos(todoRows || []);
    } catch (err) {
      console.error(err);
    }
  }, [coupleId]);

  const { reload: reloadTodos } = useCoupleRealtime(coupleId, 'todos', load);

  useEffect(() => {
    load();
  }, [load]);

  const addTask = async (e) => {
    e.preventDefault();
    const trimmed = task.trim();
    if (!trimmed || !coupleId || busy) return;

    setBusy(true);
    const optimistic = {
      id: `temp-${Date.now()}`,
      task: trimmed,
      is_completed: false,
      couple_id: coupleId,
    };

    setTodos((prev) => [optimistic, ...prev]);
    setTask('');

    try {
      const created = await networkUtility.createTodo(coupleId, trimmed);
      setTodos((prev) => prev.map((t) => (t.id === optimistic.id ? created : t)));
    } catch {
      setTodos((prev) => prev.filter((t) => t.id !== optimistic.id));
      reloadTodos();
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (todo) => {
    const next = !todo.is_completed;
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, is_completed: next } : t))
    );
    try {
      await networkUtility.toggleTodo(todo.id, next);
    } catch {
      reloadTodos();
    }
  };

  const remove = async (id) => {
    if (String(id).startsWith('temp-')) return;
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      await networkUtility.deleteTodo(id, coupleId);
    } catch {
      reloadTodos();
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'pending') return !todo.is_completed;
    if (filter === 'completed') return todo.is_completed;
    return true;
  });

  return (
    <>
      <div className="border-b border-white/5 pb-2 mb-3 shrink-0">
        <h3 className="text-sm font-black text-neutral-200 uppercase">Our Couple Goals ⚡</h3>
        <span className="text-[9px] text-vibe-accent/60 font-mono">
          {todos.filter((t) => !t.is_completed).length} remaining
        </span>
      </div>

      <form onSubmit={addTask} className="flex gap-2 mb-3 shrink-0">
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="flex-1 bg-transparent border-b border-dashed border-neutral-700 text-xs text-neutral-200 px-1 py-1 focus:outline-none"
          placeholder="Type a new focus..."
        />
        <button
          disabled={!task.trim() || busy}
          className="text-[10px] px-3 py-1 bg-vibe-accent text-black font-bold rounded-lg"
        >
          Add
        </button>
      </form>

      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredTodos.length === 0 ? (
          <div className="text-center text-[10px] text-neutral-600 pt-10">Queue Empty</div>
        ) : (
          <ul className="space-y-2">
            {filteredTodos.map((todo) => (
              <li key={todo.id} className="flex items-start gap-3 w-full py-2 group">
                <label className="mt-1">
                  <input
                    type="checkbox"
                    checked={todo.is_completed}
                    onChange={() => toggle(todo)}
                    className="sr-only"
                  />
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      todo.is_completed
                        ? 'bg-vibe-accent border-vibe-accent'
                        : 'border-neutral-600'
                    }`}
                  >
                    {todo.is_completed && (
                      <svg
                        className="w-2 h-2 text-black"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </label>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-semibold leading-snug whitespace-normal break-words ${
                      todo.is_completed
                        ? 'line-through text-neutral-600'
                        : 'text-neutral-300'
                    }`}
                  >
                    {todo.task}
                  </p>
                </div>
                <button
                  onClick={() => remove(todo.id)}
                  className="text-sm text-neutral-600 hover:text-red-400 opacity-60 hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export function TodoPanel() {
  const [activeTab, setActiveTab] = useState('todos');
  const [filter, setFilter] = useState('pending');

  const subFilters = activeTab === 'todos' ? GOAL_FILTERS : DATE_FILTERS;

  const switchTab = (tab) => {
    setActiveTab(tab);
    setFilter('pending');
  };

  return (
    <div className="h-full w-full min-w-0 max-w-full rounded-2xl flex flex-col justify-between shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] border border-white/10 overflow-hidden bg-[#121214]">
      <div className="w-full h-4 bg-gradient-to-b from-neutral-900 to-black border-b border-white/5 flex items-center justify-center gap-6 px-4 shrink-0">
        <div className="w-2 h-2 rounded-full bg-neutral-800" />
        <div className="w-2 h-2 rounded-full bg-neutral-800" />
        <div className="w-2 h-2 rounded-full bg-neutral-800" />
      </div>

      <div className="flex-1 flex min-h-0 min-w-0">
        <div className="w-20 border-r border-vibe-accent/30 flex flex-col pt-12 items-center justify-between pb-6 bg-black/20 shrink-0">
          <div className="flex flex-col gap-4 w-full text-center">
            <button
              type="button"
              onClick={() => switchTab('todos')}
              className={`text-[10px] font-bold uppercase leading-tight px-1 ${
                activeTab === 'todos' ? 'text-vibe-accent' : 'text-neutral-600 hover:text-neutral-400'
              }`}
            >
              ✍️ Goals
            </button>
            <button
              type="button"
              onClick={() => switchTab('dates')}
              className={`text-[10px] font-bold uppercase leading-tight px-1 ${
                activeTab === 'dates' ? 'text-vibe-accent' : 'text-neutral-600 hover:text-neutral-400'
              }`}
            >
              📅 Dates
            </button>
          </div>

          <div className="flex flex-col gap-3 border-t border-neutral-800 pt-4 w-full text-center">
            {subFilters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`text-[8px] uppercase tracking-widest ${
                  filter === f ? 'text-vibe-accent' : 'text-neutral-600'
                }`}
              >
                {activeTab === 'dates' && f === 'pending' ? 'upcoming' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 min-h-0 pt-3 lg:pt-4 px-3 lg:px-4">
          {activeTab === 'todos' ? (
            <GoalsPanel filter={filter} />
          ) : (
            <DatePlannerPanel filter={filter} />
          )}
        </div>
      </div>
    </div>
  );
}
