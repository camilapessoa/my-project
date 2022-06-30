const express = require('express');
const logger = require('@my-project/logger');

const PORT = process.env.PORT || 8080;
const app = express();

app.get('/greeting',(req,res) => {
    logger.info('/ola monorepo');
    res.send({
        message: `Hello, ${req.query.name || 'World'}!`
    });
})

app.listen(PORT, () => console.log(`app na porta ${PORT}!`))