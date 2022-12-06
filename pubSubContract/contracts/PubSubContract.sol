pragma solidity >=0.5.0;

import "./Topic.sol";

contract PubSubContract {
    uint256 public constant INITIAL_DEPOSIT = 500000000000000000;
    uint256 public constant SUBSCRIPTION_FEE = 5000000000000000;

    event MessageReceived(
        string topic,
        string message,
        address subscriber
    );  

    mapping(string => Topic) nameToTopic;

    constructor() public {
        address subAdr = msg.sender;
        nameToTopic["sport"].name = "sport";
        nameToTopic["sport"].subscriberToBalance[subAdr] = INITIAL_DEPOSIT;
        nameToTopic["sport"].subscribers.push(subAdr);
        nameToTopic["sport"].isInitialized = true;
    }

    function advertise(string memory _topicName) public 
    {
        if (nameToTopic[_topicName].advertisingPublisher[msg.sender]) return;

        nameToTopic[_topicName].name = _topicName;
        nameToTopic[_topicName].publishers.push(msg.sender);
        nameToTopic[_topicName].isInitialized = true;
        nameToTopic[_topicName].advertisingPublisher[msg.sender] = true;
    }

    function subscribe(string memory _topicName) public payable
    {
        require( nameToTopic[_topicName].isInitialized, "Please Subscribe to an existing topic" );
        // TODO: Déterminer s'il faut ajouter à la somme présente ou lancer un exception
        require( nameToTopic[_topicName].subscriberToBalance[msg.sender] <= 0, "You are already subscribed" );
        require( msg.value == INITIAL_DEPOSIT, "Please send right amount of Ethers" );

        nameToTopic[_topicName].subscriberToBalance[msg.sender] = msg.value;
        nameToTopic[_topicName].subscribers.push(msg.sender);
        nameToTopic[_topicName].subscriberToIndex[msg.sender] = nameToTopic[_topicName].subscribers.length-1;
    }

    function publish(string memory _topicName, string memory _message) public 
    {
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

    function unsubscribe(string memory _topicName) public
    {
        unsubscribe(payable(msg.sender), _topicName);
    }

    function unsubscribe(address payable _subscriber, string memory _topicName) private
    {
        // Transfert le montant restant au subscriber
        uint256 amountToRepay = nameToTopic[_topicName].subscriberToBalance[ _subscriber ];
        _subscriber.transfer(amountToRepay);

        // Échange de la position du subscriber et du dernier élément
        uint subIndex = nameToTopic[_topicName].subscriberToIndex[_subscriber];
        uint lastIndex = nameToTopic[_topicName].subscribers.length-1;
        address lastSubAddress = nameToTopic[_topicName].subscribers[lastIndex];

        nameToTopic[_topicName].subscribers[subIndex] = lastSubAddress;
        nameToTopic[_topicName].subscribers[lastIndex] = _subscriber;

        // Mis à jour de l'index dans le mapping du Topic
        nameToTopic[_topicName].subscriberToIndex[lastSubAddress] = subIndex;
        
        // Suppression du Subscriber des mappings du Topic
        delete nameToTopic[_topicName].subscriberToBalance[_subscriber];
        delete nameToTopic[_topicName].subscriberToMessage[_subscriber];
        delete nameToTopic[_topicName].subscriberToIndex[_subscriber];

        // Suppression du Subscriber de la liste
        nameToTopic[_topicName].subscribers.pop();

    }

    function getTopic(string memory _topicName) public view
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

    function getMessageForSubscribers(string memory _topicName, address _subscriber) public view 
        returns (string[] memory)
    {
        return nameToTopic[_topicName].subscriberToMessage[_subscriber];
    }

}
