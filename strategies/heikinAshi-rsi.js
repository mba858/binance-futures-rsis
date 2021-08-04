const fs = require('fs');

const ta = require('technicalindicators');

let inPosition = false;
let lastBuy;
let profit = 0;

const inputHeikinAshi = {
  open: [],
  high: [],
  low: [],
  close: [],
  timestamp: [],
  volume: []
};

const inputRSI = {
  values: [],
  period: 14
};

const heikinAshiResults = [];
const heikinAshiCandle = new ta.HeikinAshi(inputHeikinAshi);

const heikinAshiRsiStrategy = (open, high, low, close) => {
  heikinAshiResults.push(heikinAshiCandle.nextValue({
    open: parseFloat(open),
    high: parseFloat(high),
    low: parseFloat(low),
    close: parseFloat(close)
  }));
  inputRSI.values.push(parseFloat(close));

  if (heikinAshiResults.length > inputRSI.period) {
    const rsi = ta.RSI.calculate(inputRSI);
    const oldHeikinAshi = heikinAshiResults[heikinAshiResults.length - 3];
    const previousHeikinAshi = heikinAshiResults[heikinAshiResults.length - 2];
    const latestHeikinAshi = heikinAshiResults[heikinAshiResults.length - 1];
    const latestRsi = rsi[rsi.length - 1];
    const previousRsi = rsi[rsi.length - 2];

    const previousCandleRedDoji = ((parseFloat(((previousHeikinAshi.open - previousHeikinAshi.close) / previousHeikinAshi.open) * 100).toFixed(3)) < 0.3) && (previousHeikinAshi.high > previousHeikinAshi.open) && (previousHeikinAshi.low < previousHeikinAshi.close);
    const latestCandleRedDoji = ((parseFloat(((latestHeikinAshi.open - latestHeikinAshi.close) / latestHeikinAshi.open) * 100).toFixed(3)) < 0.3) && (latestHeikinAshi.high > latestHeikinAshi.open) && (latestHeikinAshi.low < latestHeikinAshi.close);
    const previousCandleGreenDoji = ((parseFloat(((previousHeikinAshi.close - previousHeikinAshi.open) / previousHeikinAshi.close) * 100).toFixed(3)) < 0.3) && (previousHeikinAshi.high > previousHeikinAshi.close) && (previousHeikinAshi.low < previousHeikinAshi.open);
    const latestCandleGreenDoji = ((parseFloat(((latestHeikinAshi.close - latestHeikinAshi.open) / latestHeikinAshi.close) * 100).toFixed(3)) < 0.3) && (latestHeikinAshi.high > latestHeikinAshi.close) && (latestHeikinAshi.low < latestHeikinAshi.open);

    const oldCandleRed = oldHeikinAshi.close < oldHeikinAshi.open;
    const previousCandleRed = previousHeikinAshi.close < previousHeikinAshi.open;
    const previousCandleStrongRed = previousHeikinAshi.close < previousHeikinAshi.open && (parseFloat(((previousHeikinAshi.open - previousHeikinAshi.close) / previousHeikinAshi.open) * 100).toFixed(3) > 0.8) && previousHeikinAshi.open >= previousHeikinAshi.high;
    const latestCandleStrongRed = latestHeikinAshi.close < latestHeikinAshi.open && (parseFloat(((latestHeikinAshi.open - latestHeikinAshi.close) / latestHeikinAshi.open) * 100).toFixed(3) > 0.8) && latestHeikinAshi.open >= latestHeikinAshi.high;
    const oldCandleGreen = oldHeikinAshi.close > oldHeikinAshi.open;
    const oldCandleStrongGreen = oldHeikinAshi.close > oldHeikinAshi.open && (parseFloat(((oldHeikinAshi.close - oldHeikinAshi.open) / oldHeikinAshi.close) * 100).toFixed(3) > 0.8) && oldHeikinAshi.open >= oldHeikinAshi.low;
    const previousCandleGreen = previousHeikinAshi.close > previousHeikinAshi.open;
    const previousCandleStrongGreen = previousHeikinAshi.close > previousHeikinAshi.open && (parseFloat(((previousHeikinAshi.close - previousHeikinAshi.open) / previousHeikinAshi.close) * 100).toFixed(3) > 0.8) && previousHeikinAshi.open >= previousHeikinAshi.low;
    const latestCandleStrongGreen = latestHeikinAshi.close > latestHeikinAshi.open && (parseFloat(((latestHeikinAshi.close - latestHeikinAshi.open) / latestHeikinAshi.close) * 100).toFixed(3) > 0.8) && latestHeikinAshi.open >= latestHeikinAshi.low;

    const bullishIndicator = (oldCandleRed && previousCandleStrongGreen && latestCandleStrongGreen) || (oldCandleRed && previousCandleGreen && latestCandleStrongGreen);
    const bearishIndicator = (oldCandleGreen && previousCandleRed && latestCandleStrongRed) || (oldCandleGreen && previousCandleStrongRed) || (oldCandleStrongGreen && previousCandleStrongGreen && latestCandleStrongGreen);
    const buySignal = bullishIndicator && previousRsi < 50 && latestRsi > 50;
    const sellSignal = (bearishIndicator && previousRsi > 50 && latestRsi < 50) || (previousCandleRedDoji && latestCandleGreenDoji) || (previousCandleGreenDoji && latestCandleRedDoji) || (previousCandleRedDoji && latestCandleRedDoji) || (previousCandleGreenDoji && latestCandleGreenDoji);

    if (buySignal) {
      console.log('Entering upward trend. Bullish!');
      if (!inPosition) {
        console.log(`Buy at ${close}`);
        try {
          fs.writeFileSync('C:/Users/adamh/Desktop/crypto-bot/logs/heikinAshi-rsi.txt', `buy at ${close}` + "\n", { flag: 'a+' });
        } catch (err) {
            console.error(err)
        }
        // buy binance order logic here
        lastBuy = close;
        inPosition = true;
      }
    }

    if (sellSignal) {
      console.log('Entering downward trend. Bearish!');
      if (inPosition) {
        console.log(`sell at ${close}`);
        try {
          fs.writeFileSync('C:/Users/adamh/Desktop/crypto-bot/logs/heikinAshi-rsi.txt', `sell at ${close}` + "\n", { flag: 'a+' });
        } catch (err) {
            console.error(err)
        }
        // sell binance order logic here
        profit += close - lastBuy;
        inPosition = false;
        try {
          fs.writeFileSync('C:/Users/adamh/Desktop/crypto-bot/logs/heikinAshi-rsi.txt', `profit at ${profit}` + "\n", { flag: 'a+' });
        } catch (err) {
            console.error(err)
        }
      }
    }
  }
};

module.exports = heikinAshiRsiStrategy;
