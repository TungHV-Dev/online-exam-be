const winston = require('winston')
const { DATE_FORMAT } = require('../utils/constant')

const logger = winston.createLogger({
    // format của log được kết hợp thông qua format.combine
    format: winston.format.combine(
        winston.format.splat(),
        // Định dạng time cho log
        winston.format.timestamp({
            format: DATE_FORMAT.YYYY_MM_DD_HH_mm_ss
        }),
        // thiết lập định dạng của log
        winston.format.printf(
            log => {
                // nếu log là error hiển thị stack trace còn không hiển thị message của log 
                if (log.stack) {
                    return `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.stack}`;
                }
                return `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`;
            },
        ),
    ),
    transports: [
        // hiển thị log thông qua console
        new winston.transports.Console(),
    ],
})

module.exports = logger