import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { showToast } from '../utils/toast';
import { ToastContainer, } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { removeToast } from '../store/slice/toast-slice';

const ToastNotifier = () => {
    const dispatch = useDispatch();
    const mode = useSelector((state: RootState) => state.theme.mode);

    const toastItem = useSelector((state: RootState) => state.toast.queue[0]);

    useEffect(() => {
        if (toastItem) {
            const { message, type, position, autoClose, toastId, title } = toastItem;
            showToast(message, type as any, position as any, autoClose, toastId, title);

            const timeout = setTimeout(() => {
                dispatch(removeToast());
            }, typeof autoClose === 'number' ? autoClose : 3000);

            return () => {
                clearTimeout(timeout);
            };
        }
    }, [toastItem, dispatch]);

    return (
        <ToastContainer
            newestOnTop
            theme={mode === 'dark' ? 'dark' : 'light'}
            closeOnClick={false}
            style={{ top: '65px' }}
        />
    );
};

export default ToastNotifier;
