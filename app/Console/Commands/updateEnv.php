<?php

namespace App\Console\Commands;

use File;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class updateEnv extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'env:set {key} {value}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'update laravel environment value';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $path = __DIR__ . "/../../../.env";

        $key = $this->argument('key');
        $value = $this->argument('value');
        if(Str::of($value)->contains(' '))
        {
            $value = "\"$value\"";
        }

        $content = File::get($path);

        $match = [];
        $res = preg_match('/\R/', $content, $match);
        if($res == false)
        {
            $EOL = $match[0];
            Log::error('Could not find line ending, aborting.');
            return -1;
        }

        $isFound = false;
        $env = Str::of($content)->split('/\R/');
        $env->transform(function($line) use(&$isFound, $key, $value)
        {
            if(Str::startsWith($line, "$key="))
            {
                $line = "$key=$value";
                $isFound = true;
                Log::info('key found, updated.');
            }
            return $line;
        });
        if($isFound == false)
        {
            Log::info('key not found, added.');
            $env->push("$key=$value");
        }
        File::put($path, $env->implode($EOL));
        return 0;
    }
}
