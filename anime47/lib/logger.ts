type LogLevel = 'info' | 'warn' | 'error' | 'success'

const colors = {
  info: '\x1b[36m',    // cyan
  warn: '\x1b[33m',    // yellow
  error: '\x1b[31m',   // red
  success: '\x1b[32m', // green
  reset: '\x1b[0m',
}

class Logger {
  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const color = colors[level]
    const reset = colors.reset
    const levelStr = `[${level.toUpperCase()}]`
    
    let formatted = `${color}${timestamp} ${levelStr}${reset} ${message}`
    
    if (data) {
      formatted += `\n${JSON.stringify(data, null, 2)}`
    }
    
    return formatted
  }

  info(message: string, data?: any) {
    console.log(this.formatMessage('info', message, data))
  }

  warn(message: string, data?: any) {
    console.warn(this.formatMessage('warn', message, data))
  }

  error(message: string, error?: any) {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error
    console.error(this.formatMessage('error', message, errorData))
  }

  success(message: string, data?: any) {
    console.log(this.formatMessage('success', message, data))
  }
}

export const logger = new Logger()
