const redis = require('redis');
const { promisify } = require('util');
const { REDIS_URL } = require('../util/config');
const express = require('express');
const router = express.Router();

let getAsync = () => null;
let setAsync = () => null;

if (REDIS_URL) {
    const client = redis.createClient({
        url: REDIS_URL
    });

    client.on('error', err => {
        console.error('Redis client error:', err);
    });

    getAsync = promisify(client.get).bind(client);
    setAsync = promisify(client.set).bind(client);
}

const incrementTodoCounter = async (req, res, next) => {
    try {
        const currentCount = await getAsync('todo_counter') || 0;
        const newCount = parseInt(currentCount) + 1;
        await setAsync('todo_counter', newCount);
        next();
    } catch (error) {
        console.error('Error incrementing todo counter:', error);
        res.status(500).send('Internal Server Error');
    }
};

router.use('/', incrementTodoCounter);

router.get('/', async (req, res) => {
    try {
        const todoCount = await getAsync('todo_counter') || 0;

        const statistics = {
            todo_counter: todoCount
        };
        console.log(statistics);

        res.json(statistics); 
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
