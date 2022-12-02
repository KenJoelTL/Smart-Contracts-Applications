module.exports = function (deployer) {
    // Use deployer to state migration tasks.
    var StudentContract = artifacts.require("StudentContract")
    // Deploy the StudentContract contract as our only task
    deployer.deploy(StudentContract)
}
