import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, User } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function RecognitionResult({ result, error }) {
  if (error) {
    return (
      <Card className="mt-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Recognition Failed</h4>
            <p className="text-gray-600 mt-1">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6"
    >
      <Card className="bg-green-50 border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={24} className="text-green-500" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-green-800">Attendance Marked</h4>
            <p className="text-sm text-green-600">Student recognized successfully</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Student</p>
              <p className="font-semibold text-gray-900">{result.studentName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Time</p>
              <p className="font-semibold text-gray-900">{result.attendanceTime}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Date</p>
              <p className="font-semibold text-gray-900">{result.attendanceDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <BadgeIcon size={20} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Status</p>
              <Badge status={result.status} />
            </div>
          </div>
        </div>

        {result.confidenceScore && (
          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">Confidence Score</span>
              <span className="font-semibold text-green-800">
                {(result.confidenceScore * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-2 h-2 bg-green-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.confidenceScore * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-green-500 rounded-full"
              />
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function Calendar({ size, className }) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function BadgeIcon({ size, className }) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
