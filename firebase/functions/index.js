// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
//! To deploy you must be in firebase folder --> firebase deploy --only functions
//* is 
//? 

'use strict';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements


var admin = require("firebase-admin");

var serviceAccount = require("./config/v2-udemy-demo-assistant-dyndqw-firebase-adminsdk-e109g-a3e738f31b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://v2-udemy-demo-assistant-dyndqw.firebaseio.com"
});


exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  console.log('DialogFlow Intent: ' + agent.intent);
  console.log('DialogFlow Parameters: ' + agent.parameters);
  console.log('DialogFlow Music: ' + agent.parameters['Singer']);

  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function voting(agent) {
    agent.add('Voting locally for ' + agent.parameters['Singer'] );
    //save data to db
    let responseText = '';
    let singer = agent.parameters['Singer'];
    if (singer !== null) {
      let artistName = singer.replace(' ', '').toLowerCase();
      let currentArtist = admin.database().ref().child('/artists/' + aristName);

      // once method is used because without it, when we update the votes value
      // the callback will be triggered again and again in a loop and max out
      // call stack
      currentArtist.once('value', function (snapshot) {
        if (snapshot.exists() && snapshot.hasChild('votes')) {
          let obj = snapshot.val();
          currentArtist.update({
            votes: obj.votes + 1
          });
        } else {
          currentArtist.set({
            votes: 1
          });
        }
        responseText = "Thank you for voting!";
      });
    } else {
      
    }
  }
  
  // function voting(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }


   // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  // 		// ^ rich media messages 
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   // suggestion chips -- quick reply buttons.
  //   // an example of how we send them back to DialogFlow and google assistant
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  //   // ^ example of how we can change the current context in DialogFlow, useful
  //   // when we need to change the context of the conversation
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   // shows you how to use google assistant Library for sending replies
  //   // google assistant libray has methods designed specially for google
  //   // assistant and are native to it
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!'); // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Music vote', voting);
  
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
