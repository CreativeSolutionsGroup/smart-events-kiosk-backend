import exprressWS from 'express-ws';

export const initHeartbeat = (app) => {
    const ws = exprressWS(app);
    
    ws.app.ws('/heartbeat', (ws, res) => {
        ws.on('message', (message: string) => {
            ws.send('ACK Heartbeat');
        });
    })
}