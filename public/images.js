
function setUpImages() {
    //request all Database Images from app.js server
    $.ajax( {
        type: "GET",
        url: "http://localhost:3000/getAllDBImages",   //url of express app.js server
   
    }).done(function (response) {           //callback on success
        console.log("Response Received: ", response);
        
        //parse the returned JSON object (array of all images in DB)
        var allImagesArr = JSON.parse(response);
        console.log("JSON Parsed: ", allImagesArr);


        if (allImagesArr.length == 0)    //returned successfully, but database is empty
        {
            $("#mainDiv").append('<p style="color:darkred; font-weight:bold; font-style:italic;"> --There do not seem to be any images available to display right now. Please try again later.</p>');

            console.log("\n --RESPONSE page set to indicate empty collection (no images available).")
            console.log("\n-------------------------\n");
            return;      
        }
        
        //if length of collection is NOT zero, then go through and create image cards  (--confirmed there is at least one image to display)

        //create variable to store new html content to be added (so that .append() is only called once)
        var imagesDisplayHTML = "";

        //create row for cards grid layout
        imagesDisplayHTML = `<!--display as a grid-->
        <div class="row row-no-gutters">`;

        //for each record (image instance) returned, create new bootstrap card to display in
        for (i = 0; i < allImagesArr.length; i++)
        {
            imageRecord = allImagesArr[i];  //contains image name, description, type, and data (in base-64 format)
            console.log(imageRecord);

            //append card with image information to main div
            imagesDisplayHTML += `<div class="col-sm-6">
                <!--display a card-->
                <div class="card border-info mb-3" style="width: 18rem;">
                    <img src="data:image/` + imageRecord.imageFile.contentType + `;base64,` + imageRecord.imageFile.data + `" class="card-img-top" alt="` + imageRecord.imageName + `">
                    <div class="card-body">
                    <h5 class="card-title">` + imageRecord.imageName + `</h5>
                    <p class="card-text">` + imageRecord.imageDescription + `</p>
                    <form method="GET" action="http://localhost:3000/detectEmotion">
                            <button type="submit" name="selectedImage" id="selectedImage" value="` + imageRecord.imageName + `" class="btn btn-primary">Detect Emotions</button>
                        </form>
                    </div>
                </div>
                </div> <!--end of column-->`;
        }

        //close div of row
        imagesDisplayHTML += "</div> <!--end of row-->";

        //add new imagesDisplayHTML to main div of page
        $("#mainDiv").append(imagesDisplayHTML);

        console.log("\n --RESPONSE page set with cards of all images found in DB.");
        console.log("\n-------------------------\n");  
    
    }).fail(function (jqXHR, textStatus, errorThrown) {         //callback on error connecting
        console.log(jqXHR, "\n", textStatus, "\n", errorThrown);
        alert(textStatus + ". \n--Could not connect to Server.");
    });
}