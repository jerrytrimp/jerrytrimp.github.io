<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

if($_GET['secret'] == '0832925') {
    file_put_contents("firebaseDataBackup.json", $_GET['jsonData']);
    echo "json file updated";
}else{
    echo "unauthenticated request made";
}
?>