
$(document).ready(function(){

  var socket = io();
  var local_user = '';

  // Hide onlinetable & messageblock & focus on username textbox
  $('h2').hide();
  $('#messages').hide();
  $('#newmess').hide();
  $('.channel').hide();
  $('#user').focus();


// Function to join into the chat
  function joinToChannel() {
    local_user = $('#user').val();
    console.log(local_user);

    if(local_user != ''){
      socket.emit('joined', local_user);
      $('#login').detach();
      $('#messages').show();
      $('#newmess').show();
      $('h2').show()
      $('.channel').show();
      $('#m').focus();
    }
    return false;
  }

// join button clicked
  $('#join').click(joinToChannel);

// textbox return
  $('#user').keypress(function(e){
    if(e.which == 13){
      return joinToChannel();
    }
  });


// write status to the client
  function writeStatus(status) {
    $('#messages').append($('<li style="color:#33FF00;"> </li>').text(status));
    scroll();
  }
  function writePriv(msg){
    $('#messages').append($('<li style="color:red; font-style:italic;"> </li>').text(msg));
  }


// Sends chat messages & clean textbox
  $('#newmess').submit(function(){
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
      return false;
  });

// listen for new status
  socket.on('status', function(msg){
    writeStatus(msg);
  });
// listen for channel switch
  socket.on('channel.leave', function(data, t) {
    writeStatus(t + ' >> SERVER: ' + data.userName + ' left  ' + data.channelName);
  });

  socket.on('channel.join', function(data, t) {
    if (data.userName === local_user) {
      writeStatus(t + ' >> SERVER: ' + 'You have joined ' + data.channelName);
    } else {
      writeStatus(t + ' >> SERVER: ' + data.userName + ' joined ' + data.channelName);
    }
  });

// listen for new online user & refresh the table
  socket.on('updatelist', function(list){
    $('#online').empty();
    $.each(list, function(clientid, user){
      if(user.name == 'Alex' || user.name == 'alex'){
        $('#online').append($('<li style="color:#33FF00;"> </li>').text(user.name));
      }else{
          $('#online').append($('<li>').text(user.name));
      }
    });
  });

// listen for chat messages & add them to message table
  socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg));
    scroll();
  });


socket.on('private', function(data){
//  if(data.name === local_user){
  //  writePriv(data.time + ' You: (' + data.msg + ') to ' + data.user);
  //}else{
    writePriv(data.time + ' ' + data.name + ': ' + data.msg);
  //}
});





// function writeChannels(data){
//   $('.channel').append($('<li>').text(data));
// }

// socket.on('updatechannels', function(ch){
//     writeChannels(ch.eins);
//     writeChannels(ch.zwei);
//     writeChannels(ch.drei);
// });







// switch channels
  $('#ch1').click(function(){
    $('#messages').empty();
    var val = 'Channel_1';
    socket.emit('switch', val);
  });
  $('#ch2').click(function(){
    $('#messages').empty();
    var val = 'Channel_2';
    socket.emit('switch', val);
  });
  $('#ch3').click(function(){
    $('#messages').empty();
    var val = 'Channel_3';
    socket.emit('switch', val);
  });

// auto scroll to the end of page
  function scroll(){
    window.scrollTo(0, document.body.scrollHeight);
  }


});
