<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

if($_GET['secret'] == '0832925'){
    echo file_get_contents("firebaseDataBackup.json");
}
else{
    echo "unauthenticated request made";
}

?>