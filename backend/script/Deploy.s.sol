// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Script, console} from "forge-std/Script.sol";
import {AuthWallet} from "../src/AuthWallet.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        
        vm.startBroadcast(deployerPrivateKey);
        
        AuthWallet authWallet = new AuthWallet();
        
        console.log("AuthWallet deployed to:", address(authWallet));
        
        vm.stopBroadcast();
    }
}