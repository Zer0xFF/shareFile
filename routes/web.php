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
    $files = File::all();
    return view('index', compact('files'));
});


Route::put('/{name}', function(Request $request, $name)
{
    $baseUrl = env('APP_URL');
    $content = $request->getContent();
    $fileHash = sha1($content);

    // add hash to name to avoid collisions
    $names = explode('/', $name);
    $name = $fileHash . '_' . $names[count($names) - 1];
    $names[count($names) - 1] = $name;
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
})->where('name', '.*');

Route::get('/{name}', function(Request $request, $path)
{
    if(!Storage::disk('local')->exists($path))
        abort(404);

    // remove hash from name
    $names = explode('/', $path);
    $hashedName = $names[count($names) - 1];
    $names = explode('_', $names[count($names) - 1]);
    array_shift($names);
    $name = implode('_', $names);

    $file = File::where(['name' => $hashedName, 'path' => $path])->get()->first();
    $file->download_count += 1;
    $file->save();
    return Storage::disk('local')->download($path, $name);
})->where('name', '.*');
