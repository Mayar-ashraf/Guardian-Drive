import fetch from "node-fetch";

async function sendSignup() {
  const response = await fetch("http://localhost:3000/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "driver@gmail.com",
      fname: "driverName",
      lname: "driverLname",
      password: "123@123",
      phone: ["0112233"],
      address: "xyz",
      role: "DRIVER"
    })
  });

  const data = await response.json();
  console.log(data);
}

sendSignup();