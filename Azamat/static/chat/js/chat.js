let chatSocket = new WebSocket('ws://' + window.location.host + '/ws/chat/');

chatSocket.onmessage = function(e) {
    let data = JSON.parse(e.data);
    // Обработка входящего сообщения
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

// Отправка сообщения
function sendMessage(message) {
    chatSocket.send(JSON.stringify({
        'message': message
    }));
}
