const fs = require('fs');

const ta = require('technicalindicators');

let inPositionStochastic = false;
let lastBuy;
let profit = 0;

const inputStochastic = {
  high: [],
  low: [],
  close: [],
  period: 14,
  signalPeriod: 3
}

const calculateStochastic = (high, low, close) => {
  inputStochastic.high.push(parseFloat(high));
  inputStochastic.low.push(parseFloat(low));
  inputStochastic.close.push(parseFloat(close));

  if (inputStochastic.close.length > inputStochastic.period) {
    const stochastic = ta.Stochastic.calculate(inputStochastic);
    const latestStochastic = stochastic[stochastic.length - 1];

    if (latestStochastic.k < 20 && latestStochastic.d < 20) {
      console.log('stochastic lines indicate oversold!');
      if (!inPositionStochastic) {
        console.log(`buy at ${close}`);
        try {
          fs.writeFileSync('/Users/mac/Desktop/Extras/crypto-bot-master/logs/stochastic.txt', `buy at ${close}` + "\n", { flag: 'a+' });
        } catch (err) {
            console.error(err)
        }
        // buy binance order logic here
        lastBuy = close;
        inPositionStochastic = true;
      }
    }

    if (latestStochastic.k > 80 && latestStochastic.d > 80) {
      console.log('stochastic lines indicate overbought!');
      if (inPositionStochastic) {
        console.log(`sell at ${close}`);
        try {
          fs.writeFileSync('/Users/mac/Desktop/Extras/crypto-bot-master/logs/stochastic.txt', `sell at ${close}` + "\n", { flag: 'a+' });
        } catch (err) {
            console.error(err)
        }
        // sell binance order logic here
        profit = close - lastBuy;
        inPositionStochastic = false;
        try {
          fs.writeFileSync('/Users/mac/Desktop/Extras/crypto-bot-master/logs/stochastic.txt', `profit at ${profit}` + "\n", { flag: 'a+' });
        } catch (err) {
            console.error(err)
        }
      }
    }
  }
};

module.exports = calculateStochastic;
