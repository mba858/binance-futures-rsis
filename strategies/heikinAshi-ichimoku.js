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

const ichimokuInput = {
  high: [],
  low: [],
  conversionPeriod: 9,
  basePeriod: 26,
  spanPeriod: 52,
  displacement: 26
};

const heikinAshiResults = [];
const heikinAshiCandle = new ta.HeikinAshi(inputHeikinAshi);

const heikinAshiIchimokuStrategy = (open, high, low, close) => {
  heikinAshiResults.push(heikinAshiCandle.nextValue({
    open: parseFloat(open),
    high: parseFloat(high),
    low: parseFloat(low),
    close: parseFloat(close)
  }));
  ichimokuInput.high.push(parseFloat(high));
  ichimokuInput.low.push(parseFloat(low));

  if (heikinAshiResults.length > 52) {
    const ichimoku = ta.IchimokuCloud.calculate(ichimokuInput);

    const oldHeikinAshi = heikinAshiResults[heikinAshiResults.length - 3];
    const previousHeikinAshi = heikinAshiResults[heikinAshiResults.length - 2];
    const latestHeikinAshi = heikinAshiResults[heikinAshiResults.length - 1];
    const latestIchimoku = ichimoku[ichimoku.length - 1];

    const previousCandleDoji = ((parseFloat(((previousHeikinAshi.close - previousHeikinAshi.open) / previousHeikinAshi.close) * 100).toFixed(3)) < 0.3 || (parseFloat(((previousHeikinAshi.open - previousHeikinAshi.close) / previousHeikinAshi.open) * 100).toFixed(3)) < 0.3) && (previousHeikinAshi.high > previousHeikinAshi.close || previousHeikinAshi.high > previousHeikinAshi.open) && (previousHeikinAshi.low < previousHeikinAshi.open || previousHeikinAshi.low < previousHeikinAshi.close);
    const latestCandleDoji = ((parseFloat(((latestHeikinAshi.close - latestHeikinAshi.open) / latestHeikinAshi.close) * 100).toFixed(3)) < 0.3 || (parseFloat(((latestHeikinAshi.open - latestHeikinAshi.close) / latestHeikinAshi.open) * 100).toFixed(3)) < 0.3) && (latestHeikinAshi.high > latestHeikinAshi.close || latestHeikinAshi.high > latestHeikinAshi.open) && (latestHeikinAshi.low < latestHeikinAshi.open || latestHeikinAshi.low < latestHeikinAshi.close);

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
    const buySignal = bullishIndicator && latestIchimoku.spanA > latestIchimoku.spanB && close > latestIchimoku.spanA;
    const sellSignal = (bearishIndicator && latestIchimoku.spanA < latestIchimoku.spanB && close < latestIchimoku.spanA) || previousCandleDoji && latestCandleDoji;

    if (buySignal) {
      console.log('Entering upward trend. Bullish!');
      if (!inPosition) {
        console.log(`Buy at ${close}`);
        try {
          fs.writeFileSync('/Users/mac/Desktop/Extras/crypto-bot-master/logs/heikinAshi-ichimoku.txt', `buy at ${close}` + "\n", { flag: 'a+' });
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
          fs.writeFileSync('/Users/mac/Desktop/Extras/crypto-bot-master/logs/heikinAshi-ichimoku.txt', `sell at ${close}` + "\n", { flag: 'a+' });
        } catch (err) {
            console.error(err)
        }
        // sell binance order logic here
        profit += close - lastBuy;
        inPosition = false;
        try {
          fs.writeFileSync('/Users/mac/Desktop/Extras/crypto-bot-master/logs/heikinAshi-ichimoku.txt', `profit at ${profit}` + "\n", { flag: 'a+' });
        } catch (err) {
            console.error(err)
        }
      }
    }
  }
};

module.exports = heikinAshiIchimokuStrategy;
