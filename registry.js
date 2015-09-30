var mongoose = require('mongoose');

var db = mongoose.createConnection(process.env.SERVICES_DB_URL || 
         'mongodb://localhost:27017/test/services');                 

var Service = db.model('Service', new mongoose.Schema ({
    name: String,
    url: String,
    endpoints: [ new mongoose.Schema({
        type: String,
        url: String
    }) ],
    authorizedRoles: [ String ]
}));

function validateService(service) {
    var valid = true;

    valid = valid && service.name;
    valid = valid && service.url;

    valid = valid && Array.isArray(service.endpoints);
    if(valid) {
        service.endpoints.forEach(function(e) {
            valid = valid && e.type && e.url;
        });
    }
    
    valid = valid && Array.isArray(service.authorizedRoles);
    if(valid) {
        service.authorizedRoles.forEach(function(r) {
            valud = valid && r;
        });
    }
    
    return valid;
}

function findExisting(name, callback) {
    Service.findOne({ name: name }, callback);
}

module.exports.register = function(service, callback) {    
    if(!validateService(service)) {
        callback(new Error("Invalid service"));
    }
    
    findExisting(service.name, function(err, found) {
        if(found) {
            callback(new Error("Existing service"));
            return;
        }
        
        var dbService = new Service({
            name: service.name,
            url: service.url,
            endpoints: service.endpoints,
            authorizedRoles: service.authorizedRoles
        });
        
        dbService.save(function(err) {
            callback(err);
        });
    });
}

module.exports.unregister = function(name, callback) {
    findExisting(name, function(err, found) {
        if(!found) {
            callback(new Error("Service not found"));
            return;
        }
        
        found.remove(function(err) {
            callback(err);
        });
    });
}


