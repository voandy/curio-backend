// modified the reference code to fit our system
// reference: https://github.com/expo/expo-server-sdk-node

const { Expo } = require("expo-server-sdk");

// a singleton expo class
class ExpoHandler {
  // ensure this is a singleton
  constructor() {
    if (!ExpoHandler.instance) {
      console.log("Expo-Push-Notfication-Handler is running!");
      // Create a new Expo SDK client
      this.expo = new Expo();
      // initialize required values
      this.unsentNotif = [];
      this.previousUnsentNotif = [];
      // set singleton reference to this
      ExpoHandler.instance = this;
    }
    return ExpoHandler.instance;
  }

  // takes in a new notification and add it to the unsent
  // notifications array to be processed
  addUnsentNotification(notification) {
    this.unsentNotif.push(notification);
  }

  // delete all elements in the arrays
  resetAllNotifications() {
    this.unsentNotif.splice(0, this.unsentNotif.length);
    this.previousUnsentNotif.splice(0, this.previousUnsentNotif.length);
  }

  // takes in and processes notifications to transform
  // them into messages to be sent to Expo server
  //prettier-ignore
  createMessages() {
    return new Promise((resolve, reject) => {
      let messages = [];
      try {
        // process all notifications
        for (let notif of this.unsentNotif) {
          // extract data string and transform them into json object
          let data = JSON.parse(notif.data);
          // extract user push token
          const pushToken = notif.userPushToken;
          // Check that the notification contains an user push token 
          if (!pushToken) {
            console.error(`Push token not found, user: ${notif.userId}, notif_id: ${notif._id}`);
            continue;
          }
          // Check that each notification contains a valid push token
          // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
          if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
          }
          // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
          messages.push({
            to: pushToken,
            sound: "default",
            body: data.message,
            data: data
          });
        }
        resolve(messages);
      } catch {
        console.log(`Error creating message for Expo push notifications`)
        reject(messages);
      }
    });
  }

  // The Expo push notification service accepts batches of notifications so
  // that you don't need to send 1000 requests to send 1000 notifications. We
  // recommend you batch your notifications to reduce the number of requests
  // and to compress them (notifications with similar content will get
  // compressed).
  pushToExpoServer(messages) {
    return new Promise((resolve, reject) => {
      // put together messages into chunks
      let chunks = this.expo.chunkPushNotifications(messages);
      let tickets = [];
      (async () => {
        // Send the chunks to the Expo push notification service. There are
        // different strategies you could use. A simple one is to send one chunk at a
        // time, which nicely spreads the load out over time:
        for (let chunk of chunks) {
          try {
            // send and wait for expo server responses
            let ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
            // NOTE: If a ticket contains an error code in ticket.details.error, you
            // must handle it appropriately. The error codes are listed in the Expo
            // documentation:
            // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
          } catch (error) {
            // log error for now, will implement more error handlings logic in the future
            // this is send messages error, so issues between google/apple and users will not be shown here
            console.error(error);
            reject(error);
          }
        }
        resolve(tickets);
      })();
    });
  }

  // Later, after the Expo push notification service has delivered the
  // notifications to Apple or Google (usually quickly, but allow the the service
  // up to 30 minutes when under load), a "receipt" for each notification is
  // created. The receipts will be available for at least a day; stale receipts
  // are deleted.
  //
  // The ID of each receipt is sent back in the response "ticket" for each
  // notification. In summary, sending a notification produces a ticket, which
  // contains a receipt ID you later use to get the receipt.
  //
  // The receipts may contain error codes to which you must respond. In
  // particular, Apple or Google may block apps that continue to send
  // notifications to devices that have blocked notifications or have uninstalled
  // your app. Expo does not control this policy and sends back the feedback from
  // Apple and Google so you can handle it appropriately.
  //prettier-ignore
  auditTickets(tickets) {
    return new Promise((resolve, reject) => {
      let receiptIds = [];
      // only extracts ticket with id
      for (let ticket of tickets) {
        // NOTE: Not all tickets have IDs; for example, tickets for notifications
        // that could not be enqueued will have error information and no receipt ID.
        if (ticket.id) {
          receiptIds.push(ticket.id);
        }
      }
      // put together receiptIds into chunks
      let receiptIdChunks = this.expo.chunkPushNotificationReceiptIds(
        receiptIds
      );
      (async () => {
        // Like sending notifications, there are different strategies you could use
        // to retrieve batches of receipts from the Expo service.
        for (let chunk of receiptIdChunks) {
          try {
            // request and wait for receipts from expo server
            let receipts = await this.expo.getPushNotificationReceiptsAsync(chunk);
            // format receipts to be in an array structure
            receipts = Array.isArray(receipts) ? receipts : [receipts];

            // The receipts specify whether Apple or Google successfully received the
            // notification and information about an error, if one occurred.
            for (let receipt of receipts) {
              if (receipt.status === "ok") {
                continue;
              } else if (receipt.status === "error") {
                console.error(`There was an error sending a notification: ${receipt.message}`);
                // make sure error message exists
                if (receipt.details && receipt.details.error) {
                  // The error codes are listed in the Expo documentation:
                  // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
                  // You must handle the errors appropriately.
                  console.error(`The error code is ${receipt.details.error}`);
                }
              }
            }
            resolve("ok");
          } catch (error) {
            console.error(error);
            reject("error");
          }
        }
      })();
    });
  }

  ////////// main function //////////
  // start up ExpoHandler
  // it gathers all the new notifications
  run() {
    // check if there's new notifications
    if (!this.unsentNotif.every(e => this.previousUnsentNotif.includes(e))) {
      console.log("Received one new notification!");
      console.log(this.unsentNotif);
      this.previousUnsentNotif.splice(0, this.previousUnsentNotif.length);
      this.previousUnsentNotif.push(...this.unsentNotif);
      // process and send notifications to expo
      // 1st step
      this.createMessages()
        .then(messages => {
          // 2nd step
          this.pushToExpoServer(messages)
            .then(tickets =>
              // 3rd step
              this.auditTickets(tickets).then(() => {
                // only reset all notifications for now
                this.resetAllNotifications();
              })
            )
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    }
    // repeat again in 2 seconds
    setTimeout(() => this.run(), 2000);
  }
}

const instance = new ExpoHandler();
Object.freeze(instance);

module.exports = instance;
