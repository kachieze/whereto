import fs from 'fs';
import path from 'path';

class FlightService {
    constructor(){}

    callRemoteEndpoint = async () => {
        try {
            // read the JSON file synchronously
            const filePath = path.join(__dirname, '..', 'data', 'flights.json');
            const data = fs.readFileSync(filePath, 'utf8');
            
            // parse the JSON data
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading JSON file:', error);
        }
    }
}

// initialize as a singleton
const flightService = new FlightService();

export default flightService;