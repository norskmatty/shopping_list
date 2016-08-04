var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var config = require('./config');

var app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

var runServer = function(callback) {
    mongoose.connect(config.DATABASE_URL, function(err) {
        if (err && callback) {
            return callback(err);
        }
        
        app.listen(config.PORT, function() {
            console.log('Listening on localhost:' + config.PORT);
            if (callback) {
                callback();
            }
        });
    });
};

if(require.main === module) {
    runServer(function(err) {
        if(err) {
            console.error(err);
        }
    });
};

exports.app = app;
exports.runServer = runServer;

var Item = require('./models/item');

app.get('/items', function(req, res) {
    Item.find(function(err, items) {
        if(err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.json(items);
    });
});

app.post('/items', function(req, res) {
    Item.create({
        name: req.body.name
    }, function(err, item) {
        if (err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.status(201).json(item);
    });
});

app.delete('/items/:del', function(req, res) {
    Item.findOneAndRemove({_id: req.params.del}, function(err, item) {
        if(err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.status(200).json(item);
    });
});

app.put('/items/:put', function(req, res) {
    Item.findOneAndUpdate({_id: req.params.put}, {name: req.body.name}, function(err, item) {
        if(err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        var newitem = {_id: req.params.put, name: req.body.name};
        res.status(200).json(newitem);
    });
});

app.use('*', function(req, res) {
    res.status(404).json({
        message: 'Not Found'
    });
});