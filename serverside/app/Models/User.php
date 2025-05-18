<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $fillable = [
        'name',
    ];

    /**
     * ユーザー登録処理
     */
    public static function register(array $data)
    {
        return self::create([
            'name' => $data['name'],
        ]);
    }
}
