import { toast } from 'react-toastify';

export const showToast = {
    success: (message) => toast.success(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'bg-emerald-50 border border-emerald-200',
        progressClassName: 'bg-emerald-600',
    }),

    error: (message) => toast.error(message, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'bg-red-50 border border-red-200',
        progressClassName: 'bg-red-600',
    }),

    info: (message) => toast.info(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'bg-blue-50 border border-blue-200',
        progressClassName: 'bg-blue-600',
    }),

    warning: (message) => toast.warn(message, {
        position: "top-right",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'bg-yellow-50 border border-yellow-200',
        progressClassName: 'bg-yellow-600',
    }),
};
