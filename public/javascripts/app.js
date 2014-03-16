window.onload = function () {
    var sendButton = document.getElementById('send'),
        messageInput = document.getElementById('message'),
        socket = io.connect('http://localhost:8080');

    sendButton.addEventListener('click', function () {
        socket.emit('message', {message: messageInput.value});
    });

    socket.on('received', function (data) {
        console.log(data.message);
        alert(data.message);
    });

    socket.on('dot', function () {
        console.log('.');
    });

    socket.on('dash', function () {
        console.log('-');
    });
};

