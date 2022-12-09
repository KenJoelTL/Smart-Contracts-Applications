const { Server } = require("socket.io")
const dotenv = require('dotenv')
const Web3 = require("web3")
const fs = require('fs')


function getABI() {
  let contractData = null
  try {
    const data = fs.readFileSync('../build/contracts/PubSubContract.json', 'utf8')
    contractData = JSON.parse(data)
    return contractData["abi"]
  } catch (err) {
    console.error(err)
  }
}

async function listenToBlockchain(url, contractAddress) {
  // set a provider for web3
  const web3 = new Web3(new Web3.providers.WebsocketProvider(url))

  // interacting with the smart contract
  const abi = getABI()

  // create a new contract object, providing the ABI and address
  const contract = new web3.eth.Contract(abi, contractAddress)

  // listen to messages from the blockchain
  const messageWatcher = await contract.events.MessageReceived()
  messageWatcher.on("data", sendToSubscriber)
}

function sendToSubscriber(messageReceivedEvent) {
  const result = messageReceivedEvent.returnValues
  if (!(result.subscriber && broker.subscribers[result.subscriber])) return

  // Send message to client
  const payload = { topic: result.topic, message: result.message }
  const clientSocketId = broker.subscribers[result.subscriber].socketId
  broker.io.to(clientSocketId).emit('MessageReceived', payload)

  // Log when the message was sent
  console.log(`${new Date().toLocaleString()} | Message sent to ${result.subscriber}`)
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