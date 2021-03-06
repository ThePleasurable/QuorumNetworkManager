var exec = require('child_process').exec;
var fs = require('fs');

function createNewConstellationKeys(result, cb){
  var counter = result.constellationKeySetup.length;
  var cmd = "";
  for(var i in result.constellationKeySetup){
    var folderName = result.constellationKeySetup[i].folderName;
    var fileName = result.constellationKeySetup[i].fileName;
    cmd += 'cd '+folderName+' && constellation-enclave-keygen '+fileName+' && cd .. && '; 
  }
  cmd = cmd.substring(0, cmd.length-4);
  var child = exec(cmd);
  child.stdout.on('data', function(data){
    if(data.indexOf('Lock key pair') >= 0){
      child.stdin.write('\n');
      counter--;
      if(counter <= 0){
        cb(null, result);
      } 
    } else {
      console.log('Unexpected data:', data);
      cb(null, result);
    }
  });
  child.stderr.on('data', function(error){
    console.log('ERROR:', error);
    cb(error, null);
  });
}

function createConstellationConfig(result, cb){
  var c = result.constellationConfigSetup;
  var config = 'url = "http://'+c.localIpAddress+':'+c.localPort+'/"\n';
  config += 'port = '+c.localPort+'\n';
  config += 'socketPath = "'+c.folderName+'/socket.ipc"\n';
  config += 'otherNodeUrls = ["http://'+c.remoteIpAddress+':'+c.remotePort+'/"]\n';
  config += 'publicKeyPath = "'+c.folderName+'/'+c.publicKeyFileName+'"\n';
  config += 'privateKeyPath = "'+c.folderName+'/'+c.privateKeyFileName+'"\n';
  config += 'archivalPublicKeyPath = "'+c.folderName+'/'+c.publicArchKeyFileName+'"\n';
  config += 'archivalPrivateKeyPath = "'+c.folderName+'/'+c.privateArchKeyFileName+'"\n';
  config += 'storagePath = "'+c.folderName+'/data"';
  fs.writeFile(c.configName, config, function(err, res){
    cb(err, result);
  });
}

exports.CreateNewKeys = createNewConstellationKeys;
exports.CreateConfig = createConstellationConfig;
