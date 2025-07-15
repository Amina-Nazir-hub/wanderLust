maptilersdk.config.apiKey = mapToken;

const map = new maptilersdk.Map({
  container: 'map',
  style: maptilersdk.MapStyle.STREETS,
  center: listing.geometry.coordinates,
  zoom: 9
});

const marker = new maptilersdk.Marker({ color: "red" })
  .setLngLat(listing.geometry.coordinates)
  .addTo(map);

const popup = new maptilersdk.Popup({ offset: 25 })
  .setLngLat(listing.geometry.coordinates) // 👉 set location explicitly
  .setHTML(`<h5>${listing.title}</h5><p>Exact Location will be displayed after booking</p>`)
  .addTo(map); // 👉 show popup on page load

marker.setPopup(popup); 