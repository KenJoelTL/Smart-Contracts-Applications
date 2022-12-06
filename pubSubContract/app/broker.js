const { Server } = require("socket.io")
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

async function listenToBlockchain(url, contractAddress) {
  // set a provider for web3
  const web3 = new Web3(new Web3.providers.WebsocketProvider(url))

  // create a new contract object, providing the ABI and address
  const contract = new web3.eth.Contract(abi, contractAddress)

  // listen to messages from the blockchain
  const messageWatcher = await contract.events.MessageReceived()
  messageWatcher.on("data", sendToSubscriber)
}

function sendToSubscriber(messageReceivedEvent) {
  const result = messageReceivedEvent.returnValues
  if (!(result._subscriber && broker.subscribers[result._subscriber])) return

  // Send message to client
  const payload = { topic: result.topic, message: result.message }
  const clientSocketId = broker.subscribers[result._subscriber].socketId
  broker.io.to(clientSocketId).emit('MessageReceived', payload)

  // Log when the message was sent
  console.log(`${new Date().toLocaleString()} | Message sent to ${result._subscriber}`)
}

function registerClient(socket, accountAddress) {
  // Modifie l'entrée le compte est déjà inscrit
  const exist = !!broker.subscribers[accountAddress]

  broker.subscribers[accountAddress] = {
    ip: socket.handshake.address,
    socketId: socket.id,
    socket: socket
  }

  if (exist)
    console.log(`${new Date().toLocaleString()} | Updated: ${accountAddress}`)
  else
    console.log(`${new Date().toLocaleString()} | Registered: ${accountAddress}`)

  broker.io.to(socket.id).emit('Registered', { status: 'SUCCESS' })
}

function startSocketServer(port) {
  broker.io = new Server(port)

  //attach event handler to client socket on connection
  broker.io.on("connection", (socket) => {
    // receive a registering request from the client
    socket.on("register", (accountAddress) => {
      registerClient(socket, accountAddress)
    })

    socket.on("unregister", (accountAddress) => {
      delete broker.subscribers[accountAddress]
    })
  })

  broker.io.listen(3000)
}

// Get env variable from env file
dotenv.config()

const broker = { io: null, subscribers: {} }

const socketServerPort = process.env.BROKER_PORT || 3001
const blockchainEndpoint = `${process.env.HOST}:${process.env.PORT}`
const contractAddress = process.env.CONTRACT_ADDRESS

listenToBlockchain(blockchainEndpoint, contractAddress)
startSocketServer(socketServerPort)

console.log(`WebSocket Server listening on port ${socketServerPort}...`)