// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Log
{
    // types and constructor:
    struct Tournament {
        uint    id;
        uint    record_time;
        string  winner;
    }

    uint            tournament_id;
    address         owner;
    Tournament[]    record;
    mapping (uint => Tournament) record_map;

    constructor()
    {
        tournament_id = 0;
        owner = msg.sender;
    }

    // modifiers:
    modifier is_owner(address _caller) {
        require(_caller == owner, "caller is not the owner");
        _;
    }

    modifier valid_id(uint _id) {
        require(_id < tournament_id, "id is not a valid tournament id");
        _;
    }

    // events:
    event tournament_added(uint indexed tournament_id, string winner);

    // functions:
    function add_tournament(string memory _winner) external
    is_owner(msg.sender)
    {
        Tournament memory t = Tournament({
            id: tournament_id,
            record_time: block.timestamp,
            winner: _winner
        });
        record.push(t);
        record_map[tournament_id] = t;
        tournament_id++;
    }

    function get_tournament(uint _id) external view
    is_owner(msg.sender)
    valid_id(_id)
    returns(uint, uint, string memory)
    {
        Tournament memory t = record_map[_id];
        return (
            t.id,
            t.record_time,
            t.winner
        );
    }

}
