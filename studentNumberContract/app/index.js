const Web3 = require("web3")
// set a provider in the ropsten testnet using infura
const web3 = new Web3("http://127.0.0.1:7545/v3/endpoint")

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

const address = "0x1A3D9C45208A682c6c7e9f14385258DFadD3E806"


// create a new contract object, providing the ABI and address
const contract = new web3.eth.Contract(abi, address)

// using contract.methods to get value

contract.methods
  .setStudentNumber(1)
  .send({from:"0x36a1C00C40092c51E8ceE21B1B851B94a9F9C08c" , value:5400000000000000 })
  .then(console.log)

contract.methods
  .getStudentNumber()
  .call()
  .then(console.log)