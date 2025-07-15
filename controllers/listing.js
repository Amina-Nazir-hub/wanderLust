const Listing = require("../models/listing");
const axios = require('axios');

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" }, }).populate("owner");
  if (!listing) {
    req.flash("error", "Your requested listing does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing , mapToken: process.env.MAP_TOKEN});
}

module.exports.createListing = async (req, res, next) => {
  // 1. Geocode location
  const location = req.body.listing.location;
  const geoResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: {
      q: location,
      format: 'json',
      limit: 1
    },
    headers: {
      'User-Agent': 'CraftCharmApp/1.0' 
    }
  });

  const coords = geoResponse.data[0]
    ? [parseFloat(geoResponse.data[0].lon), parseFloat(geoResponse.data[0].lat)]
    : [0, 0]; 

  // 2. Image
  let url = req.file.path;
  let filename = req.file.filename;

  // 3. Create listing
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  // 4. Add geometry (Point)
  newListing.geometry = {
    type: 'Point',
    coordinates: coords
  };

  await newListing.save();
  req.flash("success", "New Listing Added!");
  res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Your requested listing does not exist!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_258");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
}

// module.exports.updateListing = async (req, res) => {
//   let { id } = req.params;
//   let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//   if (typeof req.file !== "undefined") {
//     let url = req.file.path;
//     let filename = req.file.filename;
//     listing.image = { url, filename };
//     await listing.save();
//   }
//   req.flash("success", "Listing Updated!");
//   res.redirect(`/listings/${id}`);
// }

module.exports.updateListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  // 1. Geocode new location
  const location = req.body.listing.location;
  const geoResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: {
      q: location,
      format: 'json',
      limit: 1
    },
    headers: {
      'User-Agent': 'CraftCharmApp/1.0'
    }
  });

  const coords = geoResponse.data[0]
    ? [parseFloat(geoResponse.data[0].lon), parseFloat(geoResponse.data[0].lat)]
    : listing.geometry.coordinates; // fallback to old if not found

  // 2. Update listing
  listing.set(req.body.listing);
  listing.geometry = {
    type: 'Point',
    coordinates: coords
  };

  await listing.save();

  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
}