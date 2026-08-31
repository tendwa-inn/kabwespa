const app = require("./app");

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`The Kabwe Spa API running on port ${PORT}`);
});
