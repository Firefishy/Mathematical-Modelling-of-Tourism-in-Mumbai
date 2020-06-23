"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
//@ts-ignore
const fs = require('fs');
const API_key = 'AIzaSyCrtgKYTmyqAAsEbEhYL5yK0zr1qJSukkM';
let params = `query=Hotels+in+Mumbai&type=hotel&fields=name`;
const API_link = `https://maps.googleapis.com/maps/api/place/textsearch/json?key=${API_key}&`;
async function SearchByLink(link) {
    let x = await (await axios_1.default.get(link)).data;
    if (x.status === 'OK') {
        let data = x.results.map((x) => ({
            id: x.place_id,
            name: x.name,
            rating: x.rating,
            total_rating: x.user_rating_total,
            location: [x.geometry.location.lat, x.geometry.location.lng],
        }));
        return { data, npt: x.next_page_token };
    }
    else {
        console.log(x);
        return { data: undefined, npt: undefined };
    }
}
async function GetDetails(id) {
    let fields = [
        'place_id',
        'name',
        'rating',
        'user_ratings_total',
        'review',
        'geometry',
    ];
    const link = `https://maps.googleapis.com/maps/api/place/details/json?key=${API_key}&place_id=${id}&fields=${fields.toString()}`;
    let data = await (await axios_1.default.get(link)).data;
    if (data.status === 'OK') {
        let x = data.result;
        console.log(x.name);
        // console.log(x);
        return {
            id: x.place_id,
            name: x.name,
            location: [x.geometry.location.lat, x.geometry.location.lng],
            rating: x.rating,
            total_rating: x.user_ratings_total,
            reviews: x.reviews
                ? x.reviews.map((x) => ({
                    rating: x.rating,
                    text: x.text,
                }))
                : [],
        };
    }
    else {
        console.log(data.status);
        return {};
    }
}
void (async () => {
    let { data, npt } = await SearchByLink(API_link + params);
    fs.writeFileSync('./hotels.json', JSON.stringify(data, null, '\t'));
});
//ChIJCTBgusPR5zsR9jlWzqv4C3Y
void (async () => {
    let id = 'ChIJE81GBI3I5zsRJ79B69SXBNA';
    let data = await GetDetails(id);
    console.log(data);
});
//`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${}&inputtype=textquery&fields=place_id,name&key=${API_key}`
async function SearchPlace(name) {
    let formatted_Place = name.replace(/\s/g, '%20');
    let link = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${formatted_Place}&inputtype=textquery&fields=place_id,name&key=${API_key}`;
    let x = (await axios_1.default.get(link)).data.candidates[0];
    return x;
}
void (async (type) => {
    let names = fs
        .readFileSync(type, { encoding: 'utf8' })
        .trim()
        .split('\n')
        .map((x) => x.trim());
    let ids = await (await Promise.all(names.map(SearchPlace))).map((x) => x.place_id);
    let data = await Promise.all(ids.map(GetDetails));
    // console.log(ids);
    fs.writeFileSync(`./${type}.json`, JSON.stringify(data, null, '\t'));
    // fs.writeFileSync('hotels_2', JSON.stringify(ids, null, '\t'));
});
void (async () => {
    let id = await (await SearchPlace('Jama Masjid, Mumbai')).place_id;
    let { name, rating, total_rating, location, reviews } = await GetDetails(id);
    console.log([name, rating, total_rating, location[0], location[1]].join(','));
    // console.log(reviews.map((x: review) => `${x.rating},${x.text}`).join('\n'));
})();
