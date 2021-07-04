const mongoose = require('mongoose')

mongoose
  .connect(`mongodb://${process.env.DB_USER_PASS}@localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false`, 
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    }
  )
  .then(() => console.log('Connected to MongoDb'))
  .catch((err) => console.log('Failed to connect to MongoDb', err))