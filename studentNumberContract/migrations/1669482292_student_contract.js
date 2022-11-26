module.exports = function (_deployer) {
  // Use deployer to state migration tasks.
  var StudentContract = artifacts.require("StudentContract")

  module.exports = function (deployer) {
    // Deploy the StudentContract contract as our only task
    deployer.deploy(StudentContract)
  }
}
