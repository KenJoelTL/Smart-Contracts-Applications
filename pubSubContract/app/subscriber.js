const { io } = require("socket.io-client")
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


async function subscribeToContract(url, contractAddress, subscriberAddress) {
  // set a provider
  const web3 = new Web3(new Web3.providers.WebsocketProvider(url))

  // interacting with the smart contract
  const abi = getABI()

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
    .subscribe(topicName)
    .send({ from: subscriberAddress, gas: 95000, value: 500000000000000000 })
  console.log(`${subscriberAddress} SUBSCRIBED TO ${topicName}`)
}

async function unsubscribe(contract, subscriberAddress, topicName) {
  await contract.methods
    .unsubscribe(topicName)
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