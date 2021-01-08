// importing the library
const express = require('express')

const app = express();
// argv[2] refers to the port number in the package json file
const port = process.argv[2];
// This part of the code is to import the library to parse the data that comes in the post requests
const bodyparser = require('body-parser');
const Blockchain = require('./blockchain');
// Creates a unique random string to be used for the address of this instance of the api
const uuid = require('uuid').v4;
// Library to send api requests to other nodes
const rp=require('request-promise');
const nodeAddress = uuid().split('-').join('');
const bitcoin = new Blockchain();

// If a request comes in with json or form data, parse the data
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
  extended: false
}));
// This is the first endpoint in out api
// When we hit this endpoint, it will send back to us our entire blockchain


app.get('/blockchain', function(req, res) {
  res.send(bitcoin);
})

// We will hit this endpoint to hit a new transaction
app.post('/transaction', function(req, res) {
  const amount = req.body.amount;
  const sender = req.body.sender;
  const recipient = req.body.recipient;
  const blockIndex = bitcoin.createNewTransaction(amount, sender, recipient);
  // send this back to whoever mined this block
  res.json({
    note: 'Transaction will be added in block ' + blockIndex
  });
});
this endpoint broadcasts the new transaction to all the endpoints
app.post('/transaction/broadast', function(req,res)
{

})
// We will hit this to mine a new block
app.get('/mine', function(req, res) {
  const lastBlock = bitcoin.getLastBlock();
  const previousBlockHash = lastBlock.hash;
  const currentBlockData = {
    transactions: bitcoin.pendingTransactions,
    index: lastBlock.index + 1
  };
  const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData)
  const hash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
  // Giving a reward to whoever mined this block
  // "00" signifies it is a reward
  bitcoin.createNewTransaction(12.5, "00", nodeAddress);
  const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, hash);
  // send this back to whoever mined this block
  res.json({
    note: "Block mined successfully",
    block: newBlock
  });
})


// We hit this endpoint to register the networkNode and broadcast it to the whole network
app.post('/register-and-broadcast-node', function(req, res) {
  // The body of the request contains the URL of the new node to be registered
  const newNodeUrl = req.body.newNodeUrl;
  // Register this newNode with this node
  if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1 && newNodeUrl!==bitcoin.currentNodeUrl)
    bitcoin.networkNodes.push(newNodeUrl);
    console.log(newNodeUrl);
    const regNodesPromises=[];
    // Broadcasting the new node to all the nodes in the network in this for loop
    // We are hitting the register-node endpoint in all the existing nodes
    bitcoin.networkNodes.forEach(networkNodeUrl => {
      const requestOptions=
      {
        uri: networkNodeUrl + '/register-node',
        method: 'POST',
        body: {newNodeUrl: newNodeUrl},
        // sending it as json data
        json: true
      };
      regNodesPromises.push(rp(requestOptions));
    });
    // Registering all the existing nodes to the new node
    Promise.all(regNodesPromises).then(data => {
      const bulkRegisterOptions =
      {
        uri: newNodeUrl + '/register-nodes-bulk',
        method: 'POST',
        // We dont want an array inside an array so we use the ... notation
        body: {allNetworkNodes : [...bitcoin.networkNodes,bitcoin.currentNodeUrl]},
        json: true
      };

      return rp(bulkRegisterOptions);
    })
    .then(data=>
    {
      res.json({note: "new node registered successfully"});
    })
});
// Register the new node, whose url is in the body of the request to the node which receives this request
app.post('/register-node', function(req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  // Check if the node already is already registered
  if(bitcoin.networkNodes.indexOf(newNodeUrl)==-1 && bitcoin.currentNodeUrl!==newNodeUrl)
  bitcoin.networkNodes.push(newNodeUrl);
  res.json({note : "The  new node is successfully registerd with node " + bitcoin.port})
});
// register multiple nodes with the network
// this endpoint is only hit on the new node that is being registered on the network
app.post('/register-nodes-bulk', function(req, res) {
  const allNetworkNodes= req.body.allNetworkNodes;
  allNetworkNodes.forEach(networkNodeUrl => {
		const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
		const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
		if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(networkNodeUrl);
	});
  res.json({note : "All the nodes are registered on the node"});



});

// Adding the function parameter so we know that the api is working
app.listen(port, function() {
  console.log('listening on port ' + port);
})
