// importing the library
const express = require('express')

const app = express();

// This part of the code is to import the library to parse the data that comes in the post requests
const bodyparser= require('body-parser');
const Blockchain=require('./blockchain');
// Creates a unique random string to be used for the address of this instance of the api
const uuid = require ('uuid').v4;

const nodeAddress=uuid().split('-').join('');
const bitcoin = new Blockchain();

// If a request comes in with json or form data, parse the data
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));
// This is the first endpoint in out api
// When we hit this endpoint, it will send back to us our entire blockchain


app.get('/blockchain', function (req, res)
 {
   res.send(bitcoin);
})

// We will hit this endpoint to hit a new transaction
app.post('/transaction',function (req,res)
{
  const amount=req.body.amount;
  const sender=req.body.sender;
  const recipient=req.body.recipient;
  const blockIndex=bitcoin.createNewTransaction(amount,sender,recipient);
  // send this back to whoever mined this block
  res.json({note: 'Transaction will be added in block '+blockIndex});
});

// We will hit this to mine a new block
app.get('/mine',function(req,res){
  const lastBlock=bitcoin.getLastBlock();
  const previousBlockHash=lastBlock.hash;
  const currentBlockData={
    transactions:bitcoin.pendingTransactions,
    index:lastBlock.index+1
  };
  const nonce=bitcoin.proofOfWork(previousBlockHash,currentBlockData)
  const hash=bitcoin.hashBlock(previousBlockHash,currentBlockData,nonce);
  // Giving a reward to whoever mined this block
  // "00" signifies it is a reward
  bitcoin.createNewTransaction(12.5,"00",nodeAddress);
  const newBlock=bitcoin.createNewBlock(nonce,previousBlockHash,hash);
  // send this back to whoever mined this block
  res.json({note: "Block mined successfully",
            block: newBlock});
})


// Adding the function parameter so we know that the api is working
app.listen(3000,function(){
  console.log('listening on port 3000');
})
