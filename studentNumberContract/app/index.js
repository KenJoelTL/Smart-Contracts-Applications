const dotenv = require('dotenv')
const fs = require('fs');
// Get env variable from env file
dotenv.config()


const Web3 = require("web3")
// set a provider
const web3 = new Web3(`${process.env.HOST}:${process.env.PORT}/v3/endpoint`)

// interacting with the smart contract
// get the abi from the build/contracts/StudentContract.json
let contractData = null;
try {
  const data = fs.readFileSync('../build/contracts/StudentContract.json', 'utf8');
  contractData = JSON.parse(data)
  console.log(data);
} catch (err) {
  console.error(err);
}

const abi = contractData["abi"];

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