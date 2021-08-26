<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});


Route::put('/{name}', function(Request $request, $name)
{
    $baseUrl = env('APP_URL');
    $content = $request->getContent();
    $fileHash = sha1($content);

    // add hash to name to avoid collisions
    $names = explode('/', $name);
    $names[count($names) - 1] = $fileHash . '_' . $names[count($names) - 1];
    $name = implode('/', $names);

    if(!Storage::disk('local')->exists($name))
        Storage::disk('local')->put($name, $content);

    return "$baseUrl/$name";
})->where('name', '.*');

Route::get('/{name}', function(Request $request, $filename)
{
    if(!Storage::disk('local')->exists($filename))
        abort(404);

    // remove hash from name
    $names = explode('/', $filename);
    $names = explode('_', $names[count($names) - 1]);
    array_shift($names);
    $name = implode('_', $names);

    return Storage::disk('local')->download($filename, $name);
})->where('name', '.*');
