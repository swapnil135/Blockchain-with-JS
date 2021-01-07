const Blockchain = require('./Blockchain');
const bitcoin = new Blockchain();

const previousBlockHash='H123JBI412H144J2K';
const currentBlockData=[
  {
    amount:10,
    sender:'ASD1844BSD',
    recipient:'123SDFASD'
  }
]
const nonce=bitcoin.proofOfWork(previousBlockHash,currentBlockData);
console.log(nonce);
console.log(bitcoin.hashBlock(previousBlockHash,currentBlockData,nonce));
