const sha256 = require('sha256');
function Blockchain()
{
  // This is the chain of blocks
  this.chain=[];
  this.pendingTransactions=[];
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
    recipient:recepeint
  }
  // push the newly created transaction in the pendingTransactions array
  // All the transactions in this pendinfTransactions array are not validated, that happens when a new black is created
  this.pendingTransactions.push(newTransaction);

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

module.exports=Blockchain;
