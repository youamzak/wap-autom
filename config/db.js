const mongoose = require('mongoose')

mongoose
  .connect(`mongodb://${process.env.DB_USER_LOGIN}:${process.env.DB_USER_PASS}${process.env.DB_HOST}/wap-automation?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false`)
  .then(() => console.log('Connected to MongoDb'))
  .catch((err) => console.log('Failed to connect to MongoDb', err))