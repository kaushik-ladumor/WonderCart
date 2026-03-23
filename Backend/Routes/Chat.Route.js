const express = require('express');

const { chatbotHandler } = require('../AiFeatures/Chatbot');

const ChatRouter = express.Router();
ChatRouter.post('/chatbot', chatbotHandler);

module.exports = ChatRouter;