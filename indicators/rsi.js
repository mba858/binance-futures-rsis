const ta = require('technicalindicators');

const calculateRSI = (inputRSI, close) => {
    inputRSI.values.push(parseFloat(close));

    if (inputRSI.values.length > inputRSI.PERIOD) {
        const rsi = ta.RSI.calculate(inputRSI);
        const latestRsi = rsi[rsi.length - 1];

        return inputRSI;
    }
};

module.exports = calculateRSI;