//use express module
var express = require('express');

//create an app
var app = express();

//set app port to listen to
app.set('port', process.env.PORT || 3000);

//set up middleware
app.use( express.static(__dirname + "/public") );


//-------------------------------------------------

//use mongoose module
const mongoose = require('mongoose');

//use file module (to read in images)
var fs = require('fs');

//connect to 'images' database (if not already there, will create new database)
mongoose.connect("mongodb://localhost:27017/images", {useNewUrlParser: true, useUnifiedTopology: true} );

//create new model called 'Image' with specified schema
const Image = mongoose.model('Image', {
    imageName: String,
    imageDescription: String,
    imageFile: {data: Buffer, contentType: String}
});

//create new instance of Image
var image1_data = fs.readFileSync("public/DB_Images/jennifer-aniston-reese-witherspoon-image.jpg");
var image1_contentType = 'image/jpg';
const image1 = new Image({
    imageName: "Jennifer Aniston and Reese Witherspoon",
    imageDescription: "Jennifer Aniston and Reese Witherspoon photographed at a movie premiere.",
    imageFile: {data: image1_data, contentType: image1_contentType}
});

//create second new instance of Image
var image2_data = fs.readFileSync("public/DB_Images/henry-cavill-superman-image.jpg");
var image2_contentType = 'image/jpg';
const image2 = new Image({
    imageName: "Clark Kent",
    imageDescription: "Still of Henry Cavill as Clark Kent in Superman film.",
    imageFile: {data: image2_data, contentType: image2_contentType}
});

//clear all previously existing entries in database (to avoid creating duplicates of these images in repeated runs)
Image.deleteMany({}, function (err) {
    if (err) {
    console.log("\n--Error reading from Images collection.--\n");
    } else {
    console.log("\n--Images collection successfully cleared.--\n");
    }
 }).then( () => {
    console.log("Saving new images...");
    //save instances to 'images' db and print object to console after completed
    image1.save().then( () => console.log("\nImage 1 saved to DB: ", image1, "\n") );
    image2.save().then( () => console.log("\nImage 2 saved to DB: ", image2, "\n") );
});
//saving occurs within then() of deletion to avoid accidentally saving new images then deleting them
// - ensures runtime sequence is correct


//-------------------------------------------------
//respond to requests


//----------------------
app.get('/', function(req, res)
{
    console.log("\n-------------------------\n");
    console.log("GET request received for '/'.");
    returnContent = "<html> <body> <h3>Connected to Server successfully.</h3>";
    returnContent += " <p>Try accessing <a href='http://localhost:3000/images'>http://localhost:3000/images</a> to get to the Lab11 Images Page.</p>";
    returnContent += " </body></html>";
    res.send(returnContent);
});


//----------------------
app.get('/getAllDBImages', function(req, res)       //request sent by images.html page to get all DB images to display cards
{
    console.log("\n-------------------------\n");
    console.log("GET request received for '/getAllDBImages'.");

    //read all records in Images database
    Image.find(function (err, doc) {
        //if error, return
        if (err) 
        {
            console.log(err);
            return next(err);
        }

        console.log("Returned on find(): ", doc);

        //create JSON object to return
        var allImageRecords = []
        doc.forEach(function(element) {
            //element is a single image record

            //push all information information with formatted image data
            allImageRecords.push( {
                imageName: element.imageName,
                imageDescription: element.imageDescription,
                imageFile: {data: element.imageFile.data.toString('base64'), contentType: element.imageFile.contentType}
            });
        });
        //image records' data has now been converted from Binary Buffer to Base64 String (to display in page correctly)
        
        //console.log("\nEdited allImageRecords:", allImageRecords);    //can see that image data has now changed

        //send back response
        res.send(JSON.stringify(allImageRecords));
    });
});


//----------------------
app.get('/images', function(req, res)
{
    console.log("\n-------------------------\n");
    console.log("GET request received for '/images'.");

    //redirect to html page
    res.redirect("http://localhost:3000/images.html");
});


//----------------------
app.get('/detectEmotion', function(req, res)        //when an image is selected from images.html page to detect emotions from
{
    console.log("\n-------------------------\n");
    console.log("GET request received for '/detectEmotion'.");

    //retrieve selected image's name from request
    var selectedImageName = req.query.selectedImage;
    console.log("\n(From User on HTML) Selected Image Name:", selectedImageName);


    //redirect this request to Node-Red "/detectFaceNR" 
    res.redirect("http://localhost:1880/detectFaceNR?name=" + selectedImageName);
});


//----------------------
app.get('/getImage', function(req, res)          //used by NodeRed to get an Image by Name (for facial recognition)
{          
    console.log("\n-------------------------\n");
    console.log("GET request received for '/getImage'.");

    console.log("\n", req.query, "\n");

    //retrieve select image's name from request query
    var selectedImageName = req.query.imgName;
    console.log("\nNode-Red Request Selected Image to detect emotions from:", selectedImageName);

    //retrieve image record from the database
    Image.find( {imageName: selectedImageName}, function (err, doc) {
        //if error, return
        if (err) {
            console.log(err);
            res.send(err);
        }
        else
        {
            console.log("\nFinding Selected Image - DB Query Result: ", doc);   //doc contains one element only (name assumed to be unique)

            //"find(imageName)" here should always return a valid doc (of length 1) since we are using imageName we collected from the DB itself
            
            //return image (data with set content type for response)
            res.contentType(doc[0].imageFile.contentType);
            res.send(doc[0].imageFile.data);
        }  
    });

});


//-------------------------------------------------

//launch the server
app.listen( app.get('port'), function() {
    console.log("\nExpress started on http://localhost:" + app.get('port') + "; press Ctrl-C to terminate.\n");
} );
