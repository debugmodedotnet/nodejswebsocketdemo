const express = require('express'),
      app = express(),
      server = require('http').createServer(app);
io = require('socket.io')(server);
var tradedata = require('./data');

let timerId = null,
    sockets = new Set();

var buysellarray = [
        'Buy',
        'Sell 99'
     ];
var  buysellarrayindex;
var localdata;

//This example emits to individual sockets (track by sockets Set above).
//Could also add sockets to a "room" as well using socket.join('roomId')
//https://socket.io/docs/server-api/#socket-join-room-callback

app.use(express.static(__dirname + '/dist'));

io.on('connection', socket => {

   
    console.log(`Socket ${socket.id} added`);
     localdata =  tradedata.data;
    console.log(localdata);
    sockets.add(socket);
    if (!timerId) {
        startTimer();
    }

    socket.on('clientdata', data => {
        console.log(data);
    });

    socket.on('disconnect', () => {
        console.log(`Deleting socket: ${socket.id}`);
        sockets.delete(socket);
        console.log(`Remaining sockets: ${sockets.size}`);
    });

});


function startTimer() {
    //Simulate stock data received by the server that needs 
    //to be pushed to clients
    timerId = setInterval(() => {
        if (!sockets.size) {
            clearInterval(timerId);
            timerId = null;
            console.log(`Timer stopped`);
        }
       // let value = ((Math.random() * 50) + 1).toFixed(3);
       updateData();
      
        //See comment above about using a "room" to emit to an entire
        //group of sockets if appropriate for your scenario
        //This example tracks each socket and emits to each one
        for (const s of sockets) {
           console.log(`Emitting value: ${JSON.stringify(localdata[0])}`);

            s.emit('data', { data: localdata });
        }

    }, 100);
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

function  updateData() {
    localdata.forEach(
 
      (a) => {
        buysellarrayindex = Math.floor(Math.random() * buysellarray.length);
        a.Coupon = getRandomInt(10, 500);
        a.Notional = getRandomInt(1000000, 7000000);
        a.BuySell  = buysellarray[buysellarrayindex];
      });
   }





server.listen(8081);
console.log('Visit http://localhost:8080 in your browser');
