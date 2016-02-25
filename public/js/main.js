
$(document).ready(function(){

  var socket = io();
  var local_user = '';

  // Set Channel_1 style
  // Hide messagetable, channellist, textbox, channellist
  // focus usernametextbox
  $('#ch1').append($('<i style="color:#33FF00;"> </i>').text('Channel_1'));
  $('h2').hide();
  $('#ul').hide();
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
      $('#ul').show();
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
    writePriv(data.time + ' ' + data.name + ': ' + data.msg);
});

// switch channels
  $('#ch1').click(function(){
    $('#messages').empty();
    var val = 'Channel_1';
    socket.emit('switch', val);
    $('#ch1').text('');
    $('#ch1').append($('<i style="color:#33FF00;"> </i>').text('Channel_1'));
    $('#ch2').text('Channel_2');
    $('#ch3').text('Channel_3');
  });

  $('#ch2').click(function(){
    $('#messages').empty();
    var val = 'Channel_2';
    socket.emit('switch', val);
    $('#ch2').text('');
    $('#ch2').append($('<i style="color:#33FF00;"> </i>').text('Channel_2'));
    $('#ch1').text('Channel_1');
    $('#ch3').text('Channel_3');
  });
  $('#ch3').click(function(){
    $('#messages').empty();
    var val = 'Channel_3';
    socket.emit('switch', val);
    $('#ch3').text('');
    $('#ch3').append($('<i style="color:#33FF00;"> </i>').text('Channel_3'));
    $('#ch2').text('Channel_2');
    $('#ch1').text('Channel_1');
  });

// auto scroll to the end of page
  function scroll(){
    window.scrollTo(0, document.body.scrollHeight);
  }


  function handleFileSelect(evt) {
    var files = evt.target.files;
    var output = [];
    var f;

    for (var i = 0; f = files[i]; i++) {
      output.push('<li>', f.name, ' (', f.size, ' bytes)', '</li>');
      var reader = new FileReader();
      reader.onload = function(file){
        return function(e){
          var span = document.createElement('span');
          span.innerHTML = ['<img class="thumb" src="', e.target.result, '" title="', file.name, '"/>'].join('');
          document.getElementById('list').insertBefore(span, null);
          var link = e.target.result;
          //sendpic(link);
          socket.emit('pic', link);
        };
      }(f);
      reader.readAsDataURL(f);
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';

  }

  function sendpic(link){
    $('#messages').append($('<li><img class="abcdefgh" src"' + link + '"/></li>'));
  }

socket.on('pic', function(link){
  sendpic(link);
});

  document.getElementById('fileA').addEventListener('change', handleFileSelect, false);


});
