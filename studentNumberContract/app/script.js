// Get env variable from env file
const API = 'http://localhost:3000'


// using contract.methods to set student number's value
async function setStudentNumber() {
  const newStudentNumber = document.getElementById("studentNumber").value
  // using contract.methods to set student number's value
  await fetch(API + '/student-number',
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ studentNumber: newStudentNumber })
    })
  await getStudentNumber()
}

// using contract.methods to get the student number's value
async function getStudentNumber() {
  const res = await fetch(API + '/student-number')
  const body = await res.text()
  document.getElementById("current-student-number").innerText = body
  await getBalance()
}

// using contract.methods to get the student number's value
async function getBalance() {
  const res = await fetch(API + '/balance')
  const body = await res.json()
  document.getElementById("balance-eth").innerText = body.ethBalance + " eth"
  document.getElementById("balance-wei").innerText = body.weiBalance + " wei"
}
