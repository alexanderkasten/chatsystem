'use strict';

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const list = {};
const moment = require('moment');
const _ = require('underscore');
const test = {};
const channels = [];
app.get('/',function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(__dirname + '/public'));

function time(){
  const time = moment().format('LTS');
  return time;
}

io.on('connection', function(socket){

  function getUsersInRoom(room) {
    let users = io.of('/');
    let usersList = [];

    for(let id in users.connected) {
      const user = users.connected[id];

      if(room) {
        if (users.connected[id].room === room) {

            usersList.push({
              name: user.name,
              room: user.room
            });
          }
        } else {

          usersList.push({
            name: user.name,
            room: user.room
          });
        }
    }

    return usersList;
  }

  socket.on('joined', function(user){
    if(user != ''){

      list[socket.id] = user;
      socket.name = user;
      test[socket.name] = socket;
      socket.room = 'Channel_1';





      // channels.push({
      //   eins: 'Channel_1',
      //   zwei: 'Channel_2',
      //   drei: 'Channel_3'
      // });
      // console.log(channels);
      // socket.room = channels.eins;





      socket.join(socket.room);
      io.emit('updatechannels', channels);
      console.log(time() + ' >> SERVER: ' + user + ' joined to Channel_1...');
      io.emit('status', time() + ' >> SERVER: ' + user + ' joined to '+ socket.room +'..').to(socket.room);
      const userList = getUsersInRoom(socket.room);
      io.to(socket.room).emit('updatelist', userList);
    }
  });



  socket.on('disconnect', function(){
      console.log(time() + ' >> SERVER: ' + list[socket.id] + ' disconnected...');
      socket.leave(socket.room);
       io.emit('status', time() + ' >> SERVER: ' + list[socket.id] + ' disconnected..').to(socket.room);
      //  delete list[socket.id];
      //  io.to(socket.room).emit('updatelist', list);
      const currentchanneluser = getUsersInRoom(socket.room);
      io.to(socket.room).emit('updatelist', '');
      io.to(socket.room).emit('updatelist', currentchanneluser);
  });

  socket.on('switch', function(newChannel) {
    var t = time();
      console.log('\n' + time() + " Leaving channel " + socket.room);
      socket.leave(socket.room);

      io.to(socket.room).emit('channel.leave', {
        channelName: socket.room,
        userName: socket.name
      }, t);

      const temporaryRoom = socket.room;
      const oldChannelUserList = getUsersInRoom(temporaryRoom);
      console.log('\n---- CURRENT OLD CHANNEL USER LIST ----');
      console.log(oldChannelUserList);
      io.to(temporaryRoom).emit('updatelist', '');
      io.to(temporaryRoom).emit('updatelist', oldChannelUserList);

      console.log(time() + " Sending notification to users in " + socket.room);
      socket.room = newChannel;
      console.log(time() + " Switching to  " + newChannel);
      socket.join(newChannel);
      console.log(time() + " Sending notification to users in " + newChannel);

      io.to(newChannel).emit('channel.join', {
        channelName: newChannel,
        userName: socket.name
      }, t);

      const newChannelUserList = getUsersInRoom(newChannel);
      console.log('\n---- CURRENT NEW CHANNEL USER LIST ----');
      console.log(newChannelUserList);
      io.to(newChannel).emit('updatelist', '');
      io.to(newChannel).emit('updatelist', newChannelUserList);
  });


socket.on('chat message', function(msg){
    if(msg != ''){
      msg = msg.trim();
      if(msg.substr(0,3) === '/p '){
        msg = msg.substr(3);
        var i = msg.indexOf(' ');
        var userr = msg.substr(0, i);
        msg = msg.substr(i + 1);

        if(userr in test){
          console.log(time() + ' PRIVATE MESSAGE >> ' + socket.name + ' to ' + userr + ': ' + msg);
          test[userr].emit('private', {msg: msg, name: socket.name, time: time()});
          //socket.name.emit('private', {msg: msg, name: socket.name,time: time(), user: userr});
        }

        }else{
        console.log(time() + ' ' + socket.room + '>> ' + socket.name + ': ' + msg);
        io.to(socket.room).emit('chat message', time() + ' ' + socket.name + ': ' + msg);

    }
    }

});



});

http.listen(3000, function(){
  console.log('listening on :3000');
});
