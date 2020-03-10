const fetch = require('node-fetch');
const cheerio = require('cheerio');
const db = require('./db');

const getRestaurants = async (state, city) => {
    const url = `https://www.allmenus.com/${state.toLowerCase()}/${city.toLowerCase()}/-/`;

    const response = await fetch(url);
    const body = await response.text();
    const $ = cheerio.load(body);
    const promises = [];

    $('.restaurant-list-item').each((i, item) => {
        const $item = $(item);
        const header = $item.find('h4.name');
        const name = header.text();
        const $anchor = $(header).find('a');
        const id = $anchor.attr('data-masterlist-id');

        //Finding and adding addresses to array
        const address = [];
        $item.find('div.address-container .address').each((i, part) => {
            const $part = $(part);
            address.push($part.text().trim());
        });

        const grubhub = $item.find('a.grubhub').attr('href');

        //Finding and adding food type to array
        const cousine = [];
        $item.find('p.cousine-list').each((i, geanre) => {
            const $geanre = $(geanre);
            cousine.push($geanre.text().trim());
        });

        //output arrays of data from scrapper
        const restaurant = {
            name,
            id,
            city,
            state,
            address: address.join('\n'),
            cousine: cousine.join('\n')
        };

        if (grubhub) {
            restaurant.grubhub = grubhub;
        }

        // restaurants.push(restaurant);
        const newRestaurantRef = db.collection('restaurants').doc(id);
        promises.push(newRestaurantRef.set(restaurant).catch());
    });
    await Promise.all(promises);
    console.log('Done!');
};
getRestaurants('az', 'tucson');