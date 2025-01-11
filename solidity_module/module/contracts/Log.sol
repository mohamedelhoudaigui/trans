// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Log
{ 
    struct Tournament {
        uint    id;
        uint    start_time;
        string  winner;
        Match[] Matches;
    }

    struct Match {
        string  player1;
        string  player2;
        string  winner;
    }

    uint tournament_id;

    constructor()
    {
        tournament_id = 0;
    }
}
