var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB, { useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);

// movie schema
var MovieSchema = new Schema({
    title: { type: String, required: true, index: { unique: true } } ,
    year: { type: String, required: true },
    genre: { type: String, required: true },
    actors: [ { actorname: { type: String, required: true }, charactername: { type: String, required: true } },
              { actorname: { type: String, required: true }, charactername: { type: String, required: true } },
              { actorname: { type: String, required: true }, charactername: { type: String, required: true } }
              ],
    imageURL: { type: String, required: false }
});

MovieSchema.pre('save', function(next) {
    next();
});

module.exports = mongoose.model('Movie', MovieSchema);