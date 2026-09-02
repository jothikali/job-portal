import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (msg: string) => sonnerToast.success(msg, { duration: 3000 }),
  error:   (msg: string) => sonnerToast.error(msg,   { duration: 4000 }),
  warn:    (msg: string) => sonnerToast.warning(msg, { duration: 4000 }),
  info:    (msg: string) => sonnerToast.info(msg,    { duration: 3000 }),
};
