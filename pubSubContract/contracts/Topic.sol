pragma solidity >=0.5.0;
struct Topic {
    string name;
    string[] messages;
    address[] publishers;
    address[] subscribers;
    mapping(address => string[]) subscriberToMessage;
    mapping(address => uint256) subscriberToBalance;
    bool isInitialized;
    mapping(address => bool) advertisingPublisher; // pour optimiser la recherche [ O(1) ]
    mapping(address => uint256) subscriberToIndex; // pour optimiser la recherche [ O(1) ]
}
