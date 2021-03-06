const sha256 = require('sha256');
// Creates a unique random string to be used for the address of this instance of the api
const uuid = require('uuid').v4;
// Retrieveing the url of the network_node through the argument passed
const currentNodeUrl =process.argv[3];
function Blockchain()
{
  // This is the chain of blocks
  this.chain=[];
  this.pendingTransactions=[];
  this.currentNodeUrl=currentNodeUrl;
  this.networkNodes =[];
  // This is the genesis block or the starting of the blockchain
  this.createNewBlock(100,'0','0');
}

Blockchain.prototype.createNewBlock = function(nonce,previousBlockHash,hash)
{
  const newBlock ={
    index:this.chain.length+1,
    timestamp:Date.now(),
    // all of the transactions in this block will be the transactions that waiting to be put in a block
    transactions:this.pendingTransactions,
    // nonce is just a number giving proof of the transaction
    nonce:nonce,
    hash:hash,
    previousBlockHash: previousBlockHash
  }
  // As we move all the pending transactions to the new block, we clear this array
  this.pendingTransactions=[];
  // Push this newBlock into the chain of blocks
  this.chain.push(newBlock);
  return newBlock; n
}
Blockchain.prototype.getLastBlock=function()
{
  return this.chain[this.chain.length-1];
}
Blockchain.prototype.createNewTransaction=function(amount,sender,recepeint)
{
  const newTransaction={
    amount:amount,
    sender: sender,
    recipient:recepeint,
    transactionId: uuid().split('-').join('')
  }

  return newTransaction;
}

Blockchain.prototype.addTransactionToPendingTransaction= function(transaction)
{
  // push the newly transaction in the pendingTransactions array
  // All the transactions in this pendinfTransactions array are not validated, that happens when a new black is created
  this.pendingTransactions.push(transaction);

  // Return the index of the block of which this transaction will be part of
  return this.getLastBlock()['index']+1;
}

// This method takes in a block and generates a hash for it
// We will use a hashing function SHA-256
Blockchain.prototype.hashBlock= function(previousBlockHash,currentBlockData,nonce)
{
  // convert the block data into a single string
  const dataAsString=previousBlockHash+nonce.toString()+JSON.stringify(currentBlockData);
  const hash=sha256(dataAsString);
  return hash;
}

Blockchain.prototype.proofOfWork=function(previousBlockHash,currentBlockData)
{
  let nonce=0;
  let hash=this.hashBlock(previousBlockHash,currentBlockData,nonce);
  while(hash.slice(0,4)!='0000')
  {
    nonce++;
    hash=this.hashBlock(previousBlockHash,currentBlockData,nonce);
  }
  return nonce;
}
 // checking if the chain is valid or not
Blockchain.prototype.chainIsValid = function(blockchain)
{
  let validChain=true;
  // comparing the previousblockhash and current block hash over the entire chain
  for(var i=1;i<blockchain.length;i++)
  {
    const currentBlock = blockchain[i];
    const previousBlock = blockchain[i-1];
    const currentBlockData={
      transactions: currentBlock.transactions,
      index: currentBlock.index
    };
    const blockHash = this.hashBlock(previousBlock.hash,currentBlockData,currentBlock.nonce);
    if(blockHash.substring(0,4)!=='0000') validChain=false;
    console.log(currentBlock.previousBlockHash+ "==" +previousBlock.hash);
    if(currentBlock.previousBlockHash!==previousBlock.hash) //chain is not valid
    validChain=false;
  }
  // checking the genesis block
  const genesisBlock = blockchain[0];
  const correctNonce = genesisBlock.nonce===100;
  const correctPreviousBlockHash = genesisBlock.previousBlockHash ==='0';
  const correctTransaction = genesisBlock.transactions.length===0;
  if(!(correctNonce && correctPreviousBlockHash && correctTransaction)) validChain=false;

  return validChain;
}


Blockchain.prototype.getBlock = function(blockHash)
{
  let correctBlock = null;
  this.chain.forEach(block => {
    if(block.hash===blockHash) correctBlock=block;
  });
  return correctBlock;
};

Blockchain.prototype.getTransaction = function(transactionId) {
  let correctTransaction=null;
  let correctBlock = null
  this.chain.forEach(block=>{
    block.transactions.forEach(transaction=>
    {
      if(transaction.transactionId===transactionId)
      {
         correctTransaction=transaction;
         correctBlock=block;
      };
    });
  });
  return {
    transaction: correctTransaction,
    block: correctBlock
  };
};

Blockchain.prototype.getAddressData = function(address){
  const addressTransactions=[];
  this.chain.forEach(block=> {
    block.transactions.forEach(transaction => {
      if(transaction.sender===address || transaction.recipient==address) addressTransactions.push(transaction);
    });
  });
  let balance=0;
  addressTransactions.forEach(transaction=>{
    if(transaction.recipient==address) balance+=transaction.amount;
    else balance-=transaction.amount;
  })
  return {
    addressTransactions: addressTransactions,
    addressBalance: balance
  };
};


module.exports=Blockchain;
