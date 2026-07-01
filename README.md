const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
"token": "fcm token",
"title": "Hello!",
"body": "This is a test notification."
 });

const requestOptions = {
method: "POST",
headers: myHeaders,
body: raw,
redirect: "follow"
 };

fetch("http://localhost:3000/send-notification", requestOptions)
.then((response) => response.text())
.then((result) => console.log(result))
.catch((error) => console.error(error));



const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Authorization", "Bearer access token");

const raw = JSON.stringify({
"message": {
"token": "fcm token",
"notification": {
  "title": "test from postman for android",
  "body": "foreground mode"
}
}
});

const requestOptions = {
method: "POST",
headers: myHeaders,
body: raw,
redirect: "follow"
};

fetch("https://fcm.googleapis.com/v1/projects/searchkro-d6ff3/messages:send", requestOptions)
.then((response) => response.text())
.then((result) => console.log(result))
.catch((error) => console.error(error));