npm install
bower install
npm start

DEPLOYING
when it is being depLoyed to a subfolder of the www folder on the ftp server for example www/travelblog/, 

- Styles
keep in mind that you change the asset links(to the images and font files) because the gulp angular-min task breaks them
the links should be written like this 
for the @fontface declarations: 
../fonts/blokletters-potlood-webfont.eot?#iefix

for the src:url declarations further in the stylesheet in the normalize:  
/travelblog/assets/fonts/blokletters-potlood-webfont.eot

- Template references in the controller
These should point to the subfolder on the server like:
templateUrl:"/travelblog/admin/login/login.html"

instead of the /admin/login/login.html that is used for the local server run by npm start




