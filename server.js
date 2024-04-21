const express = require('express');
const winston = require('winston');

const app = express();
const port = 3000;

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'calculate-service' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

function validateNumbers(n1, n2) {
    if (isNaN(n1) || isNaN(n2)) {
        throw new Error("Invalid number format");
    }
}

function calculate(operation, n1, n2) {
    switch (operation) {
        case 'add':
            return n1 + n2;
        case 'sub':
            return n1 - n2;
        case 'multiply':
            return n1 * n2;
        case 'divide':
            if (n2 === 0) {
                throw new Error("Division by zero is not allowed");
            }
            return n1 / n2;
        default:
            throw new Error("Invalid operation");
    }
}

app.get("/:operation", (req, res) => {
    try {
        const operation = req.params.operation;
        const n1 = parseFloat(req.query.n1);
        const n2 = parseFloat(req.query.n2);

        validateNumbers(n1, n2);

        logger.info(`Operation ${operation} with parameters ${n1} and ${n2}`);
        
        const result = calculate(operation, n1, n2);
        res.status(200).json({ statuscode: 200, data: result });
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ statuscode: 500, msg: error.message });
    }
});

app.listen(port, () => {
    logger.info(`Server is listening on port ${port}`);
});
