module.exports = function (deployer) {
  // Use deployer to state migration tasks.
  var PubSubContract = artifacts.require("PubSubContract")
  // Deploy the PubSubContract contract as our only task
  deployer.deploy(PubSubContract)
}
