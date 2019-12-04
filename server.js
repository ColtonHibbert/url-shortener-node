'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
var cors = require('cors');

var app = express();
const knex = require('knex')

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: 'Datahero45!',
    database: 'urlshortenernode'
  }
});

// db.select('*').from('urls').then(data => {
//   console.log(data);
// })

const dns = require('dns');
// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());
app.use(bodyParser.json())

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl/new', function (req, res) {
  console.log("new was pinged")
  const input = req.body.input
  console.log("here is the input", input)
  const addressRegex = /https?:\/\/www./i;
  const addressValid = input.search(addressRegex)
  console.log("the address is", addressValid)
  if(addressValid === -1) {
    res.json({"error": "invalid URL"})
    return
  }
  const dnsInput = input.replace(addressRegex, "")
  console.log("here is the input after replace method", input)
  console.log("here is the dnsinput", dnsInput)
  dns.lookup(dnsInput, (err, address, family) => {
    console.log(err, address, family)
    if(err) {
      res.json({"error": "invalid URL"})
      return
    }
  })

  let urlWasLocated = false;

  db.transaction(trx => {
    trx.select('*').from('urls').where('url', '=', input).then(data => {
      console.log(data[0])
      res.json({"original_url": data[0].url, "short_url": data[0].id })
      urlWasLocated = true;
      console.log("inside select/locate urlWasLocated", urlWasLocated)
    }).catch(err => {
      console.log('could not locate url')
      //console.log(err)
    })
  }).catch(err => {
    console.log('could not locate url')
    //console.log(err)
  })

  console.log("urlWasLocated", urlWasLocated)
  if(urlWasLocated === false) {
    db.transaction(trx => {
      trx.insert({
        url: input
      }).into('urls')
      .catch(err => {
        console.log('could not submit url')
        //console.log(err)
      })
    }).catch(err => {
        console.log('could not submit url')
        //console.log(err)
    })
  }
  
})

app.get('/api/shorturl/*', function(req, res) {
  
})
  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening to port', port);
});