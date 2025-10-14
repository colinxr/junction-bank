<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine if the given user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine if the given user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        return $user->id === $model->id;
    }

    /**
     * Determine if the given user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        return $user->id === $model->id;
    }

    /**
     * Determine if the given user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        return $user->id === $model->id;
    }
}

