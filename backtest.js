const btcusdt = require('./historicalData/btc-usdt-4-hour.json');
const heikinAshiRsiStrategy = require('./strategies/heikinAshi-rsi');

btcusdt.forEach(candle => {
  const { price_open, price_close, price_high, price_low } = candle;

  heikinAshiRsiStrategy(price_open.toString(), price_high.toString(), price_low.toString(), price_close.toString());
});
