# Smart Contracts Applications

## Quick start 
install required libraries
```
npm install -g truffle 
npm install -g web3
```
got at the root of the project and run the command 
```
truffle compile
```
in the meantime, start ganache
then migrate the smart-contract to the desired network, edit the configuration in the truffle-config.js

```
truffle migrate --network development
```

run tests if needed
```
truffle test
```

## 1. Run the StudentContract app

setup first the .env file with the sender and contract address 
then run the command 

1. Change directory
```sh
cd studentNumberContract/app
```
2. Run the command 
```
npm run start
```

## 2. Run the Pub-Sub app

setup first the .env file with the sender and contract address then run the command

1. Change directory
```sh
cd pubSubContract/app
```
2. Run the command in 3 distinct terminals
```sh
1. node broker.js     # listen to the blockain and start a socket server
2. node publisher.js  # publish a message to the blockchain
3. node subscriber.js # subscribe to the broker via the smart-contract
```

**Before launching any project, use `npm install` to get all dependecies required to run the applications**