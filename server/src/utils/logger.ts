export const logger = {
  info: (msg: string, meta?: Record<string, any>) => {
    console.log(JSON.stringify({ level: 'info', time: new Date().toISOString(), message: msg, ...meta }));
  },
  warn: (msg: string, meta?: Record<string, any>) => {
    console.warn(JSON.stringify({ level: 'warn', time: new Date().toISOString(), message: msg, ...meta }));
  },
  error: (msg: string, meta?: Record<string, any>) => {
    console.error(JSON.stringify({ level: 'error', time: new Date().toISOString(), message: msg, ...meta }));
  },
};
