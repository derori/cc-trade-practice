#!/bin/env node

"use strict";
const zaif = require('zaif.jp');
const kraken = require('kraken-api');
const https = require('https');
// const PoloniexPublicClient = require('poloniex-public-client');
// const polo = new PoloniexPublicClient();
const async = require('async');
const prettyjson = require('prettyjson');


var krakenapi = new kraken();
//var kraken = new KrakenClient('api_key', 'api_secret');
var zaifapi = zaif.PublicApi;


var t = {};
async.series({
    zaif: function(cb){
        zaifapi.lastPrice('btc_jpy').then(function(e){
            t.zaif = e.last_price;
            cb();
        });
    },
    kraken: function(cb){
        krakenapi.api('Ticker', {"pair": "XXBTZJPY"}, function(e, d){
            t.kraken = d.result.XXBTZJPY.a[0];
            t.kraken = Number(t.kraken);
            cb();
        });
    },
    coincheck: function(cb){
        https.get('https://coincheck.jp/api/ticker', (res) => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => rawData += chunk);
            res.on('end', () => {
                try {
                    let parsedData = JSON.parse(rawData);
                    t.coincheck = parsedData.last;
                    cb();
                } catch (e) {
                    console.log(e.message);
                }
            });
        }).on('error', (e) => {
            console.error(e);
        });
    }
}, function complete(){
    console.log("BTC/JPY");
    console.log(prettyjson.render(t));
});

