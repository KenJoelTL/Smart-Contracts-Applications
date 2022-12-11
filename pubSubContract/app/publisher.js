const dotenv = require('dotenv')
const fs = require('fs')
const Web3 = require("web3")

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

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS
  const publisherAddress = process.env.PUBLISHER_ADDRESS

  // set a provider
  const web3 = new Web3(new Web3.providers.WebsocketProvider(`${process.env.HOST}:${process.env.PORT}/v3/endpoint`))

  // interacting with the smart contract
  const abi = getABI()

  // create a new contract object, providing the ABI and address
  const contract = new web3.eth.Contract(abi, contractAddress)
  const topicName = "games"
  const message = "Voici mon petit message pour les sub"

  await advertise(contract, publisherAddress, topicName)
  await publish(contract, publisherAddress, topicName, message)
}

async function advertise(contract, publisherAddress, topicName) {
  await contract.methods
    .advertise(topicName).send({ from: publisherAddress, gas: 99999999, gasPrice: 5000 })
  console.log(`${publisherAddress} ADVERTISED ${topicName}`)
}

async function publish(contract, publisherAddress, topicName, message) {
  await contract.methods
    .publish(topicName, message).send({ from: publisherAddress, gas: 99999999, gasPrice: 5000 })
  console.log(`${publisherAddress} PUBLISHED:  ${message}`)
}


// Get env variable from env file
dotenv.config()

main()