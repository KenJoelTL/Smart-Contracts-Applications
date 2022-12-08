const PubSubContract = artifacts.require("PubSubContract")

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("PubSubContract", function (accounts) {
  let contract, subscriber1, subscriber2, publisher1
  let INITIAL_DEPOSIT // Subscription cost

  // runs once before the first test in this block
  before(async function () {
    contract = await PubSubContract.deployed()
    publisher1 = accounts[0]
    subscriber1 = accounts[1]
    subscriber2 = accounts[2]
    INITIAL_DEPOSIT = 500000000000000000
  })

  it("should assert true", async function () {
    return assert.isNotNull(contract)
  })

  // SUBSCRIBE
  it("it should send at least 500000000000000000 (0.5 eth) correctly when subscribe is called", async function () {
    const topicName = "sport"

    const initialBalance = await web3.eth.getBalance(subscriber1)
    await contract.subscribe(topicName, { from: subscriber1, value: INITIAL_DEPOSIT })
    const newBalance = await web3.eth.getBalance(subscriber1)

    return assert.isTrue(newBalance <= (initialBalance - INITIAL_DEPOSIT))
  })

  it("it should send an error when subscribing twice to a Topic", async function () {
    const topicName = "sport"
    try {
      const result = await contract.subscribe(topicName, { from: subscriber1, value: INITIAL_DEPOSIT })
      return assert.isFalse(result.receipt.status)
    } catch (error) {
      return assert.isTrue(error.stack.includes("You are already subscribed"))
    }
  })

  it("it should add a subscriber to a map when a subscribe subscribes", async function () {
    const topicName = "sport"
    const result = await contract.subscribe(topicName, { from: subscriber2, value: INITIAL_DEPOSIT })

    return assert.isTrue(result.receipt.status)
  })

  it("it should fail when a subscriber subscribes to a nonexistent Topic", async function () {
    const topicName = "games"
    try {
      const result = await contract.subscribe(topicName, { from: subscriber1, value: INITIAL_DEPOSIT })
      return assert.isFalse(result.receipt.status)
    } catch (error) {
      return assert.isTrue(error.stack.includes('Please Subscribe to an existing topic'))
    }
  })

  // ADVERTISE
  it("it should add an initialized topic when a advertise a new Topic", async function () {
    const topicName = "weather"

    const result = await contract.advertise(topicName, { from: publisher1 })
    const newTopic = await contract.getTopic.call(topicName)

    // console.log(result)
    // return assert.isTrue(result.receipt.status)

    return assert.ownInclude(newTopic, { name: topicName, isInitialized: true })

  })

  // GET TOPIC
  it("it should return an empty topic when getting a nonexistent Topic", async function () {
    const topicName = "games"

    const topic = await contract.getTopic.call(topicName)
    const expectedResult = { name: '', isInitialized: false }
    return assert.ownInclude(topic, expectedResult)
  })

  // PUBLISH
  it("it should add message to a list when publish to a topic", async function () {
    const topicName = "sport"
    const message = "This is a test message!"

    const messageListCount = (await contract.getMessageForSubscribers.call(topicName, subscriber1)).length
    await contract.publish(topicName, message, { from: publisher1 })
    const newMessageListCount = (await contract.getMessageForSubscribers.call(topicName, subscriber1)).length

    return assert.equal(newMessageListCount, messageListCount + 1)

  })

  // UNSUBSCRIBE
  it("it should remove subscriber from list when unsubscribe from topic", async function () {
    const topicName = "sport"

    const subListCount = (await contract.getSubscribers.call(topicName)).length
    await contract.unsubscribe(topicName)
    const newSubListCount = (await contract.getSubscribers.call(topicName)).length

    return assert.equal(newSubListCount, subListCount - 1)
  })

})
