/*import http und erstelle einen server*/
const http = require ('http');
const app = require('./app');

//mit dem Befehl process.env.port wird der default port des Systems benutzt und falls der nicht geht dann 3000
const port = process.env.PORT || 3000;

//Hier wird der server gestartet.
const server = http.createServer(app);

//Der Server hört dann sozusagen auf den port und kann daraufhin darauf reagieren.
server.listen(port);