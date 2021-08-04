# Binance Future Market RSI values

A very quick way to get list of all future markets RSI values in one go. Basically it's difficult to analyse the whole market RSI values specially for day traders. So in one command you can have list of all 120+ future market RSI values in ascending order. By default it gives values for 15m timeframe but giving parameter with different time frames will provide relevant RSI values.

-- Spot market RSI values are also given, but I shortlisted to USDT pairs only. 
-- It offers current Bollingerband value as well. It helps to give you idea which market is out of band or within band.


## Quick Start

Install the dependencies:

```bash
npm install
```

Set the environment variables:

# Commands
```

node index.js type=15m
Type can be 1m, 3m, 5m, 15m, 30m, 1h, 4h, 1d, 1w, 1m

For spot market:

node index.js type=15 spot


