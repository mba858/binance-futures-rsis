const fs = require('fs');

const ta = require('technicalindicators');

const period = 14;

const obvInput = {
  close: [],
  volume: []
};

const calculateObv = (close, volume) => {
  obvInput.close.push(parseFloat(close));
  obvInput.volume.push(parseFloat(volume));

  if (obvInput.volume.length > period) {
    const obv = ta.OBV.calculate(obvInput);
    const latestObv = obv[obv.length - 1];

    console.log(`current on balance volume is ${latestObv}`);
    try {
      fs.writeFileSync('/Users/mac/Desktop/Extras/crypto-bot-master/logs/obv.txt', `current on balance volume is ${latestObv}` + "\n", { flag: 'a+' });
    } catch (err) {
        console.error(err)
    }
  }
};

module.exports = calculateObv;
