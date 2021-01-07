function Blockchain()
{
  this.chain=[];
  this.pendingTransactions=[];
}

Blockchain.prototype.createNeBlock = function(nonce,previousBlockHash,hash)
{
  const newBlock ={
    index:this.chain.length+1,
    timestamp:Date.now(),
    // all of the transactions in this block will be the transactions that waiting to be put in a block
    transactions:this.pendingTransactions,
    // nonce is hust a number giving proof of the transaction
    nonce:nonce,
    hash:hash,
    previousBlockHash: previousBlockHash
  }
  // As we move all the pending transactions to the new block, we clear this array
  this.pendingTransactions=[];
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
    recipient:recepeint};
  }
  // push the newly created transaction in the pendingTransactions array
  // All the transactions in this pendinfTransactions array are not validated, that happens when a new black is created
  this.pendingTransactions.push(newTransaction);

  // Return the index of the block of which this transaction will be part of
  return this.getLastBlock()['index']+1;
}

module.exports=Blockchain;
