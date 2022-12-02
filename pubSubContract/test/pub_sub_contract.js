const PubSubContract = artifacts.require("PubSubContract")

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("PubSubContract", function (accounts) {
  let contract

  // runs once before the first test in this block
  before(async function () {
    contract = await PubSubContract.deployed()
  })

  it("should assert true", async function () {
    return assert.isNotNull(contract)
  })

  it("it should send at least 500000000000000000 correctly when subscribe is called", async function () {
    const topicName = "sport"
    const senderAddress = accounts[1]
    const amount = 500000000000000000

    const initialBalance = await web3.eth.getBalance(senderAddress)
    await contract.subscribe(senderAddress, topicName, { from: senderAddress, value: amount })
    const newBalance = await web3.eth.getBalance(senderAddress)

    return assert.isTrue(newBalance <= (initialBalance - amount))
  })

  it("it should add a subscriber to a map when a subscribe subscribes", async function () {
    const topicName = "sport"
    const senderAddress = accounts[1]
    const amount = 500000000000000000

    const result = await contract.subscribe(senderAddress, topicName, { from: senderAddress, value: amount })

    return assert.isTrue(result.receipt.status)
  })

  it("it should fail when a subscriber subscribes to a nonexistent Topic", async function () {
    const topicName = "games"
    const senderAddress = accounts[1]
    const amount = 500000000000000000

    try {
      const result = await contract.subscribe(senderAddress, topicName, { from: senderAddress, value: amount })
      return assert.isFalse(result.receipt.status)
    } catch (error) {
      return assert.isTrue(error.stack.includes('Please Subscribe to an existing topic'))
    }

  })

  it("it should add a add a topic  when a advertise a new Topic", async function () {
    const topicName = "weather"
    const senderAddress = accounts[0]

    const result = await contract.advertise(senderAddress, topicName)
    const newTopic = await contract.getTopic.call(topicName)

    console.log(result)
    // return assert.isTrue(result.receipt.status)

    return assert.ownInclude(newTopic, { name: topicName, isInitialized: true })

  })


  it("it should return an empty topic when getting a nonexistent Topic", async function () {
    const topicName = "games"

    const topic = await contract.getTopic.call(topicName)
    const expectedResult = { name: '', isInitialized: false }
    return assert.ownInclude(topic, expectedResult)
  })

})
