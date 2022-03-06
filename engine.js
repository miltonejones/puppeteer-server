const connect = require('./connect'); 
const sharp = require('sharp');
const fs = require('fs');

const fileRoot =  '/home/miltonejones/projects/puppeteer-server/'

const executeCommand = async (
  puppet, 
  stepLabel, 
  stepAction, 
  stepNumber,
  recipientId,
  callback ) => {
 

  console.log ('Step %d: %s', stepNumber, stepLabel) ;

  
  const now = new Date().getTime();
  const stepName = stepLabel.replace(/\s/g, '-');

  // path to save the screenshot (unique by recipient)
  const stepPath = "./assets/" + recipientId + "-" + stepNumber + "-" + stepName + ".png"
  
  // send message before taking screenshot
  const message= `Step ${stepNumber}: ${stepLabel}`;
  callback ({ message })

  // perform step
  await stepAction(puppet);

  // *** take screenshot ***
  await puppet.screenshot({ path: stepPath });

  // create thumbnail to send with the message
  const thumbnail = await createThumbnail(stepPath);

  // upload screenshot to S3
  const s3Location = await connect.upload(fileRoot + stepPath); 

  callback ({
    message: message + ' - success', 
    thumbnail,
    elapsed: new Date().getTime() - now,
    stepLabel,
    s3Location
  })
}

exports.executeCommand = executeCommand;


// function to encode file data to base64 encoded string
function base64_encode(file) {
  // read binary data
  var bitmap = fs.readFileSync(fileRoot + file);
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString('base64');
}


const createThumbnail = (imagePath) => new Promise (yes => {
  const outputFile = imagePath + '--thumbnail.png'
  sharp(imagePath).resize({ height: 75 }).toFile(outputFile)
    .then(function(newFileInfo) {
        // newFileInfo holds the output file properties
        console.log("Success")
        yes(base64_encode(outputFile))
    })
    .catch(function(err) {
        console.log("Error occured", err);
    });
})

