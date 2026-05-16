import http from 'http';
import app from './app';
import env from './config/env';

const PORT = env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`POVA Backend running on port ${PORT}`);
});
