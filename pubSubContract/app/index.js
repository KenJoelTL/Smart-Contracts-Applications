const dotenv = require('dotenv')
// Get env variable from env file
dotenv.config()


const Web3 = require("web3")
// set a provider
const web3 = new Web3(`${process.env.HOST}:${process.env.PORT}/v3/endpoint`)

// interacting with the smart contract
const abi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
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
  }
]


async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS
  const senderAddress = process.env.SENDER_ADDRESS
  const publisherAddress = "0xA26AF11b201035EF8CD0B4950fCfe80591c2617b"
  const senderIp = "local"
  const broker = {
    subscriber: []
  }

  // create a new contract object, providing the ABI and address
  const contract = new web3.eth.Contract(abi, contractAddress)
  const topicName = "games"

  await getTopic(contract, topicName)
  await advertise(contract, publisherAddress, topicName)
  await subscribe(contract, senderAddress, topicName)

  broker.subscriber[senderIp] = senderAddress

}

// using contract.methods to set student number's value
// contract.methods
//   .subscribe(senderAddress, topicName)
//   .send({ from: senderAddress, value: 500000000000000000 })
//   .then(console.log)

// // using contract.methods to get the student number's value
// contract.methods
//   .getStudentNumber()
//   .call()
//   .then(console.log)



async function subscribe(contract, subscriberAddress, topicName) {
  await contract.methods
    .subscribe(subscriberAddress, topicName).send({ from: subscriberAddress, value: 500000000000000000 })
  console.log(`${subscriberAddress} SUBSCRIBED TO ${topicName}`)
}

async function advertise(contract, publisherAddress, topicName) {
  console.log(contract)
  await contract.methods
    .advertise(publisherAddress, topicName).send({ from: publisherAddress, gas: 99999999, gasPrice: 5000 })
  console.log(`${publisherAddress} ADVERTISED ${topicName}`)
}

async function getTopic(contract, topicName) {
  const topic = await contract.methods.getTopic(topicName).call()
  console.log(topic)
}

main()