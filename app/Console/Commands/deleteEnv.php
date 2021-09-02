<?php

namespace App\Console\Commands;

use File;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class deleteEnv extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'env:del {key}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'delete laravel environment value';

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
        $env = $env->reject(function($line) use(&$isFound, $key)
        {
            if(Str::startsWith($line, "$key="))
            {
                $isFound = true;
                Log::info('key found, removed.');
                return true;
            }
            return false;
        });
        if($isFound == false)
        {
            Log::warning('key not found.');
        }
        File::put($path, $env->implode($EOL));
        return 0;
    }
}
