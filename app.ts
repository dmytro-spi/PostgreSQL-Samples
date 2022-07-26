import "dotenv/config";
import { Photo, PhotoAlbum, User } from "./models";
import pgClient from "./pgClient";

const runAppSequelizeAdv = async () => {
  // create user table
  await User.createTable();
  // create photoAlbum table
  await PhotoAlbum.createTable();
  // create photo table
  await Photo.createTable();

  // create users
  const user1 = await User.create("Dima", "d1@gmail.com");
  const user2 = await User.create("Locky", "d2@gmail.com");
  const user3 = await User.create("Jack", "d3@gmail.com");

  // create photoAlbums
  const photoAlbum1 = await PhotoAlbum.create("My flowers", user1.id);
  const photoAlbum2 = await PhotoAlbum.create("My bike", user2.id);
  const photoAlbum3 = await PhotoAlbum.create("My better days", user3.id);

  // create photos
  const photo1 = await Photo.create("flower1.jpg", "https://picsum.photos/200/300", photoAlbum1.id);
  const photo2 = await Photo.create("flower2.jpg", "https://picsum.photos/200/300", photoAlbum1.id);
  const photo3 = await Photo.create("flower3.jpg", "https://picsum.photos/200/300", photoAlbum1.id);

  const photo4 = await Photo.create("bike1.jpg", "https://picsum.photos/200/300", photoAlbum2.id);
  const photo5 = await Photo.create("bike2.jpg", "https://picsum.photos/200/300", photoAlbum2.id);
  const photo6 = await Photo.create("bike3.jpg", "https://picsum.photos/200/300", photoAlbum2.id);

  const photo7 = await Photo.create("day1.jpg", "https://picsum.photos/200/300", photoAlbum3.id);
  const photo8 = await Photo.create("day2.jpg", "https://picsum.photos/200/300", photoAlbum3.id);
  const photo9 = await Photo.create("day3.jpg", "https://picsum.photos/200/300", photoAlbum3.id);

  // get 1rts user
  const user = await User.findById(1);
  // get user photos
  const photos = await Photo.findByUserId(user.id);
  console.log("1st user photos:", photos);

  // materialized views test
  await PhotoAlbum.createPhotoCountView();
  await User.createUserPhotoCountsView();

  const photosInAlbums = await PhotoAlbum.getPhotoCounts();
  console.log("Photos in albums:", photosInAlbums);

  const usersWithPhotos = await User.getPhotoCounts();
  console.log("Users with photos:", usersWithPhotos);

  await startPostGIS();
}

const startPostGIS = async () => {
  const query = `
    ALTER TABLE photos
    ADD COLUMN "geometry" geometry;
  `;
  await pgClient.query(query);

  // add photo with geometry
  const query2 = `
    INSERT INTO photos (title, url, "geometry")
    VALUES ('flower1.jpg', 'https://picsum.photos/200/300', ST_GeomFromText('POINT(0 0)'));
  `;
  await pgClient.query(query2);
}

runAppSequelizeAdv().then(() => {
  console.log("App finished!");
});
