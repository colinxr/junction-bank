<?php

declare(strict_types=1);

describe('Application', function () {
    it('returns a successful response', function () {
        $response = $this->get('/');

        $response->assertStatus(200);
    });
});
