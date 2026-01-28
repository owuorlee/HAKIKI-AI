/**
 * Toast - System-level notification component for IFMIS simulation
 * Used for Treasury Lock and enforcement notifications
 */
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle, Lock, X } from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'danger' | 'warning';
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const config = {
        danger: {
            bg: 'bg-gradient-to-r from-red-600 to-red-700',
            border: 'border-red-500',
            shadow: 'shadow-red-900/50',
            Icon: Lock,
            title: 'SOVEREIGN ENFORCEMENT'
        },
        success: {
            bg: 'bg-gradient-to-r from-emerald-600 to-emerald-700',
            border: 'border-emerald-500',
            shadow: 'shadow-emerald-900/50',
            Icon: CheckCircle,
            title: 'SYSTEM UPDATE'
        },
        warning: {
            bg: 'bg-gradient-to-r from-orange-600 to-orange-700',
            border: 'border-orange-500',
            shadow: 'shadow-orange-900/50',
            Icon: ShieldAlert,
            title: 'WARNING'
        }
    };

    const { bg, border, shadow, Icon, title } = config[type];

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[70] ${bg} ${border} border 
                       text-white px-6 py-4 rounded-xl shadow-2xl ${shadow} flex items-center gap-4`}
        >
            <div className="p-2 bg-white/20 rounded-full">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-bold text-lg tracking-wide uppercase">{title}</h4>
                <p className="font-mono text-sm opacity-90">{message}</p>
            </div>
            <button
                onClick={onClose}
                className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

export default Toast;
