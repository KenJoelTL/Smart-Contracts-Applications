pragma solidity >=0.5.0;
struct Topic {
    string name;
    string[] messages;
    address[] publishers;
    address[] subscribers;
    mapping(address => string[]) subscriberToMessage;
    mapping(address => uint256) subscriberToBalance;
}
