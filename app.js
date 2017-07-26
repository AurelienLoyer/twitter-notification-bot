const Twit = require('twit')
const fs = require('fs');


let config;
if (fs.existsSync('./config.json')) {  
    config = require('./config.json')
}else{
    config = process.env;
}

let followers = false;
if (fs.existsSync('./followers.json')) {  
    followers = require('./followers.json')
}

const traitres = []

const T = new Twit({
  consumer_key: config['CONSUMER_KEY'],
  consumer_secret: config['CONSUMER_SECRET'],
  access_token: config['ACCESS_TOKEN'],
  access_token_secret: config['ACCESS_TOKEN_SECRET'],
  timeout_ms: 60*1000,
})

T.get('followers/ids', { screen_name: 'AurelienLoyer', count: 200 },  function (err, data, response) {

    if(followers && followers.ids.length){
        data.ids.map(id => {
            if(!followers.ids.includes(id)) {
                traitres.push(id)
            }
        })
    }
    
    data.count = data.ids.length;
    fs.writeFile('followers.json', JSON.stringify(data), 'utf8');

    if(traitres.length) notice()
    else console.log('Pas de traitre pour le moment 😈');
})

function notice(){
    const traitresPromises = []
    console.log(`J'ai trouvé ${traitres.length} traitre(s) 🔫`);

    traitres.map(traitre => {
        traitresPromises.push(T.get('users/show',{user_id: traitre}))
    })
    
    Promise.all(traitresPromises).then(resp => {
        let message = 'Les utilisateurs '
        resp.map(traitre => {
            message+= traitre.data.name + ', '
        })
        message += 'vous ont unfollow 😭'
        console.log(message)

        //envoie du message en pv sur Twitter
        T.post('direct_messages/new',{ 
            screen_name: config.twitter_screen_name, 
            text: message
        })
    });

}