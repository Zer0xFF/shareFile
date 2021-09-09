## About shareFile

shareFile is a Laravel/React Application for easy file sharing across the web

## Setup
* clone repo `git clone https://github.com/Zer0xFF/shareFile.git`
* install dependencies
  ```
  composer install
  npm install
  ```
* setup .env
  ```
  cp .env.example .env
  php artisan key:generate
  php artisan env:set DB_CONNECTION sqlite
  php artisan env:del DB_HOST
  php artisan env:del DB_PORT
  php artisan env:del DB_DATABASE
  php artisan env:del DB_USERNAME
  php artisan env:del DB_PASSWORD
  php artisan migrate
  ```
* run mixer
  * `npm run dev`
* start laravel server
  * `php artisan serve`

## Usage
* upload a file to a specifc path
  * `curl --upload-file /path/to/file https://myserver/where/do/I/want/to/upload/`
  * this will upload `file` to `https://myserver/where/do/I/want/to/upload/{HASH}_file`*

* upload and rename a file
  * `curl --upload-file /path/to/file https://myserver/newname`
  * this will upload `file` to `https://myserver/{HASH}_newname`*

* upload a file to a specifc path and rename a file
  * you can also mix and match the 2 operations from above, by specfying a path and a new name to use 
  * `curl --upload-file /path/to/file https://myserver/upload/here/newname`
  * this will upload `file` to `https://myserver/upload/here/{HASH}_newname`*


\* Note: file name will be prefixed with hash to avoid collision/overwrites
\** Currently, on a successful upload, the response body will contain file url, not taking into account the port, this will be addressed in the future, alongside a json return for easy parsing 



## TODO
* json response
* password protected files
* password/authenticated uploads

