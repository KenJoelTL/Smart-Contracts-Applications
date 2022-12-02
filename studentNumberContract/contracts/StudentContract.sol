pragma solidity >=0.5.0;
contract StudentContract {
  uint public studentNumber;
  address public student;
  mapping ( address => uint ) studentToStudentNumber;

  constructor () public {
    student = msg.sender;
    studentToStudentNumber [ student ] = 0;
  }

  function setStudentNumber ( uint _studentNumber ) public payable {
    require(msg.value == 5400000000000000, "Please send right amount of Ethers");
    studentNumber = _studentNumber;
    studentToStudentNumber [ student ] = _studentNumber;
  }

  function getStudentNumber() public returns (uint) {
    return studentNumber;
  }
}