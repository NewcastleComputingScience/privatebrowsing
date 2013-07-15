<!--
 Cookie generation webpage for cookie timing attack.
 Copyright (C) 2013 M. J. Forshaw (m.j.forshaw@ncl.ac.uk)
 
 If you make use of any code or concepts contained within this package,
 please cite the following paper:
 
    [Paper Information]
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<?php
// configuration
$dbtype     = "mysql";
$dbhost     = "localhost";
$dbname     = "browserCookieTesting";
$dbuser     = "root";
$dbpass     = "";
 
// database connection
$conn = new PDO("mysql:host=$dbhost;dbname=$dbname",$dbuser,$dbpass);

$browser = $_GET['browser'];
$mode = $_GET['mode'];
$numCookies = $_GET['numCookies'];
$timeTaken = $_GET['timeTaken'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title><?php echo $timeTaken ?> [ResultProvided]</title>
</head> 
<body id="index" class="home">


<?php
// query
$sql = "INSERT INTO results (browser,mode,numCookies,timeTaken) VALUES (:browser,:mode,:numCookies,:timeTaken)";
$q = $conn->prepare($sql);
$q->execute(array(':browser'=>$browser,
                  ':mode'=>$mode,
                  ':numCookies'=>$numCookies,
                  ':timeTaken'=>$timeTaken));
echo print_r($q->errorInfo(),true)
?>

</body>
</html>