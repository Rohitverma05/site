const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const path = require("path");
const https = require("https");
const axios = require("axios");


const app = express();

// for selecting multiple paths for rendering files
app.set('views', [path.join(__dirname, 'views'),path.join(__dirname, 'views/sections/')]);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("internal"));

//for display images in gallery just put url in bleow array in set of 4 in one line
var gallery = [];

//// constructor:
function flipImg(url, head, desc){
  this.url = url;
  this.head = head;
  this.desc = desc;
};


// mouse over
var hover = [];

// flip images with heading and description in set of 3 in one line
// var flipimg = [
//   {url:"assets/images/background1.jpg" ,head:"Hello" ,desc:"Rohit verma"},
//   {url:"assets/images/background2.jpg" ,head:"Hello" ,desc:"Rohit verma"},
//   {url:"assets/images/background3.jpg" ,head:"Hello" ,desc:"Rohit verma"},
//   {url:"assets/images/background2.jpg" ,head:"Hello" ,desc:"Rohit verma"},
//   {url:"assets/images/background3.jpg" ,head:"Hello" ,desc:"Rohit verma"}
// ];


// in full slider cover image Urls
var coverUrl = [
  "https://raw.githubusercontent.com/Rohitverma05/CoverPhoto/master/2.jpg",
  "https://raw.githubusercontent.com/Rohitverma05/CoverPhoto/master/1.JPG",
  "https://raw.githubusercontent.com/Rohitverma05/CoverPhoto/master/3.jpg"

]






// getting data from instagram using instagram api
const access_token = "&access_token=IGQVJWdm9jLUgtUTJKcldYSWJMaEY2VTZAHMWJ2RWF5cVprS0FNNDdCVU5LRlluWHQtWHpCQjhTaEJQUVBGM2tiX1NyUnMzTU0wV05xX3hlSlVGQ1NpMUotcTBvZA3F0Q2U4T3RjQmZAR";
user_id = "17841404090326791";
fields = "id,username";
media_fields = "id, caption";
const url = "https://graph.instagram.com/me/media?fields=id,caption"+access_token;



// (async function(){
//   const resp = await axios.get(url);
//
//   const {data} = resp.data;
//   console.log(next);
//   // console.log(mediaData);
// })();





function getmediaurl(id){
  //console.log(mediaid);

  const get_media_url = "https://graph.instagram.com/" + id + "?fields=id,media_type,media_url,username,timestamp"+ access_token;

  https.get(get_media_url, function(response){
    //console.log(response.statusMessage+ "  get media url");
    if(response.statusCode == 200){

      response.on("data",function(data){
        const InstaData = JSON.parse(data);
        //console.log(InstaData.media_url);
        gallery.push(InstaData.media_url);
        // hover.push(new flipImg(InstaData.media_url, "head", "caption"));
      });
    }else{console.log("error getting url")}

  });
};


function getmediaurlwithCaption(id, caption){
  //console.log(mediaid);

  const get_media_url = "https://graph.instagram.com/" + id + "?fields=id,media_type,media_url,username,timestamp"+ access_token;

  https.get(get_media_url, function(response){
    //console.log(response.statusMessage+ "  get media url");
    if(response.statusCode == 200){

      response.on("data",function(data){
        const InstaData = JSON.parse(data);
        //console.log(InstaData.media_url);
        // gallery.push(InstaData.media_url);
        hover.push(new flipImg(InstaData.media_url, caption, ""));
      });
    }else{console.log("error getting url")}

  });
};





// main function is below
var mediaid = [];


function LoadImage(urle){

  let insta = new Promise((resolve, reject)=>{
    https.get(urle, function(response){

      if(response.statusCode == 200){
        var data;
        response.on("data", function(chunk) {
          if (!data) { data = chunk; }
          else { data += chunk; }
        });;

        response.on("end", function(){            // yha pr data array m id h media ki and mediadata.paging.next ye next url h
          let mediadata = JSON.parse(data);
          mediaid = mediaid.concat(mediadata.data);  //concatinating the data only id and caption availabe in this array

          if(mediadata.paging.next){
            //console.log(mediadata.paging.next);
            LoadImage(mediadata.paging.next);  // recurse if next page link available

          }else{
            console.log("pushed data");
            resolve(mediaid);
          }

        });
      }else{console.log("error getting data")}

    });
  });

  insta.then((mediadata)=>{
    for(i=0; i<mediadata.length; i++){    // changing number of images for limit now   mediadata.length
      //console.log(mediadata[i].id);
      if(mediadata[i].caption){
        //console.log("with c");
        getmediaurlwithCaption(mediaid[i].id, mediadata[i].caption);
      }else{
        getmediaurl(mediadata[i].id);
        //console.log("without c");
      }
    }
    console.log("pushed Media urls");
  });

};






LoadImage(url);

app.get("/", function(req, res){
res.render("home", {imgurl: gallery, flipimg: flipimg , hover: hover, coverUrl: coverUrl});

});

app.get("/refresh", (req, res) =>{
  let refresh = new Promise((resolve, reject)=>{
    gallery = [];
    hover = [];
    console.log("cleared for new entry");
    resolve("Refreshed");
  });

  refresh.then(async function(message){
    await LoadImage(url)
    setTimeout(() => {
      console.log(message);
      res.redirect("/");
    }, 4000);

  });

});


app.listen(5000, function(){
  console.log("server started at port 3000");
});
