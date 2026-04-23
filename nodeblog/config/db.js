module.exports = {
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017/nodeblog',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
};
