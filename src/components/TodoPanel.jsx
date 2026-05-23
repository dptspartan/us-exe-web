import React, { useCallback, useState, useEffect } from 'react';
import { networkUtility } from '../api/NetworkUtils';
import { useApp } from '../hooks/useApp';
import { useCoupleRealtime } from '../hooks/useCoupleRealtime';

export function TodoPanel() {
  const { coupleId } = useApp();

  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [busy, setBusy] = useState(false);

  const [activeTab, setActiveTab] = useState('todos');
  const [filter, setFilter] = useState('all');

  // ====================================================================
  // LOAD
  // ====================================================================

  const load = useCallback(async () => {
    try {
      const todoRows = await networkUtility.getTodos(coupleId);
      setTodos(todoRows || []);
    } catch (err) {
      console.error(err);
    }
  }, [coupleId]);

  const { reload: reloadTodos } = useCoupleRealtime(
    coupleId,
    'todos',
    load
  );

  useEffect(() => {
    load();
  }, [load]);

  // ====================================================================
  // TODOS
  // ====================================================================

  const addTask = async (e) => {
    e.preventDefault();

    const trimmed = task.trim();

    if (!trimmed || !coupleId || busy) return;

    setBusy(true);

    const optimistic = {
      id: `temp-${Date.now()}`,
      task: trimmed,
      is_completed: false,
      couple_id: coupleId
    };

    setTodos((prev) => [optimistic, ...prev]);
    setTask('');

    try {
      const created = await networkUtility.createTodo(coupleId, trimmed);

      setTodos((prev) =>
        prev.map((t) => (t.id === optimistic.id ? created : t))
      );
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
      prev.map((t) =>
        t.id === todo.id ? { ...t, is_completed: next } : t
      )
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
    <div className="w-full aspect-square rounded-2xl flex flex-col justify-between shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] border border-white/10 overflow-hidden relative select-none bg-[#121214]">
      {/* HEADER */}
      <div className="w-full h-4 bg-gradient-to-b from-neutral-900 to-black border-b border-white/5 flex items-center justify-center gap-6 px-4 shrink-0 z-10 shadow-md">
        <div className="w-2 h-2 rounded-full bg-neutral-800 border border-white/5 shadow-inner" />
        <div className="w-2 h-2 rounded-full bg-neutral-800 border border-white/5 shadow-inner" />
        <div className="w-2 h-2 rounded-full bg-neutral-800 border border-white/5 shadow-inner" />
      </div>

      <div className="flex-1 flex w-full relative min-h-0">
        {/* SIDEBAR */}
        <div className="w-20 border-r-2 border-vibe-accent/30 flex flex-col pt-12 items-center px-1 shrink-0 relative bg-black/20 justify-between pb-6">
          <div className="flex flex-col gap-6 text-center w-full">
            <button
              type="button"
              onClick={() => setActiveTab('todos')}
              className="text-[10px] font-sans tracking-wider uppercase transition-all duration-150 text-vibe-accent font-black"
            >
              ✍️ Goals
            </button>
          </div>

          <div className="flex flex-col gap-3 text-center w-full border-t border-neutral-800/40 pt-4">
            {['all', 'pending', 'completed'].map((subFilter) => (
              <button
                key={subFilter}
                type="button"
                onClick={() => setFilter(subFilter)}
                className={`text-[8px] font-mono tracking-widest uppercase ${
                  filter === subFilter
                    ? 'text-vibe-accent font-bold'
                    : 'text-neutral-600'
                }`}
              >
                {subFilter === 'all'
                  ? 'All'
                  : subFilter === 'pending'
                  ? 'Open'
                  : 'Done'}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col pt-4 pr-6 pl-4 min-h-0 relative z-10 bg-gradient-to-b from-neutral-900/40 to-neutral-950/20">
          {activeTab === 'todos' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="mb-2 pb-1.5 flex flex-col border-b border-white/5">
                <h3 className="text-sm font-sans font-black text-neutral-200 tracking-wider uppercase flex items-center gap-1.5">
                  Our Little Couple Goals ⚡
                </h3>

                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-vibe-accent/60 mt-0.5">
                  {todos.filter((t) => !t.is_completed).length} goals remaining
                </span>
              </div>

              <form
                onSubmit={addTask}
                className="flex gap-2 mb-3 mt-1 relative z-20"
              >
                <input
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  disabled={busy}
                  placeholder="Type a new focus..."
                  className="flex-1 bg-transparent border-b border-dashed border-neutral-700 text-xs font-sans font-medium text-neutral-200 placeholder-neutral-600 px-1 py-1 focus:outline-none focus:border-vibe-accent"
                />

                <button
                  type="submit"
                  disabled={busy || !task.trim()}
                  className={`text-[10px] font-sans font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                    !task.trim()
                      ? 'bg-neutral-800 text-neutral-600'
                      : 'bg-vibe-accent text-black'
                  }`}
                >
                  Add
                </button>
              </form>

              <div className="flex-1 overflow-y-auto min-h-0 mb-4 pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
                {filteredTodos.length === 0 ? (
                  <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-600 text-center pt-10">
                    Queue Empty
                  </div>
                ) : (
                  <ul className="space-y-0.5 pt-[0.2rem]">
                    {filteredTodos.map((todo) => (
                      <li
                        key={todo.id}
                        className="flex items-center gap-3 group h-8 border-b border-transparent relative"
                      >
                        <label className="relative flex items-center justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={todo.is_completed}
                            onChange={() => toggle(todo)}
                            className="sr-only"
                          />

                          <div
                            className={`w-3.5 h-3.5 rounded-full border transition-all flex items-center justify-center ${
                              todo.is_completed
                                ? 'bg-vibe-accent border-vibe-accent'
                                : 'bg-transparent border-neutral-600'
                            }`}
                          >
                            {todo.is_completed && (
                              <svg
                                className="w-2 h-2 text-black"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="4.5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        </label>

                        <span
                          className={`flex-1 text-xs font-sans font-semibold tracking-wide truncate ${
                            todo.is_completed
                              ? 'line-through text-neutral-600 italic'
                              : 'text-neutral-300'
                          }`}
                        >
                          {todo.task}
                        </span>

                        <button
                          type="button"
                          onClick={() => remove(todo.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[11px] font-bold text-neutral-600 hover:text-red-400 px-1"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
