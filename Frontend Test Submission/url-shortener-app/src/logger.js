export function Log(source, level, category, message, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    source,
    level,
    category,
    message,
    data
  };
  
  console.log(`[${level.toUpperCase()}] ${category}: ${message}`, data);
}