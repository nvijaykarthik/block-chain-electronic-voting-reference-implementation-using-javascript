var express = require('express');
var router = express.Router();
const blockChain = require('./blockchain');
const request = require('request');
const reqPromise = require('request-promise');
const uuid = require('uuid');
const www = require('../bin/www');
var serverInfo = require('./Server-info');

var pushChain = () => {
    let chain = blockChain.SingletonBlockChain.getInstance();

}

var broadCastTransaction = (transaction) => {
    let chain = blockChain.SingletonBlockChain.getInstance();
    const requests = [];
    var nodes = chain.networkNodes;
    nodes.forEach(node => {
        if (chain.mynodeUrl != node) {
            let reqOption = {
                uri: node + '/transaction/broadcast',
                method: 'POST',
                body: { voter: transaction.voter, candidate: transaction.candidate, vote: transaction.vote, id: transaction.id },
                json: true,
                proxy: '' // set this to bypass system proxy
            }
            requests.push(reqPromise(reqOption));
        }
    });
    console.log(requests)
    return requests;
}
var updateMyChain = () => {
    let chain = blockChain.SingletonBlockChain.getInstance();
    var nodes = [];
    nodes = chain.networkNodes;
    if (nodes.length > 0) {
        var rand = nodes[Math.floor(Math.random() * nodes.length)];
        let reqOption = {
            uri: rand + '/blockchain/chain',
            method: 'GET',
            json: true,
            proxy: '' // set this to bypass system proxy
        }
        request(reqOption, function (error, response, body) {
            if (error) {
                console.error("Error Updating my block with the existing chain", error)
            } else {
                let chain = blockChain.SingletonBlockChain.getInstance();
                if (chain.isTempChainValid(body.chain)) {
                    chain.updateChain(body.chain, body.pendingTransactions)
                    console.log("chain Updated");
                }
                else {
                    console.log("Invalid chain");
                }
            }
        })
    }
}

module.exports = {
    pushChain,
    broadCastTransaction,
    updateMyChain
}

