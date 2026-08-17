import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Calendar, Clock, TrendingUp, UserCheck, UserX, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import attendanceService from '../../services/attendanceService';
import DashboardSkeleton from './DashboardSkeleton';
import ErrorState from '../../components/ui/ErrorState';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const loadStats = async () => {
    try {
      setError('');
      const data = await attendanceService.getDashboardStats();
      setStats(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const today = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}`;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl pb-4 sm:pb-6">
      {/* Page heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]" />
              Today at a glance
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            <p className="mt-1.5 text-base text-gray-500">Keep track of today&apos;s attendance activity in one place.</p>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex w-fit items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Clock size={19} />
            </div>
            <div>
              <div className="text-sm font-semibold tabular-nums text-gray-900">{formatTime(currentTime)}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar size={13} />
                {formatDate(currentTime)}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <ErrorState
            title="Failed to load statistics"
            message={error}
            onRetry={loadStats}
          />
        </motion.div>
      )}

      {stats && !error && (
        <>
          {/* Attendance KPIs */}
          <motion.div 
            className="mb-8 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
          >
            {/* Total Students - Primary Card */}
            <KPICard
              title="Total Students"
              value={stats.totalStudents}
              icon={Users}
              color="primary"
              gradient="from-blue-500 to-indigo-600"
              detail="Enrolled roster"
              to="/students"
            />
            
            {/* Present Today - Success Card */}
            <KPICard
              title="Present Today"
              value={stats.presentToday}
              icon={UserCheck}
              color="success"
              gradient="from-emerald-500 to-green-600"
              subtitle="Checked in"
              detail="Marked as present"
              to={`/history?date=${today}&status=PRESENT`}
            />
            
            {/* Absent Today - Warning Card */}
            <KPICard
              title="Absent Today"
              value={stats.absentToday}
              icon={UserX}
              color="error"
              gradient="from-red-500 to-rose-600"
              subtitle="Not checked in"
              detail="Awaiting check-in"
              to={`/history?date=${today}&status=ABSENT`}
            />
            
            {/* Attendance Rate - Highlight Card */}
            <KPICard
              title="Attendance Rate"
              value={`${stats.attendancePercentage}%`}
              icon={TrendingUp}
              color="accent"
              gradient="from-amber-500 to-orange-600"
              subtitle="Today"
              highlight
              detail="Across today&apos;s roster"
              to={`/history?date=${today}`}
            />
          </motion.div>

          {/* Summary and next steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 gap-8 lg:grid-cols-2"
          >
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Today&apos;s summary</h3>
                  <p className="mt-1 text-sm text-gray-500">A quick breakdown of recorded attendance.</p>
                </div>
                <div className="rounded-xl bg-blue-50 px-3 py-2 text-right">
                  <div className="text-xs font-medium text-blue-600">Attendance</div>
                  <div className="mt-0.5 text-lg font-bold text-blue-700">{Math.round(stats.attendancePercentage)}%</div>
                </div>
              </div>
              <div className="space-y-4">
                <StatRow 
                  label="Total Attendance Taken"
                  value={stats.presentToday + stats.absentToday}
                  total={stats.totalStudents}
                />
                <StatRow 
                  label="Present" 
                  value={stats.presentToday}
                  color="success"
                  percentage={stats.attendancePercentage}
                />
                <StatRow 
                  label="Absent" 
                  value={stats.absentToday}
                  color="error"
                  percentage={100 - stats.attendancePercentage}
                />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 sm:p-6">
              <div className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-blue-200/40 blur-2xl" />
              <div className="relative mb-5">
                <h3 className="text-lg font-semibold text-gray-900">Quick actions</h3>
                <p className="mt-1 text-sm text-gray-500">Jump straight into your most common tasks.</p>
              </div>
              <div className="space-y-3">
                <QuickActionButton
                  label="Take Attendance"
                  description="Mark student attendance"
                  href="/attendance"
                  icon={UserCheck}
                />
                <QuickActionButton
                  label="Register Face"
                  description="Enroll new student face"
                  href="/face-registration"
                  icon={Users}
                />
                <QuickActionButton
                  label="View History"
                  description="Check attendance records"
                  href="/history"
                  icon={Calendar}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

// Premium KPI Card Component
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  }
};

function KPICard({ title, value, icon: Icon, gradient, subtitle, highlight, detail, to }) {
  const content = (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.99 }}
      className={`
        relative min-h-48 overflow-hidden rounded-2xl border p-5 shadow-sm sm:p-6
        ${highlight ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50' : 'border-gray-200 bg-white'}
        hover:border-gray-300 hover:shadow-md transition-all duration-300
      `}
    >
      <div 
        className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-10 blur-2xl ${gradient}`}
      />
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />
      
      <div className="relative flex h-full flex-col">
        <div className="mb-5 flex items-start justify-between">
          <div className={`rounded-xl bg-gradient-to-br p-2.5 shadow-sm ${gradient}`}>
            <Icon size={21} className="text-white" />
          </div>
          {subtitle && (
            <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-gray-500 ring-1 ring-inset ring-gray-200">
              {subtitle}
            </span>
          )}
        </div>
        
        <div className="text-3xl font-bold tracking-tight text-gray-900">{value}</div>
        <div className="mt-1 text-sm font-semibold text-gray-700">{title}</div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs font-medium text-gray-500">
          <span>{detail}</span>
          {to && <span className="inline-flex items-center gap-1 font-semibold text-blue-600">View list <ArrowUpRight size={14} /></span>}
        </div>
      </div>
    </motion.div>
  );

  return to ? (
    <Link to={to} aria-label={`View ${title.toLowerCase()}`} className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
      {content}
    </Link>
  ) : content;
}

// Stat Row Component
function StatRow({ label, value, total, color, percentage }) {
  const getColorClass = () => {
    if (color === 'success') return 'text-green-600 bg-green-50';
    if (color === 'error') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const computedPercentage = percentage ?? (total ? (value / total) * 100 : 0);

  return (
    <div className="rounded-xl border border-gray-100 px-3.5 py-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <div className="flex items-center gap-2">
          {total && <span className="text-xs text-gray-400">of {total}</span>}
          <span className={`rounded-lg px-2.5 py-1 text-sm font-semibold ${getColorClass()}`}>
            {value}
            {percentage !== undefined && ` (${Math.round(percentage)}%)`}
          </span>
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`${color === 'success' ? 'bg-emerald-500' : color === 'error' ? 'bg-red-500' : 'bg-blue-500'} h-full rounded-full transition-all duration-500`}
          style={{ width: `${Math.max(0, Math.min(100, computedPercentage))}%` }}
        />
      </div>
    </div>
  );
}

// Quick Action Button Component
function QuickActionButton({ label, description, href, icon: Icon }) {
  return (
    <motion.a
      href={href}
      whileHover={{ x: 4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="group flex items-center gap-4 rounded-xl border border-white/80 bg-white/90 p-3.5 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md"
    >
      <div className="rounded-lg bg-blue-100 p-2 transition-colors group-hover:bg-blue-200">
        <Icon size={20} className="text-blue-600" />
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{label}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
      <ArrowUpRight size={18} className="text-gray-400 transition-colors group-hover:text-blue-600" />
    </motion.a>
  );
}
