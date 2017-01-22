const GeoCoder = require('node-geocoder');
var Countries = require("i18n-iso-countries");

const mapQuestBatchLimit = 100;

const GeoCoderOptions = {
    provider: 'mapquest',
    httpAdapter: 'https',
    apiKey: 'Q3T0D5kFA7uwwAwY1WArGOsDvr3GzvRj'
};
const geoCoder = GeoCoder(GeoCoderOptions);

module.exports = {
    batchProcessGeocode: (locations) => {
        return new Promise((resolve) => {
            const asyncBatchProcess = (remLocations, collectedCountries) => {
                if(remLocations.length == 0) { // base case
                    resolve(collectedCountries);
                } else {
                    var currentLocations = remLocations.slice(0, 100);
                    remLocations.splice(0, 100);
                    geoCoder.batchGeocode(currentLocations, (err, res) => {
                        var isoCollectedCountries = res.map((
                            c => c.error != undefined ? undefined : Countries.alpha2ToNumeric(c.value[0].countryCode)
                        ));
                        collectedCountries.push(...isoCollectedCountries);
                        asyncBatchProcess(remLocations, collectedCountries);
                    });
                }
            };

            asyncBatchProcess(locations, []);
        });
    }
};