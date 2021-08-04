const webSocket = require('ws');
const Binance = require('binance-api-node').default;
const client = Binance({
    apiKey: '',
    apiSecret: ''
});
const ta = require('technicalindicators');

const calculateRSI = require('./indicators/rsi');
const RSI_CALCULATOR = require('./indicators/rsi_calculator');
const calculateHeikinAshi = require('./indicators/heikinAshi');
const calculateBollingerBands = require('./indicators/bollingerBands');
const calculateMacd = require('./indicators/macd');

const app = require('express')();
const http = require('http').Server(app);
const cors = require('cors');
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});


app.use(cors())
    // const EXCHANGE = require('./binance_bot.js');
app.use(cors());
app.options('*', cors());


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


let CANDLE_TYPES = "15m";
let spotAnalytics = false;
if (process.argv[2] && process.argv[2].indexOf('type') >= 0) {
    let value = process.argv[2].split("=")[1];
    CANDLE_TYPES = value;

    if (process.argv[3] == 'spot')
        spotAnalytics = true;
}

const NO_OF_CANDLES_TO_FETCH = 150;
const PERIOD = 6;
let assets = [{
        "name": "BTCUSDT",
        "curr": null,
        "prev": null,
        "index": 0,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "ETHUSDT",
        "curr": null,
        "prev": null,
        "index": 1,
        "latestCandles": [],
        "active": true
    },
    {
        "name": "BCHUSDT",
        "curr": null,
        "prev": null,
        "index": 2,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "XRPUSDT",
        "curr": null,
        "prev": null,
        "index": 3,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "EOSUSDT",
        "curr": null,
        "prev": null,
        "index": 4,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "LTCUSDT",
        "curr": null,
        "prev": null,
        "index": 5,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "TRXUSDT",
        "curr": null,
        "prev": null,
        "index": 6,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "ETCUSDT",
        "curr": null,
        "prev": null,
        "index": 7,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "LINKUSDT",
        "curr": null,
        "prev": null,
        "index": 8,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "XLMUSDT",
        "curr": null,
        "prev": null,
        "index": 9,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "ADAUSDT",
        "curr": null,
        "prev": null,
        "index": 10,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "XMRUSDT",
        "curr": null,
        "prev": null,
        "index": 11,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "DASHUSDT",
        "curr": null,
        "prev": null,
        "index": 12,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "ZECUSDT",
        "curr": null,
        "prev": null,
        "index": 13,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "XTZUSDT",
        "curr": null,
        "prev": null,
        "index": 14,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "BNBUSDT",
        "curr": null,
        "prev": null,
        "index": 15,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "ATOMUSDT",
        "curr": null,
        "prev": null,
        "index": 16,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "ONTUSDT",
        "curr": null,
        "prev": null,
        "index": 17,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "IOTAUSDT",
        "curr": null,
        "prev": null,
        "index": 18,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "BATUSDT",
        "curr": null,
        "prev": null,
        "index": 19,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "VETUSDT",
        "curr": null,
        "prev": null,
        "index": 20,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "NEOUSDT",
        "curr": null,
        "prev": null,
        "index": 21,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "QTUMUSDT",
        "curr": null,
        "prev": null,
        "index": 22,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "IOSTUSDT",
        "curr": null,
        "prev": null,
        "index": 23,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "THETAUSDT",
        "curr": null,
        "prev": null,
        "index": 24,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "ALGOUSDT",
        "curr": null,
        "prev": null,
        "index": 25,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "ZILUSDT",
        "curr": null,
        "prev": null,
        "index": 26,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "KNCUSDT",
        "curr": null,
        "prev": null,
        "index": 27,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "ZRXUSDT",
        "curr": null,
        "prev": null,
        "index": 28,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "COMPUSDT",
        "curr": null,
        "prev": null,
        "index": 29,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "OMGUSDT",
        "curr": null,
        "prev": null,
        "index": 30,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "DOGEUSDT",
        "curr": null,
        "prev": null,
        "index": 31,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "SXPUSDT",
        "curr": null,
        "prev": null,
        "index": 32,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "KAVAUSDT",
        "curr": null,
        "prev": null,
        "index": 33,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "BANDUSDT",
        "curr": null,
        "prev": null,
        "index": 34,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "RLCUSDT",
        "curr": null,
        "prev": null,
        "index": 35,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "WAVESUSDT",
        "curr": null,
        "prev": null,
        "index": 36,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "MKRUSDT",
        "curr": null,
        "prev": null,
        "index": 37,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "SNXUSDT",
        "curr": null,
        "prev": null,
        "index": 38,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "DOTUSDT",
        "curr": null,
        "prev": null,
        "index": 39,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "DEFIUSDT",
        "curr": null,
        "prev": null,
        "index": 40,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "YFIUSDT",
        "curr": null,
        "prev": null,
        "index": 41,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "BALUSDT",
        "curr": null,
        "prev": null,
        "index": 42,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "CRVUSDT",
        "curr": null,
        "prev": null,
        "index": 43,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "TRBUSDT",
        "curr": null,
        "prev": null,
        "index": 44,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "YFIIUSDT",
        "curr": null,
        "prev": null,
        "index": 45,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "RUNEUSDT",
        "curr": null,
        "prev": null,
        "index": 46,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "SUSHIUSDT",
        "curr": null,
        "prev": null,
        "index": 47,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "SRMUSDT",
        "curr": null,
        "prev": null,
        "index": 48,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "BZRXUSDT",
        "curr": null,
        "prev": null,
        "index": 49,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "EGLDUSDT",
        "curr": null,
        "prev": null,
        "index": 50,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "SOLUSDT",
        "curr": null,
        "prev": null,
        "index": 51,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "ICXUSDT",
        "curr": null,
        "prev": null,
        "index": 52,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "STORJUSDT",
        "curr": null,
        "prev": null,
        "index": 53,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "BLZUSDT",
        "curr": null,
        "prev": null,
        "index": 54,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "UNIUSDT",
        "curr": null,
        "prev": null,
        "index": 55,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "AVAXUSDT",
        "curr": null,
        "prev": null,
        "index": 56,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "FTMUSDT",
        "curr": null,
        "prev": null,
        "index": 57,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "HNTUSDT",
        "curr": null,
        "prev": null,
        "index": 58,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "ENJUSDT",
        "curr": null,
        "prev": null,
        "index": 59,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "FLMUSDT",
        "curr": null,
        "prev": null,
        "index": 60,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "TOMOUSDT",
        "curr": null,
        "prev": null,
        "index": 61,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "RENUSDT",
        "curr": null,
        "prev": null,
        "index": 62,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "KSMUSDT",
        "curr": null,
        "prev": null,
        "index": 63,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "NEARUSDT",
        "curr": null,
        "prev": null,
        "index": 64,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "AAVEUSDT",
        "curr": null,
        "prev": null,
        "index": 65,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "FILUSDT",
        "curr": null,
        "prev": null,
        "index": 66,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "RSRUSDT",
        "curr": null,
        "prev": null,
        "index": 67,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "LRCUSDT",
        "curr": null,
        "prev": null,
        "index": 68,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "MATICUSDT",
        "curr": null,
        "prev": null,
        "index": 69,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "OCEANUSDT",
        "curr": null,
        "prev": null,
        "index": 70,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "CVCUSDT",
        "curr": null,
        "prev": null,
        "index": 71,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "BELUSDT",
        "curr": null,
        "prev": null,
        "index": 72,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "CTKUSDT",
        "curr": null,
        "prev": null,
        "index": 73,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "AXSUSDT",
        "curr": null,
        "prev": null,
        "index": 74,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "ALPHAUSDT",
        "curr": null,
        "prev": null,
        "index": 75,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "ZENUSDT",
        "curr": null,
        "prev": null,
        "index": 76,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "SKLUSDT",
        "curr": null,
        "prev": null,
        "index": 77,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "GRTUSDT",
        "curr": null,
        "prev": null,
        "index": 78,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "1INCHUSDT",
        "curr": null,
        "prev": null,
        "index": 79,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "BTCBUSD",
        "curr": null,
        "prev": null,
        "index": 80,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "AKROUSDT",
        "curr": null,
        "prev": null,
        "index": 81,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "CHZUSDT",
        "curr": null,
        "prev": null,
        "index": 82,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "SANDUSDT",
        "curr": null,
        "prev": null,
        "index": 83,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "ANKRUSDT",
        "curr": null,
        "prev": null,
        "index": 84,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "LUNAUSDT",
        "curr": null,
        "prev": null,
        "index": 85,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "BTSUSDT",
        "curr": null,
        "prev": null,
        "index": 86,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "LITUSDT",
        "curr": null,
        "prev": null,
        "index": 87,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "UNFIUSDT",
        "curr": null,
        "prev": null,
        "index": 88,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "DODOUSDT",
        "curr": null,
        "prev": null,
        "index": 89,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "REEFUSDT",
        "curr": null,
        "prev": null,
        "index": 90,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "RVNUSDT",
        "curr": null,
        "prev": null,
        "index": 91,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "SFPUSDT",
        "curr": null,
        "prev": null,
        "index": 92,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "XEMUSDT",
        "curr": null,
        "prev": null,
        "index": 93,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "COTIUSDT",
        "curr": null,
        "prev": null,
        "index": 95,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "CHRUSDT",
        "curr": null,
        "prev": null,
        "index": 96,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "MANAUSDT",
        "curr": null,
        "prev": null,
        "index": 97,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "ALICEUSDT",
        "curr": null,
        "prev": null,
        "index": 98,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "HBARUSDT",
        "curr": null,
        "prev": null,
        "index": 101,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "ONEUSDT",
        "curr": null,
        "prev": null,
        "index": 102,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "LINAUSDT",
        "curr": null,
        "prev": null,
        "index": 103,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "STMXUSDT",
        "curr": null,
        "prev": null,
        "index": 104,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "DENTUSDT",
        "curr": null,
        "prev": null,
        "index": 105,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "CELRUSDT",
        "curr": null,
        "prev": null,
        "index": 106,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "HOTUSDT",
        "curr": null,
        "prev": null,
        "index": 107,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "MTLUSDT",
        "curr": null,
        "prev": null,
        "index": 108,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "OGNUSDT",
        "curr": null,
        "prev": null,
        "index": 109,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "BTTUSDT",
        "curr": null,
        "prev": null,
        "index": 110,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "NKNUSDT",
        "curr": null,
        "prev": null,
        "index": 111,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "SCUSDT",
        "curr": null,
        "prev": null,
        "index": 112,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "DGBUSDT",
        "curr": null,
        "prev": null,
        "index": 113,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "1000SHIBUSDT",
        "curr": null,
        "prev": null,
        "index": 114,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "ICPUSDT",
        "curr": null,
        "prev": null,
        "index": 115,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "BAKEUSDT",
        "curr": null,
        "prev": null,
        "index": 116,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "GTCUSDT",
        "curr": null,
        "prev": null,
        "index": 117,
        "latestCandles": [],
        "active": false
    },
    {
        "name": "ETHBUSD",
        "curr": null,
        "prev": null,
        "index": 118,
        "latestCandles": [],
        "active": false
    }
]

const getPreviousCandles = async(asset) => {
    let inputRSI = {
        values: [],
        period: PERIOD
    };
    const inputBollingerBands = {
        period: 21,
        values: [],
        stdDev: 2
    };
    return new Promise(async(resolve, reject) => {
        try {
            let candles = await client.futuresCandles({ symbol: asset.name, interval: CANDLE_TYPES, limit: NO_OF_CANDLES_TO_FETCH });
            let lastClose;
            candles.forEach(async(candle) => {
                inputRSI.values.push(parseFloat(candle.close));
                inputBollingerBands.values.push(parseFloat(candle.close));
            });
            asset['inputRSI'] = inputRSI;
            asset['inputBollingerBands'] = inputBollingerBands;
            // resolve();
            lastClose = candles[candles.length - 1].close;
            const rsi = ta.RSI.calculate(inputRSI);
            const bollingerBands = ta.BollingerBands.calculate(inputBollingerBands);


            resolve({
                asset: asset,
                lastClose: lastClose,
                rsi5: Number(rsi[rsi.length - 6]),
                rsi4: Number(rsi[rsi.length - 5]),
                rsi3: Number(rsi[rsi.length - 4]),
                rsi2: Number(rsi[rsi.length - 3]),
                rsi1: Number(rsi[rsi.length - 2]),
                rsi0: Number(rsi[rsi.length - 1]),
                boll: bollingerBands[bollingerBands.length - 2],
                bollCurrent: bollingerBands[bollingerBands.length - 1]
            });
        } catch (e) {
            let candles = await client.futuresCandles({ symbol: asset.name, interval: CANDLE_TYPES, limit: NO_OF_CANDLES_TO_FETCH });
            candles.forEach(async(candle) => {
                inputRSI.values.push(parseFloat(candle.close));
                inputBollingerBands.values.push(parseFloat(candle.close));
            });
            asset['inputRSI'] = inputRSI;
            asset['inputBollingerBands'] = inputBollingerBands;
            // resolve();
            lastClose = candles[candles.length - 1].close;
            const rsi = ta.RSI.calculate(inputRSI);
            const bollingerBands = ta.BollingerBands.calculate(inputBollingerBands);


            resolve({
                asset: asset,
                lastClose: lastClose,
                rsi5: Number(rsi[rsi.length - 6]),
                rsi4: Number(rsi[rsi.length - 5]),
                rsi3: Number(rsi[rsi.length - 4]),
                rsi2: Number(rsi[rsi.length - 3]),
                rsi1: Number(rsi[rsi.length - 2]),
                rsi0: Number(rsi[rsi.length - 1]),
                boll: bollingerBands[bollingerBands.length - 2],
                bollCurrent: bollingerBands[bollingerBands.length - 1]
            });
        };
    });
}

const getPreviousSpotCandles = async(asset) => {
    let inputRSI = {
        values: [],
        period: PERIOD
    };
    const inputBollingerBands = {
        period: 21,
        values: [],
        stdDev: 2
    };

    return new Promise(async(resolve, reject) => {
        try {
            let candles = await client.candles({ symbol: asset.name, interval: CANDLE_TYPES, limit: NO_OF_CANDLES_TO_FETCH });
            let lastClose;
            candles.forEach(async(candle) => {
                inputRSI.values.push(parseFloat(candle.close));
                inputBollingerBands.values.push(parseFloat(candle.close));
            });
            lastClose = candles[candles.length - 1].close;
            const rsi = ta.RSI.calculate(inputRSI);
            const bollingerBands = ta.BollingerBands.calculate(inputBollingerBands);

            resolve({
                asset: asset,
                lastClose: lastClose,
                rsi5: Number(rsi[rsi.length - 6]),
                rsi4: Number(rsi[rsi.length - 5]),
                rsi3: Number(rsi[rsi.length - 4]),
                rsi2: Number(rsi[rsi.length - 3]),
                rsi1: Number(rsi[rsi.length - 2]),
                rsi0: Number(rsi[rsi.length - 1]),
                boll: bollingerBands[bollingerBands.length - 2],
                bollCurrent: bollingerBands[bollingerBands.length - 1]
            });
        } catch (e) {
            let candles = await client.candles({ symbol: asset.name, interval: CANDLE_TYPES, limit: NO_OF_CANDLES_TO_FETCH });
            let lastClose;
            candles.forEach(async(candle) => {
                inputRSI.values.push(parseFloat(candle.close));
                inputBollingerBands.values.push(parseFloat(candle.close));
            });
            lastClose = candles[candles.length - 1].close;
            const rsi = ta.RSI.calculate(inputRSI);
            const bollingerBands = ta.BollingerBands.calculate(inputBollingerBands);

            resolve({
                asset: asset,
                lastClose: lastClose,
                rsi5: Number(rsi[rsi.length - 6]),
                rsi4: Number(rsi[rsi.length - 5]),
                rsi3: Number(rsi[rsi.length - 4]),
                rsi2: Number(rsi[rsi.length - 3]),
                rsi1: Number(rsi[rsi.length - 2]),
                rsi0: Number(rsi[rsi.length - 1]),
                boll: bollingerBands[bollingerBands.length - 2],
                bollCurrent: bollingerBands[bollingerBands.length - 1]
            });
        };
    });
}

const futureAnalysis = async() => {

    let promises = [];
    try {
        assets.forEach(async(asset) => {
            // if (asset.active)
            promises.push(getPreviousCandles(asset));
        })
        let allRSIs = await Promise.all(promises);
        console.log("Done with previous candles capture.");
        console.log("----------------------------------------");
        allRSIs.sort((a, b) => a.rsi0 < b.rsi0 ? 1 : a.rsi0 > b.rsi0 ? -1 : 0);
        let maxPB = 0,
            minPB;
        allRSIs.forEach(async(rsi, index) => {
            if (((Number(rsi.lastClose) > Number(rsi.bollCurrent.upper)))) {
                console.log("...." + (rsi.bollCurrent.pb).toFixed(2));
            }

            if (((Number(rsi.lastClose) < Number(rsi.bollCurrent.lower))))
                console.log("****" + (rsi.bollCurrent.pb).toFixed(2));
            console.log("# " + index + ' ' + rsi.asset.name + '---> ' + rsi.rsi5 + " - " + rsi.rsi4 + " - " + rsi.rsi3 + " - " + rsi.rsi2 + " - " + rsi.rsi1 + " - " + rsi.rsi0 + '                        @' + (rsi.bollCurrent.pb).toFixed(2));
        });

        // assets.forEach((asset_) => {

        // })



        // assets.forEach(async(asset) => {
        //     // if (asset.active)
        //     client.ws.futuresCandles(asset.name, CANDLE_TYPES, async candle => {
        //         // console.log(candle);
        //         // console.log(asset.inputRSI.values[asset.inputRSI.values.length - 1]);
        //         if (!candle.isFinal) {
        //             asset.inputRSI.values[asset.inputRSI.values.length - 1] = parseFloat(candle.close);
        //             asset.inputBollingerBands.values[asset.inputBollingerBands.values.length - 1] = parseFloat(candle.close);
        //         } else {
        //             asset.inputRSI.values.pop();
        //             asset.inputRSI.values.push(parseFloat(candle.close));
        //             asset.inputBollingerBands.values.pop();
        //             asset.inputBollingerBands.values.push(parseFloat(candle.close));
        //         }

        //         const rsi = ta.RSI.calculate(asset.inputRSI);
        //         const bollingerBands = ta.BollingerBands.calculate(asset.inputBollingerBands);
        //         // if (asset.name == 'CRVUSDT')
        //         //     console.log(asset.name + '---> ' + rsi[rsi.length - 5] + " - " + rsi[rsi.length - 4] + " - " + rsi[rsi.length - 3] + " - " + rsi[rsi.length - 2] + " - " + rsi[rsi.length - 1] + '                        @' + (bollingerBands[bollingerBands.length - 1].pb).toFixed(2));
        //         io.emit('marketRsi', {
        //             index: asset.index,
        //             name: asset.name,
        //             rsi_10: rsi[rsi.length - 10],
        //             rsi_9: rsi[rsi.length - 9],
        //             rsi_8: rsi[rsi.length - 8],
        //             rsi_7: rsi[rsi.length - 7],
        //             rsi_6: rsi[rsi.length - 6],
        //             rsi_5: rsi[rsi.length - 5],
        //             rsi_4: rsi[rsi.length - 4],
        //             rsi_3: rsi[rsi.length - 3],
        //             rsi_2: rsi[rsi.length - 2],
        //             rsi_1: rsi[rsi.length - 1],
        //             boll_10: bollingerBands[bollingerBands.length - 10],
        //             boll_9: bollingerBands[bollingerBands.length - 9],
        //             boll_8: bollingerBands[bollingerBands.length - 8],
        //             boll_7: bollingerBands[bollingerBands.length - 7],
        //             boll_6: bollingerBands[bollingerBands.length - 6],
        //             boll_5: bollingerBands[bollingerBands.length - 5],
        //             boll_4: bollingerBands[bollingerBands.length - 4],
        //             boll_3: bollingerBands[bollingerBands.length - 3],
        //             boll_2: bollingerBands[bollingerBands.length - 2],
        //             boll_1: bollingerBands[bollingerBands.length - 1]
        //         });

        //     })
        // })

    } catch (e) {
        console.log(e);
    }
}

const spotAnalysis = async() => {

    let promises = [];
    try {
        let info = await client.exchangeInfo(),
            spotAssets = [];
        info.symbols.forEach((symbol) => {
            if (symbol.symbol.indexOf('USDT') >= 0)
                spotAssets.push({ name: symbol.symbol });
        });
        // console.log(spotAssets);

        spotAssets.forEach(async(asset) => {
            // if (asset.active)
            promises.push(getPreviousSpotCandles(asset));
        });
        let allRSIs = await Promise.all(promises);
        console.log("Done with previous candles capture.");
        allRSIs.sort((a, b) => a.rsi0 < b.rsi0 ? 1 : a.rsi0 > b.rsi0 ? -1 : 0);
        allRSIs.forEach((rsi, index) => {
            if (rsi.bollCurrent)
                if (((Number(rsi.lastClose) > Number(rsi.bollCurrent.upper))))
                    console.log("...." + (rsi.bollCurrent.pb).toFixed(2));
            if (rsi.bollCurrent)
                if (((Number(rsi.lastClose) < Number(rsi.bollCurrent.lower))))
                    console.log("****" + (rsi.bollCurrent.pb).toFixed(2));
            console.log("# " + index + ' ' + rsi.asset.name + '---> ' + rsi.rsi5 + " - " + rsi.rsi4 + " - " + rsi.rsi3 + " - " + rsi.rsi2 + " - " + rsi.rsi1 + " - " + rsi.rsi0);
            // console.log("# " + index + rsi.asset.name + ' @' + rsi.lastClose + '   ' + '---> ' + (rsi.bollCurrent.upper).toFixed(4) + "     -> " + (rsi.bollCurrent.lower).toFixed(4));
        });

        // console.log(assets[10]);
        // assets.forEach(async(asset) => {
        //     // if (asset.active)
        //     client.ws.futuresCandles(asset.name, CANDLE_TYPES, async candle => {
        //         oneMinuteCandleTechnicalAnalysis(candle, asset, true);
        //     })
        // })
    } catch (e) {
        console.log(e);
    }
}

(async function() {

    if (!spotAnalytics)
        futureAnalysis();
    else
        spotAnalysis();

})();