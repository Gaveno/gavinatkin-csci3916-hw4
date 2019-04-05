var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB, { useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);



// movie schema
var ReviewSchema = new Schema({
    name: { type: String, required: true },
    quote: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 } ,
    movie: { type: Schema.Types.ObjectId, ref: "MovieSchema" }
});

ReviewSchema.pre('save', function(next) {
    next();
});

module.exports = mongoose.model('Review', ReviewSchema);