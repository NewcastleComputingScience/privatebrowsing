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
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
  <title>Cookie test</title>
  <script>
  function WriteCookie()
  {
    cookievalue= 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.';
    var start = new Date().getTime();
    for(var i = 0; i < <?php echo $_GET['numCookies'] ?>; i += 1)
    {
      document.cookie="name=" + cookievalue;
    }

    var end = new Date().getTime();
    var result = end - start ;

    document.getElementById("resultDiv").innerHTML = result;
    window.location.href="addRecord.php?browser=<?php echo $_GET['browser'] ?>&mode=<?php echo $_GET['mode'] ?>&numCookies=<?php $_GET['numCookies'] ?>&timeTaken=" + result;
  }
  </script>
</head> 
<body id="index" class="home" onLoad="WriteCookie()">
<div id="resultDiv"/>
</body>
</html>
