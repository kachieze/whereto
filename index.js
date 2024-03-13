import express from 'express';

import routes from './routes';

const app = express();
const port = 8000;

app.use(routes);

// error handling
app.use((err, req, res, next) => {
    // Send JSON response with the error message and status code
    res.status(err.statusCode || 500).json({ error: err.message });
});

const server = app.listen(port, () => {
    console.log(`Whereto app is running...`)
});

export default server;