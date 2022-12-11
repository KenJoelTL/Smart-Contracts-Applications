const dotenv = require('dotenv')
const fs = require('fs')
// Get env variable from env file
dotenv.config()

const Web3 = require("web3")
// set a provider
const web3 = new Web3(`${process.env.HOST}:${process.env.PORT}/v3/endpoint`)

// interacting with the smart contract
// get the abi from the build/contracts/StudentContract.json
let contractData = null
try {
  const data = fs.readFileSync('../build/contracts/StudentContract.json', 'utf8')
  contractData = JSON.parse(data)
} catch (err) {
  console.error(err)
}

const abi = contractData["abi"]

const contractAddress = process.env.CONTRACT_ADDRESS
const senderAddress = process.env.SENDER_ADDRESS

// create a new contract object, providing the ABI and address
const contract = new web3.eth.Contract(abi, contractAddress)


const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

app.use(bodyParser.json({ extended: true }))
app.use(cors())
const PORT = 3000


app.get('/', (req, res) => {
  res.send('Student Contract API')
})

// using contract.methods to get the student number's value
app.get('/student-number', async (req, res) => {
  const result = await contract.methods
    .getStudentNumber()
    .call({ gas: 540000 })
  res.send(result)
})

// using contract.methods to set student number's value
app.put('/student-number', async (req, res) => {
  const newStudentNumber = req.body.studentNumber
  const cost = 5400000000000000
  // using contract.methods to set student number's value
  const result = await contract.methods
    .setStudentNumber(newStudentNumber)
    .send({ from: senderAddress, value: cost })

  res.send(result)
})


app.get('/balance', async (req, res) => {
  const weiBalance = await web3.eth.getBalance(senderAddress)
  const ethBalance = await web3.utils.fromWei(weiBalance, 'ether')
  res.send({ ethBalance, weiBalance })
})



app.listen(PORT, () => {
  console.log(`Running on PORT ${PORT}`)
})