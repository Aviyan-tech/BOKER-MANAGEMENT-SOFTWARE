"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LucideCalendarDays, LucideMapPin, LucideUserCircle,
  LucideCheckCircle2, LucideFilter, LucideChevronLeft, LucideChevronRight,
  LucideBriefcase, LucideFileSignature, LucidePhoneCall, LucideMap
} from "lucide-react";

type TaskType = "Site Visit" | "Client Meeting" | "Document Signing" | "Follow-up";
type TaskStatus = "Pending" | "Completed" | "Cancelled";

interface Task {
  id: string;
  title: string;
  time: string;
  location?: string;
  client?: string;
  type: TaskType;
  status: TaskStatus;
  dateStr: string;
}

const generateDummyTasks = (): Task[] => {
  const today = new Date();
  const tasks: Task[] = [];
  
  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split("T")[0];
  };

  const todayStr = today.toISOString().split("T")[0];
  const tomorrowStr = addDays(today, 1);
  const nextWeekStr = addDays(today, 7);

  tasks.push(
    { id: "1", title: "Property Viewing: Pokhara Plot", time: "10:00 AM", location: "Amarsingh Chowk", client: "Rajesh Thapa", type: "Site Visit", status: "Pending", dateStr: todayStr },
    { id: "2", title: "Initial Consultation", time: "01:30 PM", location: "Office (Lakeside)", client: "Sita Gurung", type: "Client Meeting", status: "Pending", dateStr: todayStr },
    { id: "3", title: "Lalpurja Transfer Signing", time: "04:00 PM", location: "Malpot Office, Kaski", client: "Binod Sharma", type: "Document Signing", status: "Pending", dateStr: todayStr },
    
    { id: "4", title: "Check on pending bank loan", time: "09:00 AM", client: "Rajesh Thapa", type: "Follow-up", status: "Completed", dateStr: tomorrowStr },
    { id: "5", title: "Site Visit: Lakeside Villa", time: "11:30 AM", location: "Lakeside Ward 6", client: "Anita Poudel", type: "Site Visit", status: "Pending", dateStr: tomorrowStr },
    
    { id: "6", title: "Meeting with Developer", time: "02:00 PM", location: "Hemja", client: "Hemja Housing Co.", type: "Client Meeting", status: "Pending", dateStr: nextWeekStr }
  );

  return tasks;
};

const DUMMY_TASKS = generateDummyTasks();

const getTypeIcon = (type: TaskType) => {
  switch (type) {
    case "Site Visit": return <LucideMap className="w-4 h-4 text-emerald-400" />;
    case "Client Meeting": return <LucideBriefcase className="w-4 h-4 text-blue-400" />;
    case "Document Signing": return <LucideFileSignature className="w-4 h-4 text-purple-400" />;
    case "Follow-up": return <LucidePhoneCall className="w-4 h-4 text-orange-400" />;
  }
};

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case "Pending": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    case "Completed": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    case "Cancelled": return "text-red-400 bg-red-500/10 border-red-500/30";
  }
};

export default function ScheduleView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<TaskType | "All">("All");

  const selectedDateStr = selectedDate.toISOString().split("T")[0];

  const filteredTasks = useMemo(() => {
    return DUMMY_TASKS.filter(task => {
      const matchesDate = task.dateStr === selectedDateStr;
      const matchesType = filterType === "All" || task.type === filterType;
      return matchesDate && matchesType;
    });
  }, [selectedDateStr, filterType]);

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const isToday = (d: Date) => {
    const today = new Date();
    return d.getDate() === today.getDate() && 
           d.getMonth() === today.getMonth() && 
           d.getFullYear() === today.getFullYear();
  };

  const formatDisplayDate = (d: Date) => {
    if (isToday(d)) return "Today's Tasks";
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth() && d.getFullYear() === tomorrow.getFullYear()) {
      return "Tomorrow's Tasks";
    }
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="relative animate-fade-in z-10 w-full mt-4">
      {/* Background ambient glow inside dashboard content area */}
      <div className="absolute top-10 right-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 drop-shadow-md">
            Schedule &amp; Calendar
          </h2>
          <p className="text-white/50 text-xs font-medium mt-1">Manage your site visits, meetings, and deals.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-[#0a111a] p-1.5 rounded-full border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <button onClick={handlePrevDay} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white">
            <LucideChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setSelectedDate(new Date())}>
            <LucideCalendarDays className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-xs">{selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <button onClick={handleNextDay} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white">
            <LucideChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Calendar Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0a111a] border border-white/10 rounded-3xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm">{selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-[9px] font-bold text-white/40 uppercase tracking-wider py-1.5">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="p-1.5" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateOfCell = new Date(currentYear, currentMonth, day);
                const dateStr = dateOfCell.toISOString().split("T")[0];
                const hasTasks = DUMMY_TASKS.some(t => t.dateStr === dateStr);
                const isSelected = day === selectedDate.getDate();
                const isTodayCell = isToday(dateOfCell);

                return (
                  <div 
                    key={day} 
                    onClick={() => setSelectedDate(dateOfCell)}
                    className={`
                      relative flex items-center justify-center p-1.5 text-xs font-semibold rounded-full cursor-pointer transition-all duration-300
                      ${isSelected ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-110 z-10' : 'hover:bg-white/10 text-white/70'}
                      ${isTodayCell && !isSelected ? 'text-emerald-400 bg-emerald-500/10' : ''}
                    `}
                  >
                    {day}
                    {hasTasks && !isSelected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#0a111a] border border-white/10 rounded-3xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
            <h3 className="font-bold text-xs text-white/60 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <LucideFilter className="w-3.5 h-3.5" /> Filters
            </h3>
            <div className="space-y-1.5">
              {(["All", "Site Visit", "Client Meeting", "Document Signing", "Follow-up"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as TaskType | "All")}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center justify-between ${
                    filterType === type 
                      ? "bg-white/10 text-white border border-white/20 shadow-md" 
                      : "text-white/50 hover:bg-white/5 hover:text-white/80 border border-transparent"
                  }`}
                >
                  {type}
                  {filterType === type && <LucideCheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-5 px-2">
            <h2 className="text-lg font-black text-white drop-shadow-md">
              {formatDisplayDate(selectedDate)}
            </h2>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {filteredTasks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-[#0a111a] border border-white/10 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-[0_10px_40px_rgba(0,0,0,0.1)]"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                  <LucideCalendarDays className="w-6 h-6 text-white/20" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No tasks scheduled</h3>
                <p className="text-white/50 text-xs max-w-sm">
                  You have a clear schedule for this day. Enjoy the break or proactively reach out to clients to fill your pipeline!
                </p>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-3"
                initial="hidden" animate="show" exit="hidden"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
                }}
              >
                {filteredTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      show: { opacity: 1, x: 0 }
                    }}
                    className="group bg-[#0a111a] border border-white/10 rounded-[1.5rem] p-4 flex flex-col md:flex-row gap-4 items-start md:items-center transition-all duration-300 hover:shadow-[0_15px_40px_rgba(16,185,129,0.15)] hover:border-emerald-500/30 hover:-translate-y-1 cursor-pointer overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center py-1.5 bg-black/40 rounded-xl border border-white/5 shadow-inner">
                      <span className="text-sm font-black text-white">{task.time.split(" ")[0]}</span>
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">{task.time.split(" ")[1]}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="flex items-center gap-1 bg-white/5 text-white/70 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/10">
                          {getTypeIcon(task.type)}
                          {task.type}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      
                      <h3 className="text-sm font-bold text-white mb-1.5 truncate group-hover:text-emerald-300 transition-colors">
                        {task.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-white/50">
                        {task.location && (
                          <div className="flex items-center gap-1">
                            <LucideMapPin className="w-3 h-3 text-white/40" />
                            <span className="truncate max-w-[150px]">{task.location}</span>
                          </div>
                        )}
                        {task.client && (
                          <div className="flex items-center gap-1">
                            <LucideUserCircle className="w-3 h-3 text-white/40" />
                            <span className="truncate max-w-[120px]">{task.client}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
