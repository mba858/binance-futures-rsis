const fs = require('fs');

const ta = require('technicalindicators');

let inPositionIchimoku = false;
let lastBuy;
let profit = 0;

const ichimokuInput = {
  high: [],
  low: [],
  conversionPeriod: 9,
  basePeriod: 26,
  spanPeriod: 52,
  displacement: 26
};

const calculateIchimoku = (high, low, close) => {
  ichimokuInput.high.push(parseFloat(high));
  ichimokuInput.low.push(parseFloat(low));

  if (ichimokuInput.low.length > ichimokuInput.spanPeriod) {
    const ichimoku = ta.IchimokuCloud.calculate(ichimokuInput);
    const latestIchimoku = ichimoku[ichimoku.length - 1];

    if (latestIchimoku.spanA > latestIchimoku.spanB) {
      console.log('ichimoku cloud has detected an uptrend!');
      if (close > latestIchimoku.spanA && !inPositionIchimoku) {
        console.log(`buy at ${close}`);
        try {
          fs.writeFileSync('/Users/mac/Desktop/Extras/crypto-bot-master/logs/ichimoku.txt', `buy at ${close}` + "\n", { flag: 'a+' });
        } catch (err) {
            console.error(err)
        }
        // buy binance order logic here
        lastBuy = close;
        inPositionIchimoku = true;
      }
    }

    if (latestIchimoku.spanA < latestIchimoku.spanB) {
      console.log('ichimoku cloud has detected a downtrend!');
      if (close < latestIchimoku.spanA && inPositionIchimoku) {
        console.log(`sell at ${close}`);
        try {
          fs.writeFileSync('/Users/mac/Desktop/Extras/crypto-bot-master/logs/ichimoku.txt', `sell at ${close}` + "\n", { flag: 'a+' });
        } catch (err) {
            console.error(err)
        }
        // sell binance order logic here
        profit = close - lastBuy;
        inPositionIchimoku = false;
        try {
          fs.writeFileSync('/Users/mac/Desktop/Extras/crypto-bot-master/logs/ichimoku.txt', `profit at ${profit}` + "\n", { flag: 'a+' });
        } catch (err) {
            console.error(err)
        }
      }
    }
  }
};

module.exports = calculateIchimoku;
