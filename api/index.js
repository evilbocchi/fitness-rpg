const app = require('../src/app');

const PORT = 3008;
app.server = app.listen(PORT, () => {
    console.log(`App listening to port ${PORT}`);
});


module.exports = app;