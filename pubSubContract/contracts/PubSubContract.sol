pragma solidity >=0.5.0;

import "./Topic.sol";

contract PubSubContract {
     uint256 public constant INITIAL_DEPOSIT = 500000000000000000;
    uint256 public constant SUBSCRIPTION_FEE = 5000000000000000;

    event MessageReceived(
        string _topicName,
        string _message,
        address _subscriber
    );  

    mapping(string => Topic) nameToTopic;

    constructor() public {
        address subAdr = msg.sender;
        nameToTopic["sport"].name = "sport";
        nameToTopic["sport"].subscriberToBalance[subAdr] = INITIAL_DEPOSIT;
        nameToTopic["sport"].subscribers.push(subAdr);
        nameToTopic["sport"].isInitialized = true;
    }

    function advertise(address _publisher, string memory _topicName) public {
        nameToTopic[_topicName].name = _topicName;
        nameToTopic[_topicName].publishers.push(_publisher);
        nameToTopic[_topicName].isInitialized = true;
    }

    function subscribe(address _subscriber, string memory _topicName) public payable
    {
        require(
            nameToTopic[_topicName].isInitialized,
            "Please Subscribe to an existing topic"
        );
        // TODO: Déterminer s'il faut ajouter à la somme présente ou lancer un exception
        require(
            nameToTopic[_topicName].subscriberToBalance[_subscriber] <= 0,
            "You are already subscribed"
        );
        require(
            msg.value == INITIAL_DEPOSIT,
            "Please send right amount of Ethers"
        );

        nameToTopic[_topicName].subscriberToBalance[_subscriber] = msg.value;
        nameToTopic[_topicName].subscribers.push(_subscriber);
    }

    function publish(string memory _topicName, string memory _message) public {
        //TODO: seulement le advertiser qui peux publier pour son topic
        for ( uint256 _i = 0; _i < nameToTopic[_topicName].subscribers.length; _i++ ) {
            // Enregistre le messages des subscribers au topic correspondant
            address _subAddress = nameToTopic[_topicName].subscribers[_i];
            nameToTopic[_topicName].subscriberToMessage[_subAddress].push( _message );

            //  Retranche 0.005 ether du solde des subscribers au topic correspondant
            nameToTopic[_topicName].subscriberToBalance[ _subAddress ] -= SUBSCRIPTION_FEE;

            //  Informe de la transaction
            emit MessageReceived(_topicName, _message, _subAddress);

            if (nameToTopic[_topicName].subscriberToBalance[_subAddress] == 0){
                unsubscribe(payable(_subAddress), _topicName);
            }
        }
    }

    function unsubscribe(address payable _subscriber, string memory _topicName) public
    {
        // Transfert le montant restant au subscriber
        uint256 amountToRepay = nameToTopic[_topicName].subscriberToBalance[
            _subscriber
        ];
        _subscriber.transfer(amountToRepay);

        // Suppression du Subscriber au Topic
        delete nameToTopic[_topicName].subscriberToBalance[_subscriber];
        delete nameToTopic[_topicName].subscriberToMessage[_subscriber];

        uint length = nameToTopic[_topicName].subscribers.length;
        for ( uint256 _i = 0; _i < nameToTopic[_topicName].subscribers.length; _i++ ) {
            if (_subscriber == nameToTopic[_topicName].subscribers[_i]) {
                address temp = nameToTopic[_topicName].subscribers[_i];
                nameToTopic[_topicName].subscribers[_i] = nameToTopic[_topicName].subscribers[length-1];
                nameToTopic[_topicName].subscribers[length-1] = temp;
                nameToTopic[_topicName].subscribers.pop();
                break;
            }
        }
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

    function getSubscribers(string memory _topicName) public view returns (address[] memory)
    {
        return nameToTopic[_topicName].subscribers;
    }

    function getMessageForSubscribers(string memory _topicName, address _subscriber) public view returns (string[] memory)
    {
        return nameToTopic[_topicName].subscriberToMessage[_subscriber];
    }
    // function getTopicCount() public returns (uint256) {
    //     return nameToTopic;
    // }
}
