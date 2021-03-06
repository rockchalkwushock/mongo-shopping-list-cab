global.DATABASE_URL = 'mongodb://localhost/shopping-list-test';

var chai = require('chai');
var chaiHttp = require('chai-http');

var server = require('../server.js');
var Item = require('../models/item');

var should = chai.should();
var app = server.app;

chai.use(chaiHttp);

describe('Shopping List', function() {
    before(function(done) {
        server.runServer(function() {
            Item.create({
                name: 'Broad beans'
            }, {
                name: 'Tomatoes'
            }, {
                name: 'Peppers'
            }, function() {
                done();
            });
        });
    });
    it('should list items on GET', function(done) {
        // Chai Http makes request to app.
        chai.request(app)
        // Make a GET Request to the endpoint /items.
            .get('/items')
        // When request is complete do the following code.
            .end(function(err, res) {
            should.equal(err, null);
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('array');
            res.body.should.have.length(3);
            res.body[0].should.be.a('object');
            res.body[0].should.have.property('_id');
            res.body[0].should.have.property('name');
            res.body[0]._id.should.be.a('string');
            res.body[0].name.should.be.a('string');
            res.body[0].name.should.equal('Broad beans');
            res.body[1].name.should.equal('Peppers');
            res.body[2].name.should.equal('Tomatoes');
            done();
        });
    });
    it('should add an item on POST', function(done) {
        chai.request(app).post('/items').send({'name': 'Kale'}).end(function(err, res) {
            should.equal(err, null);
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.be.a('object');
            chai.request(app).get('/items').end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.should.have.length(4);
                res.body[1].name.should.equal('Kale');
                done();
            });
        });
    });
    it('should edit an item on PUT', function(done) {
      Item.create({ name: 'Beer' }, function (err, item) {
        if (err) {

        } else {
          chai.request(app).put('/items/' + item._id).send({ name: 'Pickles'}).end(function(err, res) {
            res.should.have.status(201);
            chai.request(app).get('/items').end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.should.have.length(5);
                res.body[4].name.should.equal('Tomatoes');
                done();
            });
          });
        }
      });
    });
    it('should delete an item on DELETE', function(done) {
          chai.request(app).post('/items').send({'name': 'Grapes'}).end(function(err, res) {
            res.should.have.status(201);
            chai.request(app).delete('/items/' + res.body._id).end(function(err, res) {
                res.should.have.status(201);
                chai.request(app).get('/items').end(function(err, res) {
                    should.equal(err, null);
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.should.have.length(5); // fail
                    res.body[0].name.should.equal('Broad beans');
                    res.body[1].name.should.equal('Kale');
                    res.body[2].name.should.equal('Peppers');
                    res.body[3].name.should.equal('Pickles');
                    res.body[4].name.should.equal('Tomatoes');
                    done();
                });
            });
          });
    });
    it('should return error when body not present POST', function(done) {
        chai.request(app).post('/items').end(function(err, res) {
            should.not.equal(err, null);
            res.should.have.status(500);
            done();
        });
    });
    after(function(done) {
        Item.remove(function() {
            done();
        });
    });
});
