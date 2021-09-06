<?php

use App\Models\File;
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

Route::get('/', function()
{
    return view('react');
});

Route::get('/api/files', function()
{
    return File::all();
});



Route::put('/{path}', function(Request $request, $path)
{
    $baseUrl = env('APP_URL');
    $content = $request->getContent();
    $fileHash = sha1($content);

    // add hash to name to avoid collisions
    $names = explode('/', $path);
    $name = $names[count($names) - 1];

    $hashedName = $fileHash . '_' . $name;
    $names[count($names) - 1] = $hashedName;
    $path = implode('/', $names);

    if(!Storage::disk('local')->exists($path))
    {
        $file = File::create(compact('name', 'path'));
        Storage::disk('local')->put($path, $content);
    }
    else
    {
        $file = File::where(compact('name', 'path'))->get()->first();
        $file->ref += 1;
        $file->save();
    }

    return "$baseUrl/$path";
})->where('path', '.*');

Route::get('/{path}', function(Request $request, $path)
{
    if(!Storage::disk('local')->exists($path))
        abort(404);

    // remove hash from name
    $names = explode('/', $path);
    $hashedName = $names[count($names) - 1];
    $names = explode('_', $names[count($names) - 1]);
    array_shift($names);
    $name = implode('_', $names);

    $file = File::where(compact('name', 'path'))->get()->first();
    $file->download_count += 1;
    $file->save();
    return Storage::disk('local')->download($path, $name);
})->where('path', '.*');
