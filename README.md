## StudentNumberContract

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

## Run the app

setup first the .env file with the sender and contract address 
then run the command 
```
npm run start
```