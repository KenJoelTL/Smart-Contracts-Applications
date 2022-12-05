const { io } = require("socket.io-client")
const dotenv = require('dotenv')
const Web3 = require("web3")


// interacting with the smart contract
const abi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "_topicName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "_message",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "_subscriber",
        "type": "address"
      }
    ],
    "name": "MessageReceived",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "INITIAL_DEPOSIT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "SUBSCRIPTION_FEE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_publisher",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_topicName",
        "type": "string"
      }
    ],
    "name": "advertise",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_subscriber",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_topicName",
        "type": "string"
      }
    ],
    "name": "subscribe",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function",
    "payable": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_topicName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_message",
        "type": "string"
      }
    ],
    "name": "publish",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "_subscriber",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_topicName",
        "type": "string"
      }
    ],
    "name": "unsubscribe",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_topicName",
        "type": "string"
      }
    ],
    "name": "getTopic",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isInitialized",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_topicName",
        "type": "string"
      }
    ],
    "name": "getSubscribers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_topicName",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "_subscriber",
        "type": "address"
      }
    ],
    "name": "getMessageForSubscribers",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
]

async function subscribeToContract(url, contractAddress, subscriberAddress) {
  // set a provider
  const web3 = new Web3(new Web3.providers.WebsocketProvider(url))

  // create a new contract object, providing the ABI and address
  const contract = new web3.eth.Contract(abi, contractAddress)
  const topicName = "games"

  await unsubscribe(contract, subscriberAddress, topicName)
  await subscribe(contract, subscriberAddress, topicName)
  // await unsubscribe(contract, subscriberAddress, topicName)

}

function registerToBroker(brokerEndpoint, subscriberAddress) {
  const socket = io(brokerEndpoint)

  // receive a message from the server
  socket.on("Registered", onRegistered)

  // send a message to the server
  console.log(`Registering to broker at ${brokerEndpoint}`)
  socket.emit("register", subscriberAddress)

  // receive a message from the server
  console.log(`Listening to broker at ${brokerEndpoint}`)
  socket.on("MessageReceived", onMessageReceived)

}


async function subscribe(contract, subscriberAddress, topicName) {
  await contract.methods
    .subscribe(subscriberAddress, topicName)
    .send({ from: subscriberAddress, value: 500000000000000000 })
  console.log(`${subscriberAddress} SUBSCRIBED TO ${topicName}`)
}

async function unsubscribe(contract, subscriberAddress, topicName) {
  await contract.methods
    .unsubscribe(subscriberAddress, topicName)
    .send({ from: subscriberAddress, gas: 99999999, gasPrice: 5000 })
  console.log(`${subscriberAddress} UNSUBSCRIBED FROM ${topicName}`)
}

function onRegistered(response) {
  console.log("REGISTRATION STATUS: " + response.status)
}

function onMessageReceived(messageReceived) {
  console.log(messageReceived)
}


// Get env variable from env file
dotenv.config()

const brokerEndpoint = process.env.BROKER_ENDPOINT
const contractAddress = process.env.CONTRACT_ADDRESS
const subscriberAddress = process.env.SUBSCRIBER_ADDRESS
const blockchainEndpoint = `${process.env.HOST}:${process.env.PORT}`

registerToBroker(brokerEndpoint, subscriberAddress)
subscribeToContract(blockchainEndpoint, contractAddress, subscriberAddress)