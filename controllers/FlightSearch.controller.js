import { differenceInHours } from 'date-fns';

import flightService from '../services/FlightData.service';

const ApiError = (statusCode, message) => {
    throw Object.assign(new Error(message), { statusCode });
};

class FlightSearch {
    distances = {};

    constructor(){};

    // workers - ideally these would be in an external service
    listOfAirports = async () => {
        // if already retrieved, then serve from stored "cache"
        if (this.airports?.length) return this.airports; 

        const airports = [];
        // in the scenario, I will work with mock data
        const allData = await flightService.callRemoteEndpoint();
        allData.forEach(({ origin, destination }) => {
            airports.push(origin);
            airports.push(destination);
        });

        // make the dataset unique
        this.airports = [...new Set(airports)];
        return this.airports;
    };

    listOfCarriers = async () => {
        // if already retrieved, then serve from stored "cache"
        if (this.carriers?.length) return this.carriers;

        const allCarriers = [];
        // again I will use mock data
        const allData = await flightService.callRemoteEndpoint();
        allData.forEach(({ carrier }) => allCarriers.push(carrier));

        // make dataset unique
        this.carriers = [...new Set(allCarriers)];
        return this.carriers;
    };

    getDistanceBetweenAirports = async (code1, code2) => {
        // perform measurement and return a number
        // i would store the results in memory, to be re-used for subsequent calls
        const key = `${code1}-${code2}`;
        if (this.distances[key]) return this.distances[key];

        // mock random number
        this.distances[key] = Math.floor(Math.random() * (500 - 200 + 1)) + 200;

        return  this.distances[key]
    };

    searchFlightSchedules = async (from, to) => {
        const allSchedules = await flightService.callRemoteEndpoint();

        // ordinarily, the endpoint search would return only flights within the specified airports
        // since I am using mock data, I would be filtering all the retrieved schedules to limit to the chosen route
        const matchingRouteSchedules = allSchedules.filter(({ origin, destination }) => origin === from && destination === to);

        return matchingRouteSchedules;
    };

    scoreFlightSchedules = async (schedules, preferredCarrier, maxHours = null) => {
        // since all schedules will have the same 2 airports, the distance would always be the same
        const distance = await this.getDistanceBetweenAirports(schedules[0].origin, schedules[0].destination);

        const scoredSchedules = schedules.filter((schedule) => {
            const { departureTime, arrivalTime, carrier } = schedule;
            const carrierFactor = carrier === preferredCarrier ? 0.9 : 1.0;

            schedule.flightHours = differenceInHours(arrivalTime, departureTime);
            schedule.score = (schedule.flightHours * carrierFactor) + distance;
            
            // if maxHours was specified, then filter, otherwise, return all schedules
            return maxHours ? schedule.flightHours <= maxHours : true;
        });

        // sort scores in ascending order
        const sortedSchedules = scoredSchedules.sort((a, b) => a.score - b.score);

        return sortedSchedules;
    };

    validateData = (value, dataType, name) => {
        // method used to validate user-input.
        // the ideal solution would be to use a validation library. e.g Joi
        if (!value || typeof value !== dataType) ApiError(400, `${name} is required and must be ${dataType}`)
    };

    // API responders
    getListOfAirports = async (req, res, next) => {
        const airports = await this.listOfAirports();
        res.status(200).json(airports);
    }

    getListOfCarriers = async (req, res, next) => {
        const carriers = await this.listOfCarriers();
        res.status(200).json(carriers);
    };

    findFlights = async (req, res, next) => {
        try{
            // 1. validate inputed data, to be sure all required parameters are there
            const {origin, destination, carrier, max_hours, departs_on} = req.query;
            
            // ideally, I would use a validation library, Joi or something similar 
            [
                { name: 'origin', value: origin }, 
                { name: 'destination', value: destination },
                { name: 'carrier', value: carrier }
            ].map(({ name, value }) => this.validateData(value, 'string', name));

            if (max_hours) this.validateData(Number(max_hours), 'number', 'max_hours');

            // 2. get all flights available for the chosen routes
            // Note: I ignored departure date because the mock dataset already has a fixed date period.
            const schedules = await this.searchFlightSchedules(origin, destination);
            if (!schedules.length) ApiError(404, `No flight schedules available`);

            // 3. call ranking/scoring algorithm to score and sort flights
            const scoredSchedules = await this.scoreFlightSchedules(schedules, carrier, max_hours);

            // 4. respond with the retrieved data
            res.status(200).json(scoredSchedules);
        } catch (e) {
            next(e);
        }
    };

    saveFlights = async (req, res, next) => {
        try {
            // user information presumed to come from middleware after authentication
            const { body, user } = req;
            if (!user) ApiError(403, `Sorry, saving of flights is only available to registered users`);

            // get user's flight selection(s) from body
            // populate database with flight selections + user_id;

        } catch(e) { 
            next(e); 
        }
    };

}

// initialize controller
const flightSearchController = new FlightSearch();

export default flightSearchController;