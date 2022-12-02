pragma solidity >=0.5.0;

// import "./Topic.sol";

contract PubSubContract {
    struct Topic {
        string name;
        string[] messages;
        address[] publishers;
        address[] subscribers;
        mapping(address => string[]) subscriberToMessage;
        mapping(address => uint256) subscriberToBalance;
        bool isInitialized;
    }

    mapping(string => Topic) nameToTopic;

    constructor() public {
        address subAdr = msg.sender;
        nameToTopic["sport"].name = "sport";
        nameToTopic["sport"].subscriberToBalance[subAdr] = 500;
        nameToTopic["sport"].subscribers.push(subAdr);
        nameToTopic["sport"].isInitialized = true;
    }

    function advertise(address _publisher, string memory _topicName) public {
        nameToTopic[_topicName].name = _topicName;
        nameToTopic[_topicName].publishers.push(_publisher);
        nameToTopic[_topicName].isInitialized = true;
    }

    function subscribe(address _subscriber, string memory _topicName)
        public
        payable
    {
        require(
            nameToTopic[_topicName].isInitialized,
            "Please Subscribe to an existing topic"
        );
        require(
            msg.value == 500000000000000000,
            "Please send right amount of Ethers"
        );

        nameToTopic[_topicName].subscriberToBalance[_subscriber] = msg.value;
        nameToTopic[_topicName].subscribers.push(_subscriber);
    }

    function getTopic(string memory _topicName)
        public
        view
        returns (string memory name, bool isInitialized)
    {
        return (
            nameToTopic[_topicName].name,
            nameToTopic[_topicName].isInitialized
        );
    }

    // function getTopicCount() public returns (uint256) {
    //     return nameToTopic;
    // }
}
