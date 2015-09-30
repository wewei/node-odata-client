import Service from './service';

const rootUrl = 'http://services.odata.org/V4/(S(f1eff0hckzial12qzylvckeh))/TripPinServiceRW/';

function printJSON(data) {
  console.log(JSON.stringify(data, null, 2));
  return data;
}

function printError(err) {
  console.error(err.stack);
  return err;
}

new Service(rootUrl).ready().then((service) => {
  // service.$.People.$withKey('russellwhyte').get()
  //   .then(printJSON).catch(printError);
  // service.$.People.$withKey('russellwhyte').Friends.get()
  //   .then(printJSON).catch(printError);
  let friends = service.$.People.$withKey('russellwhyte').Friends;
  friends.get().then(() => friends.$withKey('scottketchum').get())
    .then(printJSON).catch(printError);
  // service.$.People.$withKey('russellwhyte').Trips.$withKey(0).get()
  //   .then(printJSON).catch(printError);
  // service.$.People.$withKey('russellwhyte').AddressInfo.get()
  //   .then(printJSON).catch(printError);
  // service.$.People.$withKey('russellwhyte').AddressInfo.$first.get()
  //   .then(printJSON).catch(printError);
  // service.$.People.$withKey('russellwhyte').AddressInfo.$first.City.Name.get()
  //   .then(printJSON).catch(printError);
  // service.$.People.$withKey('russellwhyte').AddressInfo.$first.City.CountryRegion.get()
  //   .then(printJSON).catch(printError);
});
