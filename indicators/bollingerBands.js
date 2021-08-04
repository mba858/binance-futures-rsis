const fs = require('fs');
const moment = require('moment');
const ta = require('technicalindicators');

let inPositionBollinger = false;
let lastBuy;
let profit = 0;

const inputBollingerBands = {
    period: 21,
    values: [],
    stdDev: 2
};

const calculateBollingerBands = (close) => {
    inputBollingerBands.values.push(parseFloat(close));

    if (inputBollingerBands.values.length > inputBollingerBands.period) {
        const bollingerBands = ta.BollingerBands.calculate(inputBollingerBands);
        const latestBollinger = bollingerBands[bollingerBands.length - 1];
        // console.log("@" + close + " " + latestBollinger);
        console.log(latestBollinger);
        console.log(latestBollinger)
        if (latestBollinger.lower > close) {
            console.log('broke through bollinger lower! @ bollingerband');
            if (!inPositionBollinger) {
                console.log(`buy at ${close} ` + moment().format('dddd, MMMM Do YYYY, h:mm:ss a'));
                try {
                    fs.writeFileSync('/Users/mac/Desktop/Extras/crypto-bot-master/logs/bollingerBands.txt', `buy at ${close}` + "\n", { flag: 'a+' });
                } catch (err) {
                    console.error(err)
                }
                // buy binance order logic here
                lastBuy = close;
                inPositionBollinger = true;
            }
        }

        if (latestBollinger.upper < close) {
            console.log('broke through bollinger upper!');
            if (inPositionBollinger) {
                console.log(`sell at ${close} ` + moment().format('dddd, MMMM Do YYYY, h:mm:ss a'));
                try {
                    fs.writeFileSync('/Users/mac/Desktop/Extras/crypto-bot-master/logs/bollingerBands.txt', `sell at ${close}` + "\n", { flag: 'a+' });
                } catch (err) {
                    console.error(err)
                }
                // sell binance order logic
                profit = close - lastBuy;
                inPositionBollinger = false;
                try {
                    fs.writeFileSync('/Users/mac/Desktop/Extras/crypto-bot-master/logs/bollingerBands.txt', `profit at ${profit}` + "\n", { flag: 'a+' });
                } catch (err) {
                    console.error(err)
                }
            }
        }
    }
};

module.exports = calculateBollingerBands;