import express from 'express';

// controller
import FlightSearch from './controllers/FlightSearch.controller';

const flightSearchController = new FlightSearch();

const router = express.Router();

// action endpoints
router.route('/find-flights').get(flightSearchController.findFlights);

// library/resource endpoints
router.route('/airports').get(flightSearchController.getListOfAirports);
router.route('/carriers').get(flightSearchController.getListOfCarriers);

router.route('/').all((req, res, next) => {
    res.status(200).json({ message: `welcome to whereto` })
});

export default router;