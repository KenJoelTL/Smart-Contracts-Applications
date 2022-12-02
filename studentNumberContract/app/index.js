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
    "inputs": [],
    "name": "student",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "studentNumber",
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
        "internalType": "uint256",
        "name": "_studentNumber",
        "type": "uint256"
      }
    ],
    "name": "setStudentNumber",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function",
    "payable": true
  },
  {
    "inputs": [],
    "name": "getStudentNumber",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const contractAddress = process.env.CONTRACT_ADDRESS
const senderAddress = process.env.SENDER_ADDRESS


// create a new contract object, providing the ABI and address
const contract = new web3.eth.Contract(abi, contractAddress)


// using contract.methods to set student number's value
contract.methods
  .setStudentNumber(1850)
  .send({ from: senderAddress, value: 5400000000000000 })
  .then(console.log)

// using contract.methods to get the student number's value
contract.methods
  .getStudentNumber()
  .call()
  .then(console.log)