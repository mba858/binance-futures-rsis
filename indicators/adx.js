const fs = require('fs');

const ta = require('technicalindicators');

const adxInput = {
  close: [],
  high: [],
  low: [],
  period: 14
};

let inPositionAdx = false;
let lastBuy;
let profit = 0;

const calculateAdx = (high, low, close) => {
  adxInput.high.push(parseFloat(high));
  adxInput.low.push(parseFloat(low));
  adxInput.close.push(parseFloat(close));

  if (adxInput.close.length > adxInput.period) {
    const adx = ta.ADX.calculate(adxInput);
    const latestAdx = adx[adx.length - 1];
    console.log('latestAdx', latestAdx);

    if (latestAdx && latestAdx.adx > 25 && latestAdx.pdi > latestAdx.mdi) {
      console.log('adx lines have detected an upward trend. Buyers in control!');

      if (!inPositionAdx) {
        console.log(`buy at ${close}`);
        try {
          fs.writeFileSync('/Users/mac/Desktop/Extras/crypto-bot-master/logs/adx.txt', `buy at ${close}` + "\n", { flag: 'a+' });
        } catch (err) {
            console.error(err)
        }
        // buy binance order logic here
        lastBuy = close;
        inPositionAdx = true;
      }
    }

    if (latestAdx && latestAdx.adx > 25 && latestAdx.pdi < latestAdx.mdi) {
      console.log('adx lines have detected a downward trend. Sellers in control!');

      if (inPositionAdx) {
        console.log(`sell at ${close}`);
        try {
          fs.writeFileSync('/Users/mac/Desktop/Extras/crypto-bot-master/logs/adx.txt', `sell at ${close}` + "\n", { flag: 'a+' });
        } catch (err) {
            console.error(err)
        }
        // sell binance order logic here
        profit = close - lastBuy;
        inPositionAdx = false;
        try {
          fs.writeFileSync('/Users/mac/Desktop/Extras/crypto-bot-master/logs/adx.txt', `profit at ${profit}` + "\n", { flag: 'a+' });
        } catch (err) {
            console.error(err)
        }
      }
    }

    if (latestAdx && latestAdx.adx < 25 && latestAdx.pdi < 25 && latestAdx.mdi < 25) {
      console.log('adx lines have detected a non trending market');
      try {
        fs.writeFileSync('/Users/mac/Desktop/Extras/crypto-bot-master/logs/adx.txt', "non trending market" + "\n", { flag: 'a+' });
      } catch (err) {
          console.error(err)
      }
    }
  }
}

module.exports = calculateAdx;
