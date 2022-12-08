const dotenv = require('dotenv')
// Get env variable from env file
dotenv.config()


const Web3 = require("web3")
// set a provider
const web3 = new Web3(new Web3.providers.WebsocketProvider(`${process.env.HOST}:${process.env.PORT}/v3/endpoint`))

// interacting with the smart contract
let contractData = null;
try {
  const data = fs.readFileSync('../build/contracts/PubSubContract.json', 'utf8');
  contractData = JSON.parse(data)
  console.log(data);
} catch (err) {
  console.error(err);
}

const abi = contractData["abi"];


async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS
  const publisherAddress = process.env.PUBLISHER_ADDRESS
  const subscriberAddress = process.env.SUBSCRIBER_ADDRESS

  // create a new contract object, providing the ABI and address
  const contract = new web3.eth.Contract(abi, contractAddress)
  const topicName = "games"
  const message = "Voici mon petit message pour les sub"

  // const messageWatcher = await contract.events.MessageReceived()
  // messageWatcher.on("data", onMessageReceived)

  // console.log("...watching")
  // await getTopic(contract, topicName)
  await advertise(contract, publisherAddress, topicName)
  // await subscribe(contract, subscriberAddress, topicName)
  await publish(contract, publisherAddress, topicName, message)
  // await unsubscribe(contract, subscriberAddress, topicName, message)

}

async function subscribe(contract, subscriberAddress, topicName) {
  await contract.methods
    .subscribe(subscriberAddress, topicName).send({ from: subscriberAddress, value: 500000000000000000 })
  console.log(`${subscriberAddress} SUBSCRIBED TO ${topicName}`)
}

async function advertise(contract, publisherAddress, topicName) {
  await contract.methods
    .advertise(publisherAddress, topicName).send({ from: publisherAddress, gas: 99999999, gasPrice: 5000 })
  console.log(`${publisherAddress} ADVERTISED ${topicName}`)
}

async function publish(contract, publisherAddress, topicName, message) {
  const result = await contract.methods
    .publish(topicName, message).send({ from: publisherAddress, gas: 99999999, gasPrice: 5000 })
  console.log(`${publisherAddress} PUBLISHED:  ${message}`)
}

async function unsubscribe(contract, subscriberAddress, topicName, message) {
  const result = await contract.methods
    .unsubscribe(subscriberAddress, topicName).send({ from: subscriberAddress, gas: 99999999, gasPrice: 5000 })
  console.log(`${subscriberAddress} UNSUBSCRIBED FROM ${topicName}`)
}

async function getTopic(contract, topicName) {
  const topic = await contract.methods.getTopic(topicName).call()
  // console.log(topic)
}

function onMessageReceived(messageReceived) {
  console.log("Message received!")
  // console.log(messageReceived._message)
}

main()