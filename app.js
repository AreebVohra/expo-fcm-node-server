const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const { Expo } = require('expo-server-sdk')

let expo = new Expo();

app.use(bodyParser.json())

let savedPushTokens = [];
const PORT_NUMBER = 3000;


app.get('/', (req, res) => {
    res.send('Push Notification Server Running');
});

app.post('/token', (req, res) => {
    saveToken(req.body.token);
    console.log(`Received push token, ${req.body.token}`);
    res.send(`Received push token, ${req.body.token}`);
});

app.post('/message', (req, res) => {
    handlePushTokens(req.body.message);
    console.log(`Received message, ${req.body.message}`);
    res.send(`Received message, ${req.body.message}`);
});

const saveToken = (token) => {
    console.log(token)
    if (savedPushTokens.indexOf(token === -1)) {
        savedPushTokens.push(token);
    }
}

const handlePushTokens = (message) => {
    let notifications = [];
    for (let pushToken of savedPushTokens) {
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
        }
        notifications.push({
            to: pushToken,
            sound: 'default',
            title: 'Daily Offers',
            body: 'This is a test notification',
            data: { text: message }
        })
    }

    let chunks = expo.chunkPushNotifications(notifications);
    let tickets = [];
    (async () => {
        for (let chunk of chunks) {
            try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log(ticketChunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error(error);
            }
        }
    })();
}

app.listen(PORT_NUMBER, () => {
    console.log(`Server Online on Port ${PORT_NUMBER}`);
});