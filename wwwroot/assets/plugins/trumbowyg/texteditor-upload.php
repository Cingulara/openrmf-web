<?php
/*
** Upload directory
*/
define('UPLOADDIR', 'upload folder here'); // DO NOT FORGET TO SETUL UPLOAD FOLDER HERE


// Detect if it is an AJAX request
if(!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
    $file = array_shift($_FILES);
	$code = rand(1000000, 999999);
	
    if(move_uploaded_file($file['tmp_name'], UPLOADDIR .$code."-". basename($file['name']))) {		
		$file = UPLOADDIR.'/'.$code."-".$file['name'];
        $data = array(
            'success' => true,
            'file'    => $file,
        );
    } else {
        $error = true;
        $data = array(
            'message' => 'uploadError',
        );
    }
} else {
    $data = array(
        'message' => 'uploadNotAjax',
        'formData' => $_POST
    );
}
echo json_encode($data);